import { ToastProvider } from '@/contexts/ToastContext'
import { usePathname } from '@/hooks/usePathname'
import { BuilderPage, ComponentDebugPage } from '@/pages'

const DEBUG_ROUTE = '/debug'

function App() {
  const pathname = usePathname()

  return (
    <ToastProvider>
      {pathname === DEBUG_ROUTE ? <ComponentDebugPage /> : <BuilderPage />}
    </ToastProvider>
  )
}

export default App
