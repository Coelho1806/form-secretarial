import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import FormPage from './pages/FormPage'
import AdminPanel from './pages/AdminPanel'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key')
}

function QueryRedirector() {
  const navigate = useNavigate()
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === 'true') {
      navigate('/admin', { replace: true })
    }
  }, [navigate])
  return null
}

function AuthReturn() {
  useEffect(() => {
    const url = sessionStorage.getItem('form_client_url')
    window.location.href = url || '/'
  }, [])
  return null
}

function App() {
  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      navigate={(to) => window.location.href = to}
    >
      <Router>
        <QueryRedirector />
        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/auth/return" element={<AuthReturn />} />
        </Routes>
      </Router>
    </ClerkProvider>
  )
}

export default App
