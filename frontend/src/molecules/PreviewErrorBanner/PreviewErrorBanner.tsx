import { Button } from '@/atoms/Button'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'
import {
  PREVIEW_GENERIC_ERROR_MESSAGE,
  PREVIEW_GENERIC_ERROR_TITLE,
} from '@/preview/previewErrorDisplay'
import styles from './PreviewErrorBanner.module.css'

export interface PreviewErrorBannerProps {
  detail?: string | null
  onDismiss?: () => void
  onRegenerate?: () => void
}

export function PreviewErrorBanner({
  detail,
  onDismiss,
  onRegenerate,
}: PreviewErrorBannerProps) {
  return (
    <div className={styles.banner} role="alert">
      <div className={styles.iconWrap} aria-hidden>
        <Icon name="alert" size={22} />
      </div>
      <div className={styles.body}>
        <Text variant="label" color="primary">
          {PREVIEW_GENERIC_ERROR_TITLE}
        </Text>
        <Text variant="caption" color="secondary">
          {PREVIEW_GENERIC_ERROR_MESSAGE}
        </Text>
        {detail ? (
          <pre className={styles.detail}>{detail}</pre>
        ) : null}
      </div>
      <div className={styles.actions}>
        {onRegenerate ? (
          <Button variant="primary" size="sm" onClick={onRegenerate}>
            Regenerate
          </Button>
        ) : null}
        {onDismiss ? (
          <Button variant="secondary" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        ) : null}
      </div>
    </div>
  )
}
