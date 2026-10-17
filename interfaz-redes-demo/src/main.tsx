import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '@fontsource/archivo/latin-500.css'
import '@fontsource/archivo/latin-600.css'
import '@fontsource/archivo/latin-700.css'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './index.css'

// Después de cada publicación los archivos JS viejos dejan de existir: quien tenía el sitio abierto y navega
// recibe un error al cargar la página siguiente. Se recarga una vez (no más de una cada 10 s) para tomar la versión nueva.
window.addEventListener('vite:preloadError', (e) => {
  try {
    const last = Number(sessionStorage.getItem('recarga-version') || 0)
    if (Date.now() - last < 10_000) return
    sessionStorage.setItem('recarga-version', String(Date.now()))
  } catch {
    return
  }
  e.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
