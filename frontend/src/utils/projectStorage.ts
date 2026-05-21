import type { Project, ProjectVersion, VersionType } from '@/types/project'

const STORAGE_KEY = 'ai-ui-builder-projects'
const LEGACY_STORAGE_KEY = 'ai-ui-builder-threads'

function normalizeVersionType(type: string): VersionType {
  return type === 'initial' ? 'initial' : 'modification'
}

function normalizeVersion(version: ProjectVersion & { type?: string }): ProjectVersion {
  return {
    ...version,
    type: normalizeVersionType(version.type ?? 'modification'),
  }
}

function normalizeProject(project: Project): Project {
  const versions = project.versions.map(normalizeVersion)
  const updatedAt = versions[versions.length - 1]?.createdAt ?? project.updatedAt

  return {
    ...project,
    versions,
    updatedAt,
  }
}

export function loadProjects(): Project[] {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as Project[]
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map(normalizeProject)
  } catch {
    return []
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function removeProject(projects: Project[], projectId: string): Project[] {
  return projects.filter((project) => project.id !== projectId)
}
