import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'
import styles from './OutputEmptyState.module.css'

export function OutputEmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.iconWrap}>
        <Icon name="eye" size={32} />
      </div>
      <Text variant="h3" color="onLight">
        No preview yet
      </Text>
      <Text variant="body" color="onLight" className={styles.subtitle}>
        Write a prompt and click Generate to see your AI-built interface here.
      </Text>
    </div>
  )
}
