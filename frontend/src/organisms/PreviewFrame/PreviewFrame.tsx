import { useEffect, useRef } from 'react'
import { useToast } from '@/hooks/useToast'
import { PREVIEW_ERROR_MESSAGE_TYPE } from '@/preview/previewErrorReporter'
import { reportPreviewRenderError } from '@/utils/reportPreviewError'
import styles from './PreviewFrame.module.css'

export interface PreviewFrameProps {
  previewHtml: string
}

function isPreviewErrorMessage(data: unknown): data is { message: string; stack?: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: string }).type === PREVIEW_ERROR_MESSAGE_TYPE &&
    typeof (data as { message?: string }).message === 'string'
  )
}

export function PreviewFrame({ previewHtml }: PreviewFrameProps) {
  const { showToast } = useToast()
  const lastReportedKey = useRef<string | null>(null)

  useEffect(() => {
    lastReportedKey.current = null

    function onMessage(event: MessageEvent) {
      if (!isPreviewErrorMessage(event.data)) {
        return
      }

      const key = `${event.data.message}\n${event.data.stack ?? ''}`
      if (lastReportedKey.current === key) {
        return
      }
      lastReportedKey.current = key

      reportPreviewRenderError(
        { message: event.data.message, stack: event.data.stack },
        showToast,
      )
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [previewHtml, showToast])

  return (
    <iframe
      title="Generated UI preview"
      className={styles.frame}
      sandbox="allow-scripts"
      srcDoc={previewHtml}
    />
  )
}
