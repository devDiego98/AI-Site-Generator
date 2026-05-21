import type {
  Project,
  ProjectIteration,
  ProjectVersion,
  VersionType,
} from '@/types/project'

const STORAGE_KEY = 'ai-ui-builder-projects'
const LEGACY_STORAGE_KEY = 'ai-ui-builder-threads'

type LegacyProject = Project & { versions?: ProjectVersion[] }

function normalizeVersionType(type: string): VersionType {
  return type === 'initial' ? 'initial' : 'modification'
}

function normalizeVersion(
  version: ProjectVersion & { type?: string },
): ProjectVersion {
  return {
    ...version,
    type: normalizeVersionType(version.type ?? 'modification'),
  }
}

function migrateLegacyVersions(project: LegacyProject): ProjectIteration[] {
  const versions = (project.versions ?? []).map(normalizeVersion)
  if (versions.length === 0) {
    return []
  }

  return [
    {
      id: crypto.randomUUID(),
      createdAt: versions[0]?.createdAt ?? project.createdAt,
      versions,
    },
  ]
}

function normalizeProject(project: LegacyProject): Project {
  const iterations =
    project.iterations?.map((iteration) => ({
      ...iteration,
      versions: iteration.versions.map(normalizeVersion),
    })) ?? migrateLegacyVersions(project)

  const lastVersion = iterations.at(-1)?.versions.at(-1)
  const updatedAt = lastVersion?.createdAt ?? project.updatedAt

  const { versions: _legacy, ...rest } = project

  return {
    ...rest,
    iterations,
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

    const parsed = JSON.parse(raw) as LegacyProject[]
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
