import { useEffect, useState } from 'react'

export function usePathname(): string {
  const [pathname, setPathname] = useState(
    () => (typeof window !== 'undefined' ? window.location.pathname : '/'),
  )

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  return pathname
}
