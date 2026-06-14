import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CookingSessionProvider } from './context/CookingSessionContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CookingSessionProvider>
        <App />
      </CookingSessionProvider>
    </BrowserRouter>
  </StrictMode>,
)
