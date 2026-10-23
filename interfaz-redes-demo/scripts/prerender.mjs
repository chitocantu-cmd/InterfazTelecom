// Escribe un HTML por idioma y ruta (dist/soluciones/fibra-optica.html, dist/en/soluciones/fibra-optica.html, …) con el
// contenido de la página ya dibujado, su título, descripción, idioma, canonical, hreflang, Open Graph y datos
// estructurados, para que buscadores, WhatsApp y Facebook los vean sin ejecutar JavaScript y el navegador pinte antes;
// luego React toma ese HTML (hydrateRoot en main.tsx). También escribe dist/404.html, dist/sitemap.xml y
// dist/robots.txt a partir de las mismas rutas (src/data/seo.ts). Con cleanUrls, Vercel sirve cada archivo en su ruta.
// Páginas con noindex (idiomas sin revisión, casos demostrativos, borradores) se escriben pero no entran al sitemap.
// Uso: después de `vite build` y `vite build --ssr src/entry-server.tsx --outDir dist-ssr` (lo corre `npm run build`).
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { render, setup, fullTitle, MAX_DESCRIPTION, MIN_DESCRIPTION, structuredData, noscriptText, HERO_IMAGE, alternates, LOCALE_META, i18nFor } = await import(
  pathToFileURL(resolve('dist-ssr/entry-server.js')).href
)

// Borradores del centro técnico: sólo en builds de vista previa (VITE_BORRADORES=1), siempre con noindex.
const PAGES = await setup({ drafts: process.env.VITE_BORRADORES === '1' })

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
const withNoscript = (html, t) => replace(html, SLOT, `<noscript>${esc(noscriptText(t))}</noscript>`)

/** Contenido de la página dentro de #root. */
const withBody = async (html, path) => replace(html, /(<div id="root"[^>]*>)(?=<\/div>)/, await render(path))

