import { ToastProvider } from '@/contexts/ToastContext'
import { usePathname } from '@/hooks/usePathname'
import { BuilderPage, ComponentDebugPage } from '@/pages'

function App() {
  const pathname = usePathname()

  return (
    <ToastProvider>
      {pathname === '/debug' ? <ComponentDebugPage /> : <BuilderPage />}
    </ToastProvider>
  )
}

export default App
