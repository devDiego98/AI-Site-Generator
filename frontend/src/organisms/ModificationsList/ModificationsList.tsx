import { Badge } from '@/atoms/Badge'
import { Text } from '@/atoms/Text'
import type { ProjectVersion, VersionType } from '@/types/project'
import styles from './ModificationsList.module.css'

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

export interface ModificationsListProps {
  versions: ProjectVersion[]
  activeVersionId: string | null
  onRevertToVersion: (versionId: string) => void
}

export function ModificationsList({
  versions,
  activeVersionId,
  onRevertToVersion,
}: ModificationsListProps) {
  return (
    <section className={styles.panel} aria-label="Modifications">
      <div className={styles.header}>
        <Text variant="label" color="secondary">
          Modifications
        </Text>
        <Text variant="caption" color="muted">
          Click a previous version to revert
        </Text>
      </div>

      {versions.length === 0 ? (
        <div className={styles.empty}>
          <Text variant="caption" color="muted">
            No modifications yet. Generate a page to get started.
          </Text>
        </div>
      ) : (
        <ul className={styles.list}>
          {versions.map((version, index) => {
            const isActive = version.id === activeVersionId

            return (
              <li
                key={version.id}
                className={`${styles.versionItem} ${isActive ? styles.versionActive : styles.versionClickable}`}
                role={isActive ? undefined : 'button'}
                tabIndex={isActive ? undefined : 0}
                onClick={
                  isActive
                    ? undefined
                    : () => onRevertToVersion(version.id)
                }
                onKeyDown={
                  isActive
                    ? undefined
                    : (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onRevertToVersion(version.id)
                        }
                      }
                }
              >
                <div className={styles.versionContent}>
                  <div className={styles.versionRow}>
                    <Badge>v{index + 1}</Badge>
                    <Badge
                      variant={
                        version.type === 'modification' ? 'accent' : 'default'
                      }
                    >
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
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
