import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { generateUi, modifyUi } from '@/services/generateUiApi'
import {
  reportGenerationError,
  reportModificationError,
} from '@/utils/reportError'
import type {
  Project,
  ProjectIteration,
  ProjectVersion,
  VersionType,
} from '@/types/project'
import {
  getIteration,
  getLatestIteration,
  getLatestVersion,
} from '@/utils/projectHelpers'
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

function createIteration(initialVersion: ProjectVersion): ProjectIteration {
  return {
    id: crypto.randomUUID(),
    createdAt: initialVersion.createdAt,
    versions: [initialVersion],
  }
}

function createProject(initialPrompt: string, version: ProjectVersion): Project {
  const iteration = createIteration(version)
  const now = iteration.createdAt
  return {
    id: crypto.randomUUID(),
    initialPrompt,
    createdAt: now,
    updatedAt: now,
    iterations: [iteration],
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
  const [activeIterationId, setActiveIterationId] = useState<string | null>(
    null,
  )
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    saveProjects(projects)
  }, [projects])

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  )

  const activeIteration = useMemo(() => {
    if (!activeProject || !activeIterationId) {
      return null
    }
    return getIteration(activeProject, activeIterationId) ?? null
  }, [activeProject, activeIterationId])

  const activeVersion = useMemo(() => {
    if (!activeIteration || !activeVersionId) {
      return null
    }
    return activeIteration.versions.find((v) => v.id === activeVersionId) ?? null
  }, [activeIteration, activeVersionId])

  const latestVersionId = activeIteration?.versions.at(-1)?.id ?? null
  const isViewingPastVersion = Boolean(
    activeVersionId && latestVersionId && activeVersionId !== latestVersionId,
  )

  const code = activeVersion?.code ?? null
  const hasActiveProject = Boolean(activeProject && code)
  const canModify = hasActiveProject
  const showEditorColumn = isEditorOpen
  const isCreatingNew = isEditorOpen && !activeProjectId
  const canRegenerate = Boolean(activeProject)

  const addVersionToIteration = useCallback(
    (
      projectId: string,
      iterationId: string,
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
          iterations: project.iterations.map((iteration) =>
            iteration.id === iterationId
              ? { ...iteration, versions: [...iteration.versions, version] }
              : iteration,
          ),
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
      const iteration = project.iterations[0]

      setProjects((prev) => upsertProject(prev, project))
      setActiveProjectId(project.id)
      setActiveIterationId(iteration.id)
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

    if (!activeProject || !activeIterationId || !code) {
      setError('Start or select a project before applying modifications.')
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const generated = await modifyUi(trimmed, code)
      addVersionToIteration(
        activeProject.id,
        activeIterationId,
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
  }, [
    activeProject,
    activeIterationId,
    code,
    prompt,
    addVersionToIteration,
    showToast,
  ])

  const runRegenerate = useCallback(async () => {
    if (!activeProject) {
      return
    }

    setError(null)
    setIsRegenerating(true)

    try {
      const generated = await generateUi(activeProject.initialPrompt)
      const version = createVersion(
        activeProject.initialPrompt,
        generated.code,
        'initial',
      )
      const iteration = createIteration(version)

      setProjects((prev) => {
        const project = prev.find((p) => p.id === activeProject.id)
        if (!project) {
          return prev
        }

        const updated: Project = {
          ...project,
          updatedAt: version.createdAt,
          iterations: [...project.iterations, iteration],
        }

        return upsertProject(prev, updated)
      })

      setActiveIterationId(iteration.id)
      setActiveVersionId(version.id)
      setPrompt('')
      setViewMode('preview')
      showToast('New iteration generated')
    } catch (err) {
      reportGenerationError(err, showToast)
    } finally {
      setIsRegenerating(false)
    }
  }, [activeProject, showToast])

  const selectProject = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId)
      if (!project) {
        return
      }

      const iteration = getLatestIteration(project)
      const latestVersion = iteration ? getLatestVersion(iteration) : null
      if (!iteration || !latestVersion) {
        return
      }

      setActiveProjectId(project.id)
      setActiveIterationId(iteration.id)
      setActiveVersionId(latestVersion.id)
      setIsEditorOpen(true)
      setPrompt('')
      setError(null)
    },
    [projects],
  )

  const selectIteration = useCallback(
    (iterationId: string) => {
      if (!activeProject) {
        return
      }

      const iteration = getIteration(activeProject, iterationId)
      const latestVersion = iteration ? getLatestVersion(iteration) : null
      if (!iteration || !latestVersion) {
        return
      }

      setActiveIterationId(iterationId)
      setActiveVersionId(latestVersion.id)
      setPrompt('')
      setError(null)
      setViewMode('preview')
    },
    [activeProject],
  )

  const revertToVersion = useCallback(
    (projectId: string, versionId: string) => {
      const project = projects.find((p) => p.id === projectId)
      if (!project) {
        return
      }

      for (const iteration of project.iterations) {
        const version = iteration.versions.find((v) => v.id === versionId)
        if (version) {
          setActiveProjectId(projectId)
          setActiveIterationId(iteration.id)
          setActiveVersionId(versionId)
          setIsEditorOpen(true)
          setPrompt('')
          setError(null)
          setViewMode('preview')
          return
        }
      }
    },
    [projects],
  )

  const startNewProject = useCallback(() => {
    setActiveProjectId(null)
    setActiveIterationId(null)
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
        setActiveIterationId(null)
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
    isRegenerating,
    error,
    hasActiveProject,
    canModify,
    canRegenerate,
    showEditorColumn,
    isCreatingNew,
    isViewingPastVersion,
    projects,
    activeProjectId,
    activeIterationId,
    activeVersionId,
    activeProject,
    activeIteration,
    activeVersion,
    handleSubmit,
    runRegenerate,
    startNewProject,
    selectProject,
    selectIteration,
    revertToVersion,
    deleteProject,
  }
}
