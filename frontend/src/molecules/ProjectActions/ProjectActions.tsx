import { Button } from '@/atoms/Button'
import { Icon } from '@/atoms/Icon'
import styles from './ProjectActions.module.css'

export interface ProjectActionsProps {
  onStartProject: () => void
  isLoading: boolean
  isPromptEmpty: boolean
}

export function ProjectActions({
  onStartProject,
  isLoading,
  isPromptEmpty,
}: ProjectActionsProps) {
  return (
    <div className={styles.actions}>
      <Button
        variant="primary"
        size="lg"
        isLoading={isLoading}
        disabled={isPromptEmpty}
        leftIcon={<Icon name="folder" size={18} />}
        onClick={onStartProject}
      >
        {isLoading ? 'Starting project…' : 'Start Project'}
      </Button>
    </div>
  )
}
