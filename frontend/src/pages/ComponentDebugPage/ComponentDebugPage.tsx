import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/atoms/Button'
import { Textarea } from '@/atoms/Textarea'
import { PreviewFrame } from '@/organisms/PreviewFrame'
import { buildPreviewHtml } from '@/utils/buildPreviewHtml'
import styles from './ComponentDebugPage.module.css'

const STORAGE_KEY = 'component-debug-code'

const DEFAULT_CODE = `function GeneratedApp() {
  return (
    <div className="relative min-h-screen">
      <div className="reactbits-bg">
        <Galaxy
          mouseInteraction={true}
          mouseRepulsion={true}
          density={1.2}
          glowIntensity={0.4}
          saturation={0.8}
          hueShift={220}
        />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
        <h1 className="text-3xl font-semibold text-white">Paste AI-generated code here</h1>
      </div>
    </div>
  );
}`

function loadStoredCode(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CODE
  } catch {
    return DEFAULT_CODE
  }
}

export function ComponentDebugPage() {
  const [draft, setDraft] = useState(loadStoredCode)
  const [previewCode, setPreviewCode] = useState(loadStoredCode)

  const previewHtml = useMemo(
    () =>
      previewCode
        ? buildPreviewHtml(previewCode, {
            assetsBaseUrl:
              typeof window !== 'undefined' ? window.location.origin : undefined,
          })
        : null,
    [previewCode],
  )

  const runPreview = useCallback(() => {
    setPreviewCode(draft)
    try {
      localStorage.setItem(STORAGE_KEY, draft)
    } catch {
      /* ignore quota / private mode */
    }
  }, [draft])

  const resetCode = useCallback(() => {
    setDraft(DEFAULT_CODE)
    setPreviewCode(DEFAULT_CODE)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Component debug</h1>
          <p className={styles.subtitle}>
            Temporary route — paste AI-generated TSX, then run preview. Same iframe runtime as the
            builder.
          </p>
        </div>
        <a className={styles.backLink} href="/">
          ← Back to builder
        </a>
      </header>

      <div className={styles.workspace}>
        <section className={styles.editorPane} aria-label="Component source">
          <div className={styles.paneHeader}>
            <span className={styles.paneLabel}>Source</span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button variant="ghost" size="sm" onClick={resetCode}>
                Reset
              </Button>
              <Button size="sm" onClick={runPreview}>
                Run preview
              </Button>
            </div>
          </div>
          <div className={styles.editorBody}>
            <Textarea
              className={styles.codeInput}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              aria-label="Component source code"
            />
          </div>
        </section>

        <section className={styles.previewPane} aria-label="Live preview">
          <div className={styles.paneHeader}>
            <span className={styles.paneLabel}>Preview</span>
          </div>
          <div className={styles.previewBody}>
            {previewHtml ? (
              <PreviewFrame previewHtml={previewHtml} />
            ) : (
              <p className={styles.emptyPreview}>Run preview to render pasted code.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
