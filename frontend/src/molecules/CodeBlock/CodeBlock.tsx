import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/atoms/Button'
import { Icon } from '@/atoms/Icon'
import { highlightTsxCode } from '@/utils/highlightCode'
import styles from './CodeBlock.module.css'

export interface CodeBlockProps {
  code: string
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const highlighted = useMemo(() => highlightTsxCode(code), [code])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may be unavailable outside secure contexts
    }
  }, [code])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          leftIcon={<Icon name={copied ? 'check' : 'copy'} size={16} />}
          aria-label={copied ? 'Code copied' : 'Copy all generated code'}
        >
          {copied ? 'Copied' : 'Copy code'}
        </Button>
      </div>
      <pre className={styles.pre}>
        <code
          className={styles.code}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  )
}
