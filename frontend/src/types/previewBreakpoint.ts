export type PreviewBreakpoint = 'desktop' | 'tablet' | 'mobile'

export const PREVIEW_BREAKPOINTS: Array<{
  id: PreviewBreakpoint
  label: string
}> = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'mobile', label: 'Mobile' },
]
