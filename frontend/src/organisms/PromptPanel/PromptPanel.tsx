import { ModifyActions } from '@/molecules/ModifyActions'
import { ProjectActions } from '@/molecules/ProjectActions'
import { PromptField } from '@/molecules/PromptField'
import { HistoryPanel } from '@/organisms/HistoryPanel'
import { Text } from '@/atoms/Text'
import type { Project } from '@/types/project'
import styles from './PromptPanel.module.css'

export interface PromptPanelProps {
  prompt: string
  onPromptChange: (value: string) => void
  modificationPrompt: string
  onModificationPromptChange: (value: string) => void
  onStartProject: () => void
  onModify: () => void
  isGenerating: boolean
  hasActiveProject: boolean
  isViewingPastVersion: boolean
  activeProject: Project | null
  error: string | null
  projects: Project[]
  activeProjectId: string | null
  activeVersionId: string | null
  onSelectProject: (projectId: string) => void
  onRevertToVersion: (projectId: string, versionId: string) => void
}

export function PromptPanel({
  prompt,
  onPromptChange,
  modificationPrompt,
  onModificationPromptChange,
  onStartProject,
  onModify,
  isGenerating,
  hasActiveProject,
  isViewingPastVersion,
  activeProject,
  error,
  projects,
  activeProjectId,
  activeVersionId,
  onSelectProject,
  onRevertToVersion,
}: PromptPanelProps) {
  return (
    <aside className={styles.panel}>
      <div className={styles.scroll}>
        <div className={styles.intro}>
          <Text variant="h3" color="primary">
            New project
          </Text>
          <Text variant="caption" color="muted">
            Describe the interface, then start a project to generate and iterate.
          </Text>
        </div>

        <PromptField
          value={prompt}
          onChange={onPromptChange}
          disabled={isGenerating}
          error={error}
        />

        <ProjectActions
          onStartProject={onStartProject}
          isLoading={isGenerating}
          isPromptEmpty={!prompt.trim()}
        />

        {hasActiveProject && activeProject ? (
          <div className={styles.activeProject}>
            <Text variant="label" color="secondary">
              Active project
            </Text>
            <Text variant="body" color="primary" className={styles.projectPrompt}>
              {activeProject.initialPrompt}
            </Text>
            {isViewingPastVersion ? (
              <Text variant="caption" color="accent">
                Viewing a past version — apply modifications from this point, or
                revert to another version below.
              </Text>
            ) : null}
          </div>
        ) : null}

        {hasActiveProject ? (
          <div className={styles.modifySection}>
            <Text variant="label" color="secondary">
              Modify project
            </Text>
            <PromptField
              id="modification"
              label="Change request"
              placeholder="e.g. Change the hero background to dark blue and make the CTA larger."
              hint="Each modification is saved in this project's history. You can revert to any version."
              value={modificationPrompt}
              onChange={onModificationPromptChange}
              disabled={isGenerating}
              showError={false}
            />
            <ModifyActions
              onModify={onModify}
              isGenerating={isGenerating}
              canModify={hasActiveProject}
              isInstructionEmpty={!modificationPrompt.trim()}
            />
          </div>
        ) : null}

        <HistoryPanel
          projects={projects}
          activeProjectId={activeProjectId}
          activeVersionId={activeVersionId}
          onSelectProject={onSelectProject}
          onRevertToVersion={onRevertToVersion}
        />
      </div>
    </aside>
  )
}
