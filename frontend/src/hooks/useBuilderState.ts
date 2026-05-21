import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { generateUi, modifyUi } from '@/services/generateUiApi'
import {
  reportGenerationError,
  reportModificationError,
} from '@/utils/reportError'
import type { Project, ProjectVersion, VersionType } from '@/types/project'
import {
  loadProjects,
  removeProject,
  saveProjects,
} from '@/utils/projectStorage'
import type { ViewMode } from '@/types/viewMode'

function createVersion(
  instruction: string,
  code: string,
  type: VersionType,
): ProjectVersion {
  return {
    id: crypto.randomUUID(),
    instruction,
    code,
    createdAt: new Date().toISOString(),
    type,
  }
}

function createProject(initialPrompt: string, version: ProjectVersion): Project {
  const now = version.createdAt
  return {
    id: crypto.randomUUID(),
    initialPrompt,
    createdAt: now,
    updatedAt: now,
    versions: [version],
  }
}

function upsertProject(projects: Project[], project: Project): Project[] {
  const without = projects.filter((p) => p.id !== project.id)
  return [project, ...without]
}

export function useBuilderState() {
  const { showToast } = useToast()
  const [projects, setProjects] = useState<Project[]>(() => loadProjects())
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    saveProjects(projects)
  }, [projects])

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  )

  const activeVersion = useMemo(() => {
    if (!activeProject || !activeVersionId) {
      return null
    }
    return activeProject.versions.find((v) => v.id === activeVersionId) ?? null
  }, [activeProject, activeVersionId])

  const latestVersionId = activeProject?.versions.at(-1)?.id ?? null
  const isViewingPastVersion = Boolean(
    activeVersionId && latestVersionId && activeVersionId !== latestVersionId,
  )

  const code = activeVersion?.code ?? null
  const hasActiveProject = Boolean(activeProject && code)
  const canModify = hasActiveProject
  const showEditorColumn = isEditorOpen
  const isCreatingNew = isEditorOpen && !activeProjectId

  const addVersionToProject = useCallback(
    (
      projectId: string,
      instruction: string,
      generatedCode: string,
      type: VersionType,
    ) => {
      const version = createVersion(instruction, generatedCode, type)

      setProjects((prev) => {
        const project = prev.find((p) => p.id === projectId)
        if (!project) {
          return prev
        }

        const updated: Project = {
          ...project,
          updatedAt: version.createdAt,
          versions: [...project.versions, version],
        }

        return upsertProject(prev, updated)
      })

      setActiveVersionId(version.id)
      setViewMode('preview')
    },
    [],
  )

  const startProject = useCallback(
    (initialPrompt: string, generatedCode: string) => {
      const version = createVersion(initialPrompt, generatedCode, 'initial')
      const project = createProject(initialPrompt, version)

      setProjects((prev) => upsertProject(prev, project))
      setActiveProjectId(project.id)
      setActiveVersionId(version.id)
      setIsEditorOpen(true)
      setPrompt('')
      setViewMode('preview')
    },
    [],
  )

  const runStartProject = useCallback(async () => {
    const trimmed = prompt.trim()
    if (!trimmed) {
      setError('Please enter a prompt before generating the page.')
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const generated = await generateUi(trimmed)
      startProject(trimmed, generated.code)
    } catch (err) {
      reportGenerationError(err, showToast)
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, showToast, startProject])

  const runModification = useCallback(async () => {
    const trimmed = prompt.trim()
    if (!trimmed) {
      setError('Please describe the change you want to make.')
      return
    }

    if (!activeProject || !code) {
      setError('Start or select a project before applying modifications.')
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const generated = await modifyUi(trimmed, code)
      addVersionToProject(
        activeProject.id,
        trimmed,
        generated.code,
        'modification',
      )
      setPrompt('')
    } catch (err) {
      reportModificationError(err, showToast)
    } finally {
      setIsGenerating(false)
    }
  }, [activeProject, code, prompt, addVersionToProject, showToast])

  const selectProject = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId)
      if (!project) {
        return
      }

      const latestVersion = project.versions[project.versions.length - 1]
      setActiveProjectId(project.id)
      setActiveVersionId(latestVersion.id)
      setIsEditorOpen(true)
      setPrompt('')
      setError(null)
    },
    [projects],
  )

  const revertToVersion = useCallback(
    (projectId: string, versionId: string) => {
      const project = projects.find((p) => p.id === projectId)
      const version = project?.versions.find((v) => v.id === versionId)
      if (!project || !version) {
        return
      }

      setActiveProjectId(projectId)
      setActiveVersionId(versionId)
      setIsEditorOpen(true)
      setPrompt('')
      setError(null)
      setViewMode('preview')
    },
    [projects],
  )

  const startNewProject = useCallback(() => {
    setActiveProjectId(null)
    setActiveVersionId(null)
    setIsEditorOpen(true)
    setPrompt('')
    setError(null)
  }, [])

  const deleteProject = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId)
      if (!project) {
        return
      }

      setProjects((prev) => removeProject(prev, projectId))

      if (activeProjectId === projectId) {
        setActiveProjectId(null)
        setActiveVersionId(null)
        setIsEditorOpen(false)
        setPrompt('')
        setError(null)
      }

      showToast('Project deleted')
    },
    [projects, activeProjectId, showToast],
  )

  const handleSubmit = useCallback(() => {
    if (canModify) {
      void runModification()
    } else {
      void runStartProject()
    }
  }, [canModify, runModification, runStartProject])

  return {
    prompt,
    setPrompt,
    viewMode,
    setViewMode,
    code,
    isGenerating,
    error,
    hasActiveProject,
    canModify,
    showEditorColumn,
    isCreatingNew,
    isViewingPastVersion,
    projects,
    activeProjectId,
    activeVersionId,
    activeProject,
    activeVersion,
    handleSubmit,
    startNewProject,
    selectProject,
    revertToVersion,
    deleteProject,
  }
}
