import styles from './Tab.module.css'

export interface TabProps {
  id: string
  label: string
  isActive: boolean
  onSelect: (id: string) => void
}

export function Tab({ id, label, isActive, onSelect }: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`${styles.tab} ${isActive ? styles.active : ''}`}
      onClick={() => onSelect(id)}
    >
      {label}
    </button>
  )
}
