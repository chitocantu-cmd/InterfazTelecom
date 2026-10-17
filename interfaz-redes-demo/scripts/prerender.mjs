// Escribe un HTML por ruta (dist/soluciones/fibra-optica.html, …) con el título, la descripción, el canonical,
// el Open Graph y los datos estructurados de esa página, para que WhatsApp, Facebook y los buscadores los vean
// sin ejecutar JavaScript. También escribe dist/404.html, dist/sitemap.xml y dist/robots.txt a partir de las
// mismas rutas (src/data/seo.ts). Con cleanUrls, Vercel sirve cada archivo en su ruta limpia.
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
const { PAGES, fullTitle, MAX_DESCRIPTION, MIN_DESCRIPTION } = await vite.ssrLoadModule('/src/data/seo.ts')
const { structuredData, noscriptText } = await vite.ssrLoadModule('/src/data/structured-data.ts')
await vite.close()

const base = readFileSync('dist/index.html', 'utf8')
// VITE_SITE_URL (en .env) ya viene sustituida por Vite en el canonical de index.html.
const site = base.match(/<link rel="canonical" href="(.*?)\/?"/)?.[1] ?? ''
if (!/^https:\/\/[a-z0-9.-]+$/i.test(site)) throw new Error(`prerender: VITE_SITE_URL debe ser una URL https:// sin ruta (es «${site}»)`)

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const absolute = (path) => site + (path === '/' ? '/' : path)

/** Reemplaza la única coincidencia de `re` (su grupo 1 se conserva); falla si index.html ya no la tiene. */
function replace(html, re, value) {
  if (!re.test(html)) throw new Error(`prerender: index.html no tiene ${re}`)
  // Con función, un «$» en el texto no se interpreta como referencia a un grupo.
  return html.replace(re, (_match, keep) => keep + value)
}

const SLOT = /()<!-- scripts\/prerender\.mjs [^>]*-->/
const withNoscript = (html) => replace(html, SLOT, `<noscript>${esc(noscriptText())}</noscript>`)

for (const page of PAGES) {
  const { path, seo } = page
  const title = esc(fullTitle(seo.title))
  const description = esc(seo.description)
  let html = base
  for (const [re, value] of [
    [/(<title>)[^<]*(?=<\/title>)/, title],
    [/(<meta name="description" content=")[^"]*/, description],
    [/(<meta property="og:title" content=")[^"]*/, title],
    [/(<meta property="og:description" content=")[^"]*/, description],
    [/(<meta property="og:url" content=")[^"]*/, absolute(path)],
    [/(<link rel="canonical" href=")[^"]*/, absolute(path)],
    [/()(?=<\/head>)/, `<script type="application/ld+json">\n${structuredData(site, page)}\n</script>\n`],
  ]) html = replace(html, re, value)
  html = withNoscript(html)
  const length = seo.description.length
  if (length > MAX_DESCRIPTION || length < MIN_DESCRIPTION) console.warn(`prerender: descripción de ${length} caracteres en ${path} (conviene de ${MIN_DESCRIPTION} a ${MAX_DESCRIPTION})`)
  const file = path === '/' ? 'dist/index.html' : `dist${path}.html`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

// 404.html: Vercel lo sirve con estado 404 en cualquier ruta que no exista. La app muestra «Esta página no existe».
let notFound = replace(base, /(<title>)[^<]*(?=<\/title>)/, esc(fullTitle('Página no encontrada')))
notFound = replace(notFound, /()<link rel="canonical"[^>]*>\n?/, '<meta name="robots" content="noindex" />\n')
notFound = replace(notFound, /()<meta property="og:url"[^>]*>\n?/, '')
writeFileSync('dist/404.html', withNoscript(notFound))

// Sitemap y robots: las mismas rutas que se prerenderizan. Sin <lastmod>: una fecha inexacta resta confianza.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(({ path }) => `  <url><loc>${esc(absolute(path))}</loc></url>`).join('\n')}
</urlset>
`
writeFileSync('dist/sitemap.xml', sitemap)
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`)

console.log(`prerender: ${PAGES.length} páginas + 404, sitemap y robots → ${site}`)
