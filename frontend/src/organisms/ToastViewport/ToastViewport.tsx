import { Text } from '@/atoms/Text'
import styles from './ToastViewport.module.css'

export interface ToastViewportProps {
  toasts: Array<{ id: string; message: string }>
  onDismiss: (id: string) => void
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      className={styles.viewport}
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.toast} role="alert">
          <span className={styles.icon} aria-hidden>
            !
          </span>
          <Text variant="body" color="primary" className={styles.message}>
            {toast.message}
          </Text>
          <button
            type="button"
            className={styles.dismiss}
            aria-label="Dismiss notification"
            onClick={() => onDismiss(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
