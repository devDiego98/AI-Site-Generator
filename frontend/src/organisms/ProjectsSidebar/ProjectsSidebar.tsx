import { Badge } from '@/atoms/Badge'
import { Button } from '@/atoms/Button'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'
import type { Project } from '@/types/project'
import styles from './ProjectsSidebar.module.css'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export interface ProjectsSidebarProps {
  projects: Project[]
  activeProjectId: string | null
  isCreatingNew: boolean
  onStartProject: () => void
  onSelectProject: (projectId: string) => void
  onDeleteProject: (projectId: string) => void
}

export function ProjectsSidebar({
  projects,
  activeProjectId,
  isCreatingNew,
  onStartProject,
  onSelectProject,
  onDeleteProject,
}: ProjectsSidebarProps) {
  const handleDelete = (project: Project) => {
    const preview =
      project.initialPrompt.length > 80
        ? `${project.initialPrompt.slice(0, 80)}…`
        : project.initialPrompt

    if (
      !window.confirm(
        `Delete this project?\n\n"${preview}"\n\nThis cannot be undone.`,
      )
    ) {
      return
    }

    onDeleteProject(project.id)
  }

  return (
    <aside className={styles.panel} aria-label="Projects">
      <div className={styles.inner}>
        <div className={styles.header}>
          <Text variant="h3" color="primary">
            Projects
          </Text>
          <Text variant="caption" color="muted">
            Select a project or start a new one
          </Text>
        </div>

        <Button
          variant={isCreatingNew ? 'secondary' : 'primary'}
          size="lg"
          leftIcon={<Icon name="folder" size={18} />}
          onClick={onStartProject}
        >
          Start project
        </Button>

        {projects.length === 0 ? (
          <div className={styles.empty}>
            <Text variant="caption" color="muted">
              No projects yet. Click Start project to begin.
            </Text>
          </div>
        ) : (
          <ul className={styles.list}>
            {projects.map((project) => {
              const isActive =
                project.id === activeProjectId && !isCreatingNew

              return (
                <li key={project.id} className={styles.projectCard}>
                  <button
                    type="button"
                    className={`${styles.projectItem} ${isActive ? styles.projectActive : ''}`}
                    onClick={() => onSelectProject(project.id)}
                  >
                    <Text
                      variant="body"
                      color="primary"
                      className={styles.projectPrompt}
                    >
                      {project.initialPrompt}
                    </Text>
                    <div className={styles.projectFooter}>
                      <Badge>
                        {project.versions.length}{' '}
                        {project.versions.length === 1
                          ? 'version'
                          : 'versions'}
                      </Badge>
                      <Text variant="caption" color="muted">
                        {formatDate(project.updatedAt)}
                      </Text>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    aria-label={`Delete project: ${project.initialPrompt}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleDelete(project)
                    }}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
