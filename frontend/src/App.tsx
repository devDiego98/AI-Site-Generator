import { ToastProvider } from '@/contexts/ToastContext'
import { BuilderPage } from '@/pages'

function App() {
  return (
    <ToastProvider>
      <BuilderPage />
    </ToastProvider>
  )
}

export default App
