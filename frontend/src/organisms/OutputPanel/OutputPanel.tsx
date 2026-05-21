import { useMemo } from 'react'
import { CodeBlock } from '@/molecules/CodeBlock'
import { ViewModeToggle } from '@/molecules/ViewModeToggle'
import { Text } from '@/atoms/Text'
import { GeneratingPreviewSkeleton } from '@/molecules/GeneratingPreviewSkeleton'
import { OutputEmptyState } from '@/organisms/OutputEmptyState'
import { PreviewFrame } from '@/organisms/PreviewFrame'
import type { ViewMode } from '@/types/viewMode'
import { buildPreviewHtml } from '@/utils/buildPreviewHtml'
import styles from './OutputPanel.module.css'

export interface OutputPanelProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  code: string | null
  /** Forces iframe remount when switching versions/projects */
  previewKey?: string | null
  isGenerating: boolean
}

export function OutputPanel({
  viewMode,
  onViewModeChange,
  code,
  previewKey,
  isGenerating,
}: OutputPanelProps) {
  const hasCode = Boolean(code)
  const previewHtml = useMemo(
    () =>
      code
        ? buildPreviewHtml(code, {
            assetsBaseUrl:
              typeof window !== 'undefined' ? window.location.origin : undefined,
          })
        : null,
    [code],
  )

  return (
    <section className={styles.panel} aria-label="Generated output">
      <div className={styles.toolbar}>
        <Text variant="label" color="secondary">
          Output
        </Text>
        <ViewModeToggle mode={viewMode} onChange={onViewModeChange} />
      </div>

      <div className={styles.canvas} role="tabpanel">
        {isGenerating ? (
          <GeneratingPreviewSkeleton />
        ) : !hasCode ? (
          <OutputEmptyState />
        ) : viewMode === 'preview' && previewHtml ? (
          <PreviewFrame key={previewKey ?? 'preview'} previewHtml={previewHtml} />
        ) : (
          <CodeBlock code={code!} />
        )}
      </div>
    </section>
  )
}
