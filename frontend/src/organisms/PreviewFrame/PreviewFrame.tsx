import styles from './PreviewFrame.module.css'

export interface PreviewFrameProps {
  previewHtml: string
}

export function PreviewFrame({ previewHtml }: PreviewFrameProps) {
  return (
    <iframe
      title="Generated UI preview"
      className={styles.frame}
      sandbox="allow-scripts"
      srcDoc={previewHtml}
    />
  )
}
