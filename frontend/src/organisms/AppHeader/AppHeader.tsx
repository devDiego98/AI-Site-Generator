import { Button } from '@/atoms/Button'
import { Icon } from '@/atoms/Icon'
import { Text } from '@/atoms/Text'
import { useTheme } from '@/hooks/useTheme'
import styles from './AppHeader.module.css'

export function AppHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Text variant="h2" color="primary">
          AI UI Builder
        </Text>
      </div>
      <div className={styles.meta}>
        <Text variant="caption" color="muted">
          Describe an interface · Preview or inspect code
        </Text>
        <a href="/debug" className={styles.debugLink}>
          Debug components
        </a>
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleTheme}
          leftIcon={
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
          }
          aria-label={
            theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
          }
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </Button>
      </div>
    </header>
  )
}
