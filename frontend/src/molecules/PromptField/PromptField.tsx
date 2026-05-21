import { Text } from '@/atoms/Text'
import { Textarea } from '@/atoms/Textarea'
import styles from './PromptField.module.css'

export interface PromptFieldProps {
  id?: string
  label?: string
  placeholder?: string
  hint?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string | null
  showError?: boolean
}

export function PromptField({
  id = 'prompt',
  label = 'Describe your interface',
  placeholder = 'e.g. Create a landing page for an AI course for entrepreneurs.',
  hint = 'Be specific about layout, sections, and tone.',
  value,
  onChange,
  disabled = false,
  error = null,
  showError = true,
}: PromptFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        hasError={showError && Boolean(error)}
      />
      {showError && error ? (
        <Text variant="caption" color="accent" className={styles.error}>
          {error}
        </Text>
      ) : (
        <Text variant="caption" color="muted">
          {hint}
        </Text>
      )}
    </div>
  )
}
