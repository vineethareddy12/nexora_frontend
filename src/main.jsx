import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { API_BASE_URL } from './config/apiConfig'

// Proactive backend wakeup probe (instantly initiates Render container spinup upon visit)
try {
  const healthEndpoint = API_BASE_URL ? `${API_BASE_URL}/api/v1/health` : '/api/v1/health';
  fetch(healthEndpoint, { method: 'GET', cache: 'no-store' }).catch(() => {});
} catch (_) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
