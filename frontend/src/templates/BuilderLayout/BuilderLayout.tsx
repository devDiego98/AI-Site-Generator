import type { ReactNode } from 'react'
import { PanelResizeHandle } from '@/atoms/PanelResizeHandle'
import { AppHeader } from '@/organisms/AppHeader'
import { useResizableWidth } from '@/hooks/useResizableWidth'
import styles from './BuilderLayout.module.css'

const SIDEBAR_DEFAULT = 280
const SIDEBAR_MIN = 220
const SIDEBAR_MAX = 480
const EDITOR_DEFAULT = 420
const EDITOR_MIN = 300
const EDITOR_MAX = 720

export interface BuilderLayoutProps {
  projectsSlot: ReactNode
  editorSlot?: ReactNode
  outputSlot: ReactNode
}

export function BuilderLayout({
  projectsSlot,
  editorSlot,
  outputSlot,
}: BuilderLayoutProps) {
  const sidebar = useResizableWidth({
    defaultWidth: SIDEBAR_DEFAULT,
    minWidth: SIDEBAR_MIN,
    maxWidth: SIDEBAR_MAX,
    storageKey: 'builder-sidebar-width',
  })

  const editor = useResizableWidth({
    defaultWidth: EDITOR_DEFAULT,
    minWidth: EDITOR_MIN,
    maxWidth: EDITOR_MAX,
    storageKey: 'builder-editor-width',
  })

  return (
    <div className={styles.layout}>
      <AppHeader />
      <div className={styles.body}>
        <div
          className={styles.panelColumn}
          style={{ width: sidebar.width, flexBasis: sidebar.width }}
        >
          {projectsSlot}
        </div>

        <PanelResizeHandle
          label="Resize projects sidebar"
          onPointerDown={sidebar.startResize}
          onDoubleClick={sidebar.resetWidth}
        />

        {editorSlot ? (
          <>
            <div
              className={styles.panelColumn}
              style={{ width: editor.width, flexBasis: editor.width }}
            >
              {editorSlot}
            </div>
            <PanelResizeHandle
              label="Resize editor panel"
              onPointerDown={editor.startResize}
              onDoubleClick={editor.resetWidth}
            />
          </>
        ) : null}

        <div className={styles.outputColumn}>{outputSlot}</div>
      </div>
    </div>
  )
}
