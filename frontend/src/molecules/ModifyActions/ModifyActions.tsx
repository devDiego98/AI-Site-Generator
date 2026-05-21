import { Button } from '@/atoms/Button'
import { Icon } from '@/atoms/Icon'
import styles from './ModifyActions.module.css'

export interface ModifyActionsProps {
  onModify: () => void
  isGenerating: boolean
  canModify: boolean
  isInstructionEmpty: boolean
}

export function ModifyActions({
  onModify,
  isGenerating,
  canModify,
  isInstructionEmpty,
}: ModifyActionsProps) {
  return (
    <Button
      variant="secondary"
      size="md"
      isLoading={isGenerating}
      disabled={!canModify || isInstructionEmpty || isGenerating}
      leftIcon={<Icon name="pencil" size={16} />}
      onClick={onModify}
      className={styles.button}
    >
      Apply modification
    </Button>
  )
}
