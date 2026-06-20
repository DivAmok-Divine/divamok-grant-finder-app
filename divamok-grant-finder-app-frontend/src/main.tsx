import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './lib/auth'
import { SavedProvider } from './lib/saved'
import { StoreProvider } from './lib/store'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SavedProvider>
          <StoreProvider>
            <App />
          </StoreProvider>
        </SavedProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
