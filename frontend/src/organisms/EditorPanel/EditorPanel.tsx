import { PromptFieldWithAction } from '@/molecules/PromptFieldWithAction'
import { InitialPromptBar } from '@/molecules/InitialPromptBar'
import { IterationSelector } from '@/molecules/IterationSelector'
import { ModificationsList } from '@/organisms/ModificationsList'
import { Text } from '@/atoms/Text'
import type { Project, ProjectIteration } from '@/types/project'
import styles from './EditorPanel.module.css'

export interface EditorPanelProps {
  prompt: string
  onPromptChange: (value: string) => void
  onSubmit: () => void
  isGenerating: boolean
  isRegenerating: boolean
  canModify: boolean
  canRegenerate: boolean
  error: string | null
  isViewingPastVersion: boolean
  activeProject: Project | null
  activeIteration: ProjectIteration | null
  activeIterationId: string | null
  activeVersionId: string | null
  onRegenerate: () => void
  onSelectIteration: (iterationId: string) => void
  onRevertToVersion: (versionId: string) => void
}

export function EditorPanel({
  prompt,
  onPromptChange,
  onSubmit,
  isGenerating,
  isRegenerating,
  canModify,
  canRegenerate,
  error,
  isViewingPastVersion,
  activeProject,
  activeIteration,
  activeIterationId,
  activeVersionId,
  onRegenerate,
  onSelectIteration,
  onRevertToVersion,
}: EditorPanelProps) {
  const versions = activeIteration?.versions ?? []
  const isBusy = isGenerating || isRegenerating

  return (
    <aside className={styles.panel} aria-label="Editor">
      <div className={styles.scroll}>
        {canRegenerate && activeProject ? (
          <InitialPromptBar
            initialPrompt={activeProject.initialPrompt}
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
            disabled={isBusy}
          />
        ) : null}

        {canModify && activeProject ? (
          <IterationSelector
            iterations={activeProject.iterations}
            activeIterationId={activeIterationId}
            onSelectIteration={onSelectIteration}
            disabled={isBusy}
          />
        ) : null}

        {isViewingPastVersion ? (
          <div className={styles.pastVersionNotice}>
            <Text variant="caption" color="accent">
              Viewing a past version in this iteration — apply modifications
              from this point, or revert to another version below.
            </Text>
          </div>
        ) : null}

        <PromptFieldWithAction
          value={prompt}
          onChange={onPromptChange}
          onSubmit={onSubmit}
          isGenerating={isGenerating}
          canModify={canModify}
          disabled={isRegenerating}
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
