import { useMemo, useState } from 'react'
import { CodeBlock } from '@/molecules/CodeBlock'
import { PreviewBreakpointToolbar } from '@/molecules/PreviewBreakpointToolbar'
import { PreviewErrorBanner } from '@/molecules/PreviewErrorBanner'
import { ViewModeToggle } from '@/molecules/ViewModeToggle'
import { Text } from '@/atoms/Text'
import { GeneratingPreviewSkeleton } from '@/molecules/GeneratingPreviewSkeleton'
import { OutputEmptyState } from '@/organisms/OutputEmptyState'
import { PreviewFrame } from '@/organisms/PreviewFrame'
import type { ViewMode } from '@/types/viewMode'
import type { PreviewBreakpoint } from '@/types/previewBreakpoint'
import { buildPreviewHtml } from '@/utils/buildPreviewHtml'
import styles from './OutputPanel.module.css'

export interface OutputPanelProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  code: string | null
  /** Forces iframe remount when switching versions/projects */
  previewKey?: string | null
  isGenerating: boolean
  previewError: string | null
  onPreviewError: (message: string | null) => void
  onRegenerate?: () => void
}

export function OutputPanel({
  viewMode,
  onViewModeChange,
  code,
  previewKey,
  isGenerating,
  previewError,
  onPreviewError,
  onRegenerate,
}: OutputPanelProps) {
  const [breakpoint, setBreakpoint] = useState<PreviewBreakpoint>('desktop')
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
        <div className={styles.toolbarActions}>
          {viewMode === 'preview' && hasCode ? (
            <PreviewBreakpointToolbar
              value={breakpoint}
              onChange={setBreakpoint}
            />
          ) : null}
          <ViewModeToggle mode={viewMode} onChange={onViewModeChange} />
        </div>
      </div>

      <div className={styles.canvas} role="tabpanel">
        {previewError && viewMode === 'preview' && hasCode ? (
          <PreviewErrorBanner
            detail={previewError}
            onDismiss={() => onPreviewError(null)}
            onRegenerate={onRegenerate}
          />
        ) : null}

        {isGenerating ? (
          <GeneratingPreviewSkeleton />
        ) : !hasCode ? (
          <OutputEmptyState />
        ) : viewMode === 'preview' && previewHtml ? (
          <div
            className={styles.previewViewport}
            data-breakpoint={breakpoint}
          >
            <div className={styles.previewFrame}>
              <PreviewFrame
                key={previewKey ?? 'preview'}
                previewHtml={previewHtml}
                onRenderError={(detail) => onPreviewError(detail.message)}
              />
            </div>
          </div>
        ) : (
          <CodeBlock code={code!} />
        )}
      </div>
    </section>
  )
}
