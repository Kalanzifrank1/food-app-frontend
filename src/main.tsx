import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './AppRoutes'
import Auth0ProviderWithNavigate from './Auth/Auth0ProviderWithNavigate'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/sonner'

const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      refetchOnWindowFocus: false
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <QueryClientProvider client={queryClient}>
        <Auth0ProviderWithNavigate>
          <AppRoutes />
          <Toaster visibleToasts={1} position='top-right' richColors/>
        </Auth0ProviderWithNavigate>
      </QueryClientProvider>
    </Router>
  </StrictMode>,
)
