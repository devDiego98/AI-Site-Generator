export type VersionType = 'initial' | 'modification'

export interface ProjectVersion {
  id: string
  instruction: string
  code: string
  createdAt: string
  type: VersionType
}

export interface Project {
  id: string
  initialPrompt: string
  createdAt: string
  updatedAt: string
  versions: ProjectVersion[]
}
