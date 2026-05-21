/** Shared API contract between NestJS backend and React frontend. */
export interface GeneratedUi {
  id: string
  prompt: string
  code: string
  createdAt: string
}

export type VisualStyle = 'auto' | 'minimal' | 'bold' | 'corporate' | 'playful'

export interface GenerateUiRequest {
  prompt: string
  visualStyle?: VisualStyle
}

export interface ModifyUiRequest {
  instruction: string
  currentCode: string
}
