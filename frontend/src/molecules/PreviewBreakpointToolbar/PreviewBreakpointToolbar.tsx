import type { PreviewBreakpoint } from '@/types/previewBreakpoint'
import { PREVIEW_BREAKPOINTS } from '@/types/previewBreakpoint'
import styles from './PreviewBreakpointToolbar.module.css'

export interface PreviewBreakpointToolbarProps {
  value: PreviewBreakpoint
  onChange: (value: PreviewBreakpoint) => void
}

export function PreviewBreakpointToolbar({
  value,
  onChange,
}: PreviewBreakpointToolbarProps) {
  return (
    <div
      className={styles.toolbar}
      role="group"
      aria-label="Preview viewport size"
    >
      {PREVIEW_BREAKPOINTS.map((bp) => (
        <button
          key={bp.id}
          type="button"
          className={`${styles.button} ${value === bp.id ? styles.active : ''}`}
          aria-pressed={value === bp.id}
          onClick={() => onChange(bp.id)}
        >
          {bp.label}
        </button>
      ))}
    </div>
  )
}
