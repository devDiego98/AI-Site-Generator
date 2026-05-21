import { useCallback, useEffect, useState } from 'react'

export type AppTheme = 'dark' | 'light'

const STORAGE_KEY = 'ai-ui-builder-theme'

function readStoredTheme(): AppTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return 'dark'
}

export function useTheme() {
  const [theme, setThemeState] = useState<AppTheme>(() => readStoredTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, setTheme: setThemeState, toggleTheme }
}
