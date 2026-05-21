import { useEffect, useState } from 'react'

/** Lightweight pathname for client-side routes without react-router. */
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
