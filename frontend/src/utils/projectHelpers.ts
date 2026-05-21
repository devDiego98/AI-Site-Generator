import type { Project, ProjectIteration, ProjectVersion } from '@/types/project'

export function getIteration(
  project: Project,
  iterationId: string,
): ProjectIteration | undefined {
  return project.iterations.find((i) => i.id === iterationId)
}

export function getLatestIteration(project: Project): ProjectIteration | null {
  return project.iterations.at(-1) ?? null
}

export function getLatestVersion(
  iteration: ProjectIteration,
): ProjectVersion | null {
  return iteration.versions.at(-1) ?? null
}

export function countProjectVersions(project: Project): number {
  return project.iterations.reduce((sum, i) => sum + i.versions.length, 0)
}

export function findVersionInProject(
  project: Project,
  versionId: string,
): { iteration: ProjectIteration; version: ProjectVersion } | null {
  for (const iteration of project.iterations) {
    const version = iteration.versions.find((v) => v.id === versionId)
    if (version) {
      return { iteration, version }
    }
  }
  return null
}
