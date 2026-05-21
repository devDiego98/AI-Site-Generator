import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/atoms/Button'
import { Text } from '@/atoms/Text'
import { PreviewFrame } from '@/organisms/PreviewFrame'
import { buildPreviewHtml } from '@/utils/buildPreviewHtml'
import styles from './ComponentDebugPage.module.css'

const STORAGE_KEY = 'component-debug-code'

const DEFAULT_CODE = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d0d0d] text-[#f0f0f0]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none">
        <Galaxy hueShift={140} saturation={0.0} />
      </div>
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-bold text-[#efefef]">Debug preview</h1>
        <p className="mt-4 text-white/55">Paste AI-generated TSX and click Run preview.</p>
      </main>
    </div>
  );
}`

function loadStoredCode(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored?.trim() ? stored : DEFAULT_CODE
  } catch {
    return DEFAULT_CODE
  }
}

export function ComponentDebugPage() {
  const [draftCode, setDraftCode] = useState(loadStoredCode)
  const [previewCode, setPreviewCode] = useState<string | null>(null)
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, draftCode)
    } catch {
      // localStorage may be unavailable
    }
  }, [draftCode])

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

  const handleRunPreview = useCallback(() => {
    setPreviewCode(draftCode)
    setPreviewKey((key) => key + 1)
  }, [draftCode])

  const handleReset = useCallback(() => {
    setDraftCode(DEFAULT_CODE)
    setPreviewCode(null)
    setPreviewKey((key) => key + 1)
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.backLink}>
          ← Back to builder
        </a>
        <Text variant="h3" color="primary">
          Component debug
        </Text>
        <span aria-hidden="true" />
      </header>

      <div className={styles.body}>
        <section className={styles.editor} aria-label="Component source">
          <label htmlFor="debug-code" className={styles.editorLabel}>
            Paste generated TSX
          </label>
          <textarea
            id="debug-code"
            className={styles.codeInput}
            value={draftCode}
            onChange={(e) => setDraftCode(e.target.value)}
            spellCheck={false}
            aria-label="Component source code"
          />
          <div className={styles.actions}>
            <Button variant="primary" onClick={handleRunPreview}>
              Run preview
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Reset sample
            </Button>
          </div>
          <Text variant="caption" color="muted">
            Imports are stripped automatically. Code is saved in this browser.
          </Text>
        </section>

        <section className={styles.preview} aria-label="Live preview">
          <div className={styles.previewToolbar}>
            <Text variant="label" color="secondary">
              Preview
            </Text>
          </div>
          <div className={styles.previewCanvas}>
            {previewHtml ? (
              <PreviewFrame key={previewKey} previewHtml={previewHtml} />
            ) : (
              <div className={styles.emptyPreview}>
                <Text variant="body" color="muted">
                  Click Run preview to render pasted code in the iframe.
                </Text>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
