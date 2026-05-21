import styles from './PanelResizeHandle.module.css'

export interface PanelResizeHandleProps {
  onPointerDown: (event: React.MouseEvent) => void
  onDoubleClick?: () => void
  label: string
}

export function PanelResizeHandle({
  onPointerDown,
  onDoubleClick,
  label,
}: PanelResizeHandleProps) {
  return (
    <div
      className={styles.handle}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      title="Drag to resize. Double-click to reset."
      onMouseDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    />
  )
}
