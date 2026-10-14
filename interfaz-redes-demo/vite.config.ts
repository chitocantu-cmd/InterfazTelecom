import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// En Vercel la URL pública (canonical, Open Graph, sitemap) es el dominio de producción del proyecto:
// interfaz-redes.vercel.app mientras no haya dominio propio, y el dominio propio en cuanto se conecte.
// Fuera de Vercel se usa VITE_SITE_URL de .env. Una VITE_SITE_URL en el panel de Vercel tiene prioridad.
if (!process.env.VITE_SITE_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  process.env.VITE_SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
}

// `vite build`                 → producción para Vercel (dist/, archivos con hash y caché larga)
// `vite build --mode preview`  → un solo HTML autocontenido para la vista previa (dist-preview/)
export default defineConfig(({ mode }) => {
  const single = mode === 'preview'
  return {
    plugins: [react(), ...(single ? [viteSingleFile()] : [])],
    // Sólo el sitio: tools/renders/ tiene su propio index.html (three.js) que no forma parte de la app.
    optimizeDeps: { entries: ['index.html'] },
    build: single
      ? { outDir: 'dist-preview', target: 'es2020', cssCodeSplit: false, assetsInlineLimit: 100_000_000 }
      : { outDir: 'dist', target: 'es2020', assetsInlineLimit: 4096, sourcemap: false },
  }
})
