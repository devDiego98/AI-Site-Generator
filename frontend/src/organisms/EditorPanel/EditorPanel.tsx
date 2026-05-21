import { PromptFieldWithAction } from '@/molecules/PromptFieldWithAction'
import { ModificationsList } from '@/organisms/ModificationsList'
import { Text } from '@/atoms/Text'
import type { Project } from '@/types/project'
import styles from './EditorPanel.module.css'

export interface EditorPanelProps {
  prompt: string
  onPromptChange: (value: string) => void
  onSubmit: () => void
  isGenerating: boolean
  canModify: boolean
  error: string | null
  isViewingPastVersion: boolean
  activeProject: Project | null
  activeVersionId: string | null
  onRevertToVersion: (versionId: string) => void
}

export function EditorPanel({
  prompt,
  onPromptChange,
  onSubmit,
  isGenerating,
  canModify,
  error,
  isViewingPastVersion,
  activeProject,
  activeVersionId,
  onRevertToVersion,
}: EditorPanelProps) {
  const versions = activeProject?.versions ?? []

  return (
    <aside className={styles.panel} aria-label="Editor">
      <div className={styles.scroll}>
        {isViewingPastVersion ? (
          <div className={styles.pastVersionNotice}>
            <Text variant="caption" color="accent">
              Viewing a past version — apply modifications from this point, or
              revert to another version below.
            </Text>
          </div>
        ) : null}

        <PromptFieldWithAction
          value={prompt}
          onChange={onPromptChange}
          onSubmit={onSubmit}
          isGenerating={isGenerating}
          canModify={canModify}
          error={error}
        />

        {canModify ? (
          <ModificationsList
            versions={versions}
            activeVersionId={activeVersionId}
            onRevertToVersion={onRevertToVersion}
          />
        ) : null}
      </div>
    </aside>
  )
}
