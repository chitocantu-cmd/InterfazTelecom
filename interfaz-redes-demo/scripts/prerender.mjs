// Escribe un HTML por ruta (dist/soluciones/fibra-optica.html, …) con el contenido de la página ya dibujado, su
// título, descripción, canonical, Open Graph y datos estructurados, para que buscadores, WhatsApp y Facebook los
// vean sin ejecutar JavaScript y el navegador pinte antes; luego React toma ese HTML (hydrateRoot en main.tsx).
// También escribe dist/404.html, dist/sitemap.xml y dist/robots.txt a partir de las mismas rutas
// (src/data/seo.ts). Con cleanUrls, Vercel sirve cada archivo en su ruta limpia.
// Uso: después de `vite build` y `vite build --ssr src/entry-server.tsx --outDir dist-ssr` (lo corre `npm run build`).
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { render, PAGES, fullTitle, MAX_DESCRIPTION, MIN_DESCRIPTION, structuredData, noscriptText, HERO_IMAGE } = await import(
  pathToFileURL(resolve('dist-ssr/entry-server.js')).href
)

const base = readFileSync('dist/index.html', 'utf8')
// La URL del sitio (COMPANY.site, o VITE_SITE_URL si se sobrescribe) ya viene sustituida en el canonical de index.html.
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

/** Contenido de la página dentro de #root. */
const withBody = async (html, path) => replace(html, /(<div id="root">)(?=<\/div>)/, await render(path))

// Archivos JS de cada página (se cargan bajo demanda): se precargan junto con el principal para que React tome
// el HTML sin esperar una segunda ida al servidor. Inicio va en el archivo principal.
const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'))
const PAGE_MODULE = [
  [/^\/soluciones\/./, 'src/pages/ServiceDetail.tsx'],
  [/^\/soluciones$/, 'src/pages/Solutions.tsx'],
  [/^\/industrias$/, 'src/pages/Industries.tsx'],
  [/^\/proyectos(\/|$)/, 'src/pages/Projects.tsx'],
  [/^\/nosotros$/, 'src/pages/About.tsx'],
  [/^\/contacto$/, 'src/pages/Contact.tsx'],
  [/^\/aviso-de-privacidad$/, 'src/pages/Privacy.tsx'],
]
function modulePreloads(path) {
  const key = PAGE_MODULE.find(([re]) => re.test(path))?.[1]
  if (!key) return ''
  if (!manifest[key]) throw new Error(`prerender: el manifiesto no tiene ${key}`)
  const files = new Set()
  const visit = (k) => {
    const chunk = manifest[k]
    if (!chunk || chunk.isEntry || files.has(chunk.file)) return
    files.add(chunk.file)
    for (const dep of chunk.imports ?? []) visit(dep)
  }
  visit(key)
  return [...files].map((f) => `<link rel="modulepreload" crossorigin href="/${f}" />\n`).join('')
}

// Las dos fuentes del primer pintado (titulares y texto) se piden junto con el HTML, no hasta leer el CSS.
const FONTS = [/^archivo-latin-600-normal-.+\.woff2$/, /^dm-sans-latin-400-normal-.+\.woff2$/]
const assets = readdirSync('dist/assets')
const fontPreloads = FONTS.map((re) => {
  const file = assets.find((f) => re.test(f))
  if (!file) throw new Error(`prerender: no se encontró la fuente ${re}`)
  return `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${file}" />
`
}).join('')
const withFonts = (html) => replace(html, /()(?=<link rel="icon")/, fontPreloads)

// Imagen de la portada: en escritorio es el elemento más grande y se pide con prioridad alta; en el teléfono va
// debajo del texto, así que no se precarga (el navegador le da prioridad al verla en pantalla).
const heroPreload = `<link rel="preload" as="image" href="${HERO_IMAGE.src}"${HERO_IMAGE.srcSet ? ` imagesrcset="${esc(HERO_IMAGE.srcSet)}" imagesizes="${esc(HERO_IMAGE.sizes)}"` : ''} fetchpriority="high" media="(min-width: 1024px)" />
`

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
    [/()(?=<\/head>)/, `${path === '/' ? heroPreload : ''}${modulePreloads(path)}<script type="application/ld+json">\n${structuredData(site, page)}\n</script>\n`],
  ]) html = replace(html, re, value)
  html = withFonts(withNoscript(await withBody(html, path)))
  const length = seo.description.length
  if (length > MAX_DESCRIPTION || length < MIN_DESCRIPTION) console.warn(`prerender: descripción de ${length} caracteres en ${path} (conviene de ${MIN_DESCRIPTION} a ${MAX_DESCRIPTION})`)
  const file = path === '/' ? 'dist/index.html' : `dist${path}.html`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

// 404.html: Vercel lo sirve con estado 404 en cualquier ruta que no exista, con la página «Esta página no existe».
let notFound = replace(base, /(<title>)[^<]*(?=<\/title>)/, esc(fullTitle('Página no encontrada')))
notFound = replace(notFound, /()<link rel="canonical"[^>]*>\n?/, '<meta name="robots" content="noindex" />\n')
notFound = replace(notFound, /()<meta property="og:url"[^>]*>\n?/, '')
writeFileSync('dist/404.html', withFonts(withNoscript(await withBody(notFound, '/404'))))

// Sitemap y robots: las mismas rutas que se prerenderizan. Sin <lastmod>: una fecha inexacta resta confianza.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(({ path }) => `  <url><loc>${esc(absolute(path))}</loc></url>`).join('\n')}
</urlset>
`
writeFileSync('dist/sitemap.xml', sitemap)
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`)

// El manifiesto sólo sirve para armar las precargas: no se publica.
rmSync('dist/.vite', { recursive: true, force: true })

console.log(`prerender: ${PAGES.length} páginas + 404, sitemap y robots → ${site}`)
