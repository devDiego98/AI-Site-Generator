import { Text } from '@/atoms/Text'
import type { ProjectIteration } from '@/types/project'
import styles from './IterationSelector.module.css'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export interface IterationSelectorProps {
  iterations: ProjectIteration[]
  activeIterationId: string | null
  onSelectIteration: (iterationId: string) => void
  disabled?: boolean
}

export function IterationSelector({
  iterations,
  activeIterationId,
  onSelectIteration,
  disabled = false,
}: IterationSelectorProps) {
  if (iterations.length <= 1) {
    return null
  }

  return (
    <div className={styles.field}>
      <label htmlFor="iteration-select" className={styles.label}>
        Iteration
      </label>
      <select
        id="iteration-select"
        className={styles.select}
        value={activeIterationId ?? ''}
        disabled={disabled}
        onChange={(e) => onSelectIteration(e.target.value)}
      >
        {iterations.map((iteration, index) => {
          const modCount = iteration.versions.filter(
            (v) => v.type === 'modification',
          ).length

          return (
            <option key={iteration.id} value={iteration.id}>
              Iteration {index + 1} · {formatDate(iteration.createdAt)}
              {modCount > 0
                ? ` · ${modCount} mod${modCount === 1 ? '' : 's'}`
                : ''}
            </option>
          )
        })}
      </select>
      <Text variant="caption" color="muted" className={styles.hint}>
        Each iteration has its own modification history from the same initial
        prompt.
      </Text>
    </div>
  )
}
