import { Tab } from '@/atoms/Tab'
import styles from './TabGroup.module.css'

export interface TabItem {
  id: string
  label: string
}

export interface TabGroupProps {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
  ariaLabel: string
}

export function TabGroup({ tabs, activeId, onChange, ariaLabel }: TabGroupProps) {
  return (
    <div className={styles.group} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          id={tab.id}
          label={tab.label}
          isActive={activeId === tab.id}
          onSelect={onChange}
        />
      ))}
    </div>
  )
}
