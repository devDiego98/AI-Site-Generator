import { TabGroup } from '@/molecules/TabGroup'
import type { ViewMode } from '@/types/viewMode'

const VIEW_TABS = [
  { id: 'preview' as const, label: 'Preview' },
  { id: 'code' as const, label: 'Code' },
]

export interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <TabGroup
      tabs={VIEW_TABS}
      activeId={mode}
      onChange={(id) => onChange(id as ViewMode)}
      ariaLabel="Output view mode"
    />
  )
}
