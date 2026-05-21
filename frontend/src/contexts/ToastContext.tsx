import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ToastViewport } from '@/organisms/ToastViewport'

const TOAST_DURATION_MS = 5000

interface ToastItem {
  id: string
  message: string
}

interface ToastContextValue {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  useEffect(() => {
    if (toasts.length === 0) {
      return
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [toasts, dismissToast])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
