// Escribe un HTML por ruta (dist/soluciones/fibra-optica.html, …) con el título, la descripción,
// el canonical y el Open Graph de esa página, para que WhatsApp, Facebook y los buscadores los vean
// sin ejecutar JavaScript. Con cleanUrls, Vercel sirve estos archivos antes de reescribir a "/".
// Uso: después de `vite build` (lo corre `npm run build`).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { createServer } from 'vite'

// Vite carga los datos en TypeScript tal como los usa la app.
// Caché propio para no invalidar el del servidor de desarrollo si está corriendo.
const vite = await createServer({
  configFile: false, logLevel: 'error', appType: 'custom', cacheDir: 'node_modules/.vite-prerender',
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
})
const { SEO_ROUTES, fullTitle } = await vite.ssrLoadModule('/src/data/seo.ts')
await vite.close()

const base = readFileSync('dist/index.html', 'utf8')
const site = base.match(/<link rel="canonical" href="(.*?)\/?"/)[1]
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

for (const [path, { title, description }] of SEO_ROUTES) {
  const url = site + path
  const t = esc(fullTitle(title))
  const d = esc(description)
  let html = base
  for (const [re, value] of [
    [/<title>.*?<\/title>/, `<title>${t}</title>`],
    [/(<meta name="description" content=")[^"]*/, `$1${d}`],
    [/(<meta property="og:title" content=")[^"]*/, `$1${t}`],
    [/(<meta property="og:description" content=")[^"]*/, `$1${d}`],
    [/(<meta property="og:url" content=")[^"]*/, `$1${url}`],
    [/(<link rel="canonical" href=")[^"]*/, `$1${url}`],
  ]) {
    if (!re.test(html)) throw new Error(`prerender: index.html no tiene ${re}`)
    html = html.replace(re, value)
  }
  if (description.length > 160) console.warn(`prerender: descripción de ${description.length} caracteres en ${path}`)
  const file = path === '/' ? 'dist/index.html' : `dist${path}.html`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}
console.log(`prerender: ${SEO_ROUTES.length} páginas → ${site}`)
