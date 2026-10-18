import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
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

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
// En producción cada página llega prerenderizada (scripts/prerender.mjs): React toma ese HTML en lugar de
// volver a dibujarlo. En desarrollo y en la vista previa de un solo archivo, #root llega vacío.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
