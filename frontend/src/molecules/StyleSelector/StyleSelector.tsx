import { Text } from '@/atoms/Text'
import type { VisualStyle } from '@/types/visualStyle'
import { VISUAL_STYLE_OPTIONS } from '@/types/visualStyle'
import styles from './StyleSelector.module.css'

export interface StyleSelectorProps {
  value: VisualStyle
  onChange: (value: VisualStyle) => void
  disabled?: boolean
}

export function StyleSelector({
  value,
  onChange,
  disabled = false,
}: StyleSelectorProps) {
  return (
    <div className={styles.field}>
      <label htmlFor="visual-style" className={styles.label}>
        Visual style
      </label>
      <select
        id="visual-style"
        className={styles.select}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as VisualStyle)}
      >
        {VISUAL_STYLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Text variant="caption" color="muted">
        Guides layout and tone before the first generation.
      </Text>
    </div>
  )
}
