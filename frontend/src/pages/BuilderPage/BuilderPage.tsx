import { BuilderLayout } from '@/templates/BuilderLayout'
import { EditorPanel } from '@/organisms/EditorPanel'
import { OutputPanel } from '@/organisms/OutputPanel'
import { ProjectsSidebar } from '@/organisms/ProjectsSidebar'
import { useBuilderState } from '@/hooks/useBuilderState'

export function BuilderPage() {
  const {
    prompt,
    setPrompt,
    viewMode,
    setViewMode,
    code,
    isGenerating,
    error,
    canModify,
    showEditorColumn,
    isCreatingNew,
    isViewingPastVersion,
    projects,
    activeProjectId,
    activeVersionId,
    activeProject,
    handleSubmit,
    startNewProject,
    selectProject,
    revertToVersion,
    deleteProject,
  } = useBuilderState()

  return (
    <BuilderLayout
      projectsSlot={
        <ProjectsSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          isCreatingNew={isCreatingNew}
          onStartProject={startNewProject}
          onSelectProject={selectProject}
          onDeleteProject={deleteProject}
        />
      }
      editorSlot={
        showEditorColumn ? (
          <EditorPanel
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handleSubmit}
            isGenerating={isGenerating}
            canModify={canModify}
            error={error}
            isViewingPastVersion={isViewingPastVersion}
            activeProject={activeProject}
            activeVersionId={activeVersionId}
            onRevertToVersion={(versionId) => {
              if (activeProjectId) {
                revertToVersion(activeProjectId, versionId)
              }
            }}
          />
        ) : undefined
      }
      outputSlot={
        <OutputPanel
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          code={code}
          previewKey={activeVersionId}
          isGenerating={isGenerating}
        />
      }
    />
  )
}
