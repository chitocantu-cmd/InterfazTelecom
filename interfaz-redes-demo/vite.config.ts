import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

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
