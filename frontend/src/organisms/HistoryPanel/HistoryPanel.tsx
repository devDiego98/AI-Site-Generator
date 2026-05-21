import { useEffect, useState } from 'react'
import { Badge } from '@/atoms/Badge'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'
import type { Project, ProjectVersion, VersionType } from '@/types/project'
import styles from './HistoryPanel.module.css'

export interface HistoryPanelProps {
  projects: Project[]
  activeProjectId: string | null
  activeVersionId: string | null
  onSelectProject: (projectId: string) => void
  onRevertToVersion: (projectId: string, versionId: string) => void
}

const versionTypeLabels: Record<VersionType, string> = {
  initial: 'Initial',
  modification: 'Modification',
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function VersionItem({
  version,
  index,
  isActive,
  onRevert,
}: {
  version: ProjectVersion
  index: number
  isActive: boolean
  onRevert: () => void
}) {
  return (
    <div
      className={`${styles.versionItem} ${isActive ? styles.versionActive : styles.versionClickable}`}
      role={isActive ? undefined : 'button'}
      tabIndex={isActive ? undefined : 0}
      onClick={isActive ? undefined : onRevert}
      onKeyDown={
        isActive
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onRevert()
              }
            }
      }
    >
      <div className={styles.versionContent}>
        <div className={styles.versionRow}>
          <Badge>v{index + 1}</Badge>
          <Badge variant={version.type === 'modification' ? 'accent' : 'default'}>
            {versionTypeLabels[version.type]}
          </Badge>
          <Text variant="caption" color="muted">
            {formatDate(version.createdAt)}
          </Text>
        </div>
        <Text
          variant="caption"
          color="secondary"
          className={styles.versionInstruction}
        >
          {version.instruction}
        </Text>
      </div>
      {isActive ? <Badge variant="success">Current</Badge> : null}
    </div>
  )
}

export function HistoryPanel({
  projects,
  activeProjectId,
  activeVersionId,
  onSelectProject,
  onRevertToVersion,
}: HistoryPanelProps) {
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(
    () => new Set(activeProjectId ? [activeProjectId] : []),
  )

  useEffect(() => {
    if (activeProjectId) {
      setExpandedProjectIds((prev) => new Set(prev).add(activeProjectId))
    }
  }, [activeProjectId])

  const toggleExpanded = (projectId: string) => {
    setExpandedProjectIds((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

  const handleSelectProject = (projectId: string) => {
    setExpandedProjectIds((prev) => new Set(prev).add(projectId))
    onSelectProject(projectId)
  }

  return (
    <section className={styles.panel} aria-label="Project history">
      <div className={styles.header}>
        <Text variant="h3" color="primary">
          Projects
        </Text>
        <Text variant="caption" color="muted">
          Click a previous version to revert
        </Text>
      </div>

      {projects.length === 0 ? (
        <div className={styles.empty}>
          <Text variant="caption" color="muted">
            No projects yet. Enter a prompt and click Start Project.
          </Text>
        </div>
      ) : (
        <ul className={styles.list}>
          {projects.map((project) => {
            const isActiveProject = project.id === activeProjectId
            const isExpanded = expandedProjectIds.has(project.id)

            return (
              <li
                key={project.id}
                className={`${styles.thread} ${isActiveProject ? styles.threadActive : ''}`}
              >
                <div className={styles.threadHeader}>
                  <button
                    type="button"
                    className={styles.expandButton}
                    aria-label={
                      isExpanded ? 'Collapse versions' : 'Expand versions'
                    }
                    onClick={() => toggleExpanded(project.id)}
                  >
                    <Icon
                      name="chevron-right"
                      size={16}
                      className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}
                    />
                  </button>
                  <button
                    type="button"
                    className={styles.threadSelect}
                    onClick={() => handleSelectProject(project.id)}
                  >
                    <div className={styles.threadMeta}>
                      <Text
                        variant="body"
                        color="primary"
                        className={styles.threadPrompt}
                      >
                        {project.initialPrompt}
                      </Text>
                      <div className={styles.threadFooter}>
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
                    </div>
                  </button>
                </div>

                {isExpanded ? (
                  <div className={styles.versions}>
                    {project.versions.map((version, index) => (
                      <VersionItem
                        key={version.id}
                        version={version}
                        index={index}
                        isActive={
                          isActiveProject && version.id === activeVersionId
                        }
                        onRevert={() =>
                          onRevertToVersion(project.id, version.id)
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
