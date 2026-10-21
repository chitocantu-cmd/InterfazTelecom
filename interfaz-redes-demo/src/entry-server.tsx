// Entrada del prerender: dibuja cada página en Node con el mismo código de la app, para que el HTML llegue con su
// contenido (títulos, texto y enlaces) antes de que cargue el JavaScript. Lo compila `vite build --ssr` (así las
// imágenes salen con las mismas URLs con hash que en el navegador) y lo usa scripts/prerender.mjs.
import { StrictMode } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { Writable } from 'node:stream'
import { Shell } from './App'

export { PAGES, fullTitle, MAX_DESCRIPTION, MIN_DESCRIPTION } from './data/seo'
export { structuredData, noscriptText } from './data/structured-data'
export { HERO_IMAGE } from './components/home/Hero'

/** HTML de la ruta, con las páginas que se cargan bajo demanda ya resueltas (espera a que todo esté listo). */
export function render(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = ''
    const sink = new Writable({
      write(chunk, _encoding, done) {
        html += chunk.toString()
        done()
      },
    })
    sink.on('finish', () => resolve(html))
    const { pipe } = renderToPipeableStream(
      <StrictMode>
        <StaticRouter location={url}>
          <Shell />
        </StaticRouter>
      </StrictMode>,
      {
        onAllReady: () => pipe(sink),
        onShellError: reject,
        // Un error en cualquier parte de la página detiene el build: no se publica una página a medias.
        onError: (error) => reject(error),
      },
    )
  })
}
