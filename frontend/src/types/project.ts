export type VersionType = 'initial' | 'modification'

export interface ProjectVersion {
  id: string
  instruction: string
  code: string
  createdAt: string
  type: VersionType
}

/** One full regenerate-from-initial-prompt branch with its own modification history. */
export interface ProjectIteration {
  id: string
  createdAt: string
  versions: ProjectVersion[]
}

export interface Project {
  id: string
  initialPrompt: string
  createdAt: string
  updatedAt: string
  iterations: ProjectIteration[]
}
