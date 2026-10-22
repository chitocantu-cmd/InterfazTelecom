// Entrada del prerender: dibuja cada página en Node con el mismo código de la app, para que el HTML llegue con su
// contenido (títulos, texto y enlaces) antes de que cargue el JavaScript. Lo compila `vite build --ssr` (así las
// imágenes salen con las mismas URLs con hash que en el navegador) y lo usa scripts/prerender.mjs.
import { StrictMode } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { Writable } from 'node:stream'
import { Shell } from './App'
import { pagesFor } from './data/seo'
import { i18nFor, loadLocale, translationFor } from './i18n'
import { LOCALE_META, LOCALES } from './i18n/config'
import { missingContent } from './i18n/content'

export { fullTitle, MAX_DESCRIPTION, MIN_DESCRIPTION } from './data/seo'
export { structuredData, noscriptText } from './data/structured-data'
export { HERO_IMAGE } from './components/home/Hero'
export { alternates } from './lib/seo'
export { LOCALES, LOCALE_META, i18nFor }

/**
 * Carga los cuatro idiomas y devuelve todas las páginas. `drafts`: incluir borradores del centro técnico.
 * Falla si a una traducción le falta algún servicio, industria, proyecto o escenario del catálogo.
 */
export async function setup({ drafts = false }: { drafts?: boolean } = {}) {
  await Promise.all(LOCALES.map((l) => loadLocale(l)))
  for (const l of LOCALES) {
    const tr = translationFor(l)
    const missing = tr ? missingContent(tr) : []
    if (missing.length) throw new Error(`Traducción ${l} incompleta: ${missing.join(', ')}`)
  }
  return LOCALES.flatMap((l) => pagesFor(l, i18nFor(l).t, i18nFor(l).c, { drafts }))
}

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
