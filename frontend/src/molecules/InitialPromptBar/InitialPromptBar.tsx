import { Button } from '@/atoms/Button'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'
import styles from './InitialPromptBar.module.css'

export interface InitialPromptBarProps {
  initialPrompt: string
  onRegenerate: () => void
  isRegenerating: boolean
  disabled?: boolean
}

export function InitialPromptBar({
  initialPrompt,
  onRegenerate,
  isRegenerating,
  disabled = false,
}: InitialPromptBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.promptBlock}>
        <Text variant="label" color="secondary">
          Initial prompt
        </Text>
        <Text variant="caption" color="primary" className={styles.promptText}>
          {initialPrompt}
        </Text>
      </div>
      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="md"
          isLoading={isRegenerating}
          disabled={disabled || isRegenerating}
          leftIcon={<Icon name="refresh" size={18} />}
          onClick={onRegenerate}
        >
          {isRegenerating ? 'Regenerating…' : 'Regenerate'}
        </Button>
      </div>
    </div>
  )
}
