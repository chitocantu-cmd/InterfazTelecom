// Genera public/sitemap.xml y public/robots.txt a partir de los datos del sitio.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

// En Vercel las variables pueden venir sólo del panel (process.env), sin archivo .env.
const env = existsSync('.env')
  ? Object.fromEntries(readFileSync('.env', 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => l.split('=').map((x) => x.trim())))
  : {}
// Mismo criterio que vite.config.ts: en Vercel, el dominio de producción del proyecto.
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
const SITE = (process.env.VITE_SITE_URL || vercel || env.VITE_SITE_URL || 'https://interfazredes.com').replace(/\/$/, '')
const slugs = (file) => [...readFileSync(file, 'utf8').matchAll(/slug: '([^']+)'/g)].map((m) => m[1])

const pages = [
  ['/', '1.0'],
  ['/soluciones', '0.9'],
  ...slugs('src/data/solutions.ts').map((s) => [`/soluciones/${s}`, '0.8']),
  ['/industrias', '0.7'],
  ['/proyectos', '0.7'],
  ...slugs('src/data/content.ts').map((s) => [`/proyectos/${s}`, '0.5']),
  ['/nosotros', '0.6'],
  ['/contacto', '0.8'],
  ['/aviso-de-privacidad', '0.2'],
]
const today = new Date().toISOString().slice(0, 10)
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([p, pr]) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`
writeFileSync('public/sitemap.xml', xml)
writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
console.log(`sitemap: ${pages.length} URLs → ${SITE}`)