// Archivos JS de cada página (se cargan bajo demanda): se precargan junto con el principal para que React tome
// el HTML sin esperar una segunda ida al servidor. Inicio va en el archivo principal; los textos de otro idioma también.
const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'))
const PAGE_MODULE = [
  [/^\/soluciones\/./, 'src/pages/ServiceDetail.tsx'],
  [/^\/soluciones$/, 'src/pages/Solutions.tsx'],
  [/^\/industrias\/./, 'src/pages/IndustryDetail.tsx'],
  [/^\/industrias$/, 'src/pages/Industries.tsx'],
  [/^\/proyectos(\/|$)/, 'src/pages/Projects.tsx'],
  [/^\/explorador$/, 'src/pages/Explorer.tsx'],
  [/^\/recursos(\/|$)/, 'src/pages/Resources.tsx'],
  [/^\/nosotros$/, 'src/pages/About.tsx'],
  [/^\/contacto$/, 'src/pages/Contact.tsx'],
  [/^\/aviso-de-privacidad$/, 'src/pages/Privacy.tsx'],
]
function chunkFiles(key) {
  if (!manifest[key]) throw new Error(`prerender: el manifiesto no tiene ${key}`)
  const files = new Set()
  const visit = (k) => {
    const chunk = manifest[k]
    if (!chunk || chunk.isEntry || files.has(chunk.file)) return
    files.add(chunk.file)
    for (const dep of chunk.imports ?? []) visit(dep)
  }
  visit(key)
  return [...files]
}
function modulePreloads(page) {
  const keys = []
  const pageKey = PAGE_MODULE.find(([re]) => re.test(page.base))?.[1]
  if (pageKey) keys.push(pageKey)
  if (page.locale !== 'es') keys.push(`src/i18n/locales/${page.locale}.ts`)
  const files = new Set(keys.flatMap(chunkFiles))
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

// Imagen de la portada: es el elemento más grande de la primera pantalla (también en el teléfono, donde asoma debajo
// del texto) y se pide con prioridad alta. Cada precarga repite el srcset/sizes de la <source> o el <img> que la usa,
// para que el navegador elija el mismo archivo y no lo descargue dos veces.
const heroPreload = `<link rel="preload" as="image" href="${HERO_IMAGE.src}"${HERO_IMAGE.srcSet ? ` imagesrcset="${esc(HERO_IMAGE.srcSet)}" imagesizes="${esc(HERO_IMAGE.sizes)}"` : ''} fetchpriority="high" media="(min-width: 1024px)" />
${HERO_IMAGE.mobileSrcSet ? `<link rel="preload" as="image" imagesrcset="${esc(HERO_IMAGE.mobileSrcSet)}" imagesizes="100vw" fetchpriority="high" media="${HERO_IMAGE.mobileMedia}" />
` : ''}`

/** <head> de una página: canonical y hreflang sólo si se indexa; robots noindex si no. */
function headFor(page) {
  if (page.noindex) return '<meta name="robots" content="noindex" />\n'
  return alternates(site, page.base).map((a) => `<link rel="alternate" hreflang="${a.lang}" href="${esc(a.href)}" />\n`).join('')
}

let written = 0
for (const page of PAGES) {
  const { path, seo, locale, noindex } = page
  const meta = LOCALE_META[locale]
  const { t } = i18nFor(locale)
  const title = esc(fullTitle(seo.title))
  const description = esc(seo.description)
  let html = base
  for (const [re, value] of [
    [/(<html lang=")[^"]*/, meta.htmlLang],
    [/(<title>)[^<]*(?=<\/title>)/, title],
    [/(<meta name="description" content=")[^"]*/, description],
    [/(<meta property="og:locale" content=")[^"]*/, meta.ogLocale],
    [/(<meta property="og:title" content=")[^"]*/, title],
    [/(<meta property="og:description" content=")[^"]*/, description],
    [/(<meta property="og:url" content=")[^"]*/, absolute(path)],
    [/(<link rel="canonical" href=")[^"]*/, absolute(path)],
    [/()(?=<\/head>)/, `${headFor(page)}${page.kind === 'home' ? heroPreload : ''}${modulePreloads(page)}<script type="application/ld+json">\n${structuredData(site, page, t)}\n</script>\n`],
  ]) html = replace(html, re, value)
  // Sin canonical en las páginas que no se indexan (Google no recomienda combinar noindex y canonical).
  if (noindex) html = replace(html, /()<link rel="canonical"[^>]*>\n?/, '')
  html = withFonts(withNoscript(await withBody(html, path), t))
  const length = seo.description.length
  if (locale === 'es' && (length > MAX_DESCRIPTION || length < MIN_DESCRIPTION)) console.warn(`prerender: descripción de ${length} caracteres en ${path} (conviene de ${MIN_DESCRIPTION} a ${MAX_DESCRIPTION})`)
  const file = path === '/' ? 'dist/index.html' : `dist${path}.html`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
  written++
}

// 404.html: Vercel lo sirve con estado 404 en cualquier ruta que no exista, con la página «Esta página no existe».
let notFound = replace(base, /(<title>)[^<]*(?=<\/title>)/, esc(fullTitle(i18nFor('es').t.seo.notFound.title)))
notFound = replace(notFound, /()<link rel="canonical"[^>]*>\n?/, '<meta name="robots" content="noindex" />\n')
notFound = replace(notFound, /()<meta property="og:url"[^>]*>\n?/, '')
notFound = replace(notFound, /(<div id="root")(?=>)/, ' data-pagina="404"')
writeFileSync('dist/404.html', withFonts(withNoscript(await withBody(notFound, '/404'), i18nFor('es').t)))

// Sitemap y robots: sólo las páginas indexables, con sus versiones en otros idiomas (xhtml:link) cuando las hay.
// Sin <lastmod>: una fecha inexacta resta confianza.
const indexable = PAGES.filter((p) => !p.noindex)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${indexable.map((p) => {
  const alts = alternates(site, p.base).map((a) => `\n    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${esc(a.href)}" />`).join('')
  return `  <url><loc>${esc(absolute(p.path))}</loc>${alts}${alts ? '\n  ' : ''}</url>`
}).join('\n')}
</urlset>
`
writeFileSync('dist/sitemap.xml', sitemap)
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`)

// El manifiesto sólo sirve para armar las precargas: no se publica.
rmSync('dist/.vite', { recursive: true, force: true })

console.log(`prerender: ${written} páginas (${indexable.length} indexables) + 404, sitemap y robots → ${site}`)
