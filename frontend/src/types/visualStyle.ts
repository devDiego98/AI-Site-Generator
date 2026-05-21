export type { VisualStyle } from '@ai-ui-builder/types'

export const VISUAL_STYLE_OPTIONS = [
  { value: 'auto' as const, label: 'Auto (from prompt)' },
  { value: 'minimal' as const, label: 'Minimal' },
  { value: 'bold' as const, label: 'Bold' },
  { value: 'corporate' as const, label: 'Corporate' },
  { value: 'playful' as const, label: 'Playful' },
]
