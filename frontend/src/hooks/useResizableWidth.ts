import { useCallback, useEffect, useRef, useState } from 'react'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function readStoredWidth(
  storageKey: string | undefined,
  defaultWidth: number,
  minWidth: number,
  maxWidth: number,
): number {
  if (!storageKey || typeof window === 'undefined') {
    return defaultWidth
  }
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) {
    return defaultWidth
  }
  const parsed = Number(stored)
  if (Number.isNaN(parsed)) {
    return defaultWidth
  }
  return clamp(parsed, minWidth, maxWidth)
}

export interface UseResizableWidthOptions {
  defaultWidth: number
  minWidth: number
  maxWidth: number
  storageKey?: string
}

export function useResizableWidth({
  defaultWidth,
  minWidth,
  maxWidth,
  storageKey,
}: UseResizableWidthOptions) {
  const [width, setWidth] = useState(() =>
    readStoredWidth(storageKey, defaultWidth, minWidth, maxWidth),
  )
  const widthRef = useRef(width)

  useEffect(() => {
    widthRef.current = width
  }, [width])

  const persistWidth = useCallback(
    (next: number) => {
      if (storageKey && typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, String(next))
      }
    },
    [storageKey],
  )

  const startResize = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      const startX = event.clientX
      const startWidth = widthRef.current

      const onMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX
        const next = clamp(startWidth + delta, minWidth, maxWidth)
        setWidth(next)
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        persistWidth(widthRef.current)
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [minWidth, maxWidth, persistWidth],
  )

  const resetWidth = useCallback(() => {
    setWidth(defaultWidth)
    persistWidth(defaultWidth)
  }, [defaultWidth, persistWidth])

  return { width, startResize, resetWidth }
}
