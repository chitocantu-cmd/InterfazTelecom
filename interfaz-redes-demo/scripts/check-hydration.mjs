// Revisa que el HTML prerenderizado coincida con lo que dibuja React en el navegador (hidratación).
// Sirve cada página prerenderizada con React en modo desarrollo (el que avisa de diferencias), la abre en Chrome
// en escritorio y móvil, y reporta cualquier aviso o error de consola. Si React encuentra una diferencia, descarta
// el HTML y vuelve a dibujar la página: se pierde lo ganado con el prerender y puede verse un salto.
// Uso: npm run check:hydration [-- "/ruta?param=1,/otra#ancla"]   (REDUCE=1 simula «reducir movimiento»)
import { readFileSync } from 'node:fs'
import http from 'node:http'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'

const PORT = 5288
const vite = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  cacheDir: 'node_modules/.vite-hydration',
  // Como Node: React Router en su versión ESM (condición module-sync), no la CommonJS.
  ssr: { resolve: { externalConditions: ['module-sync'] } },
})
const template = readFileSync('index.html', 'utf8')
const server = http.createServer((req, res) => {
  vite.middlewares(req, res, async () => {
    try {
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
      const body = await render(req.url.split(/[?#]/)[0])
      const html = (await vite.transformIndexHtml(req.url, template)).replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
      res.setHeader('content-type', 'text/html; charset=utf-8')
      res.end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      res.statusCode = 500
      res.end(String(e.stack))
    }
  })
})
await new Promise((ok) => server.listen(PORT, ok))

const { PAGES } = await vite.ssrLoadModule('/src/data/seo.ts')
const extra = (process.argv[2] ?? '').split(',').filter(Boolean)
const routes = [...PAGES.map((p) => p.path), '/no-existe', '/industrias?sector=cedis', '/contacto?tipo=fibra', '/proyectos?categoria=CCTV', '/soluciones#fibra', ...extra]
const IGNORE = ['Download the React DevTools', '[vite]', 'Reduced Motion enabled', '/api/cotizacion']

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'chrome' })
let problems = 0
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport, reducedMotion: process.env.REDUCE ? 'reduce' : 'no-preference' })
  for (const route of routes) {
    const page = await context.newPage()
    const messages = []
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') messages.push(m.text().slice(0, 400)) })
    page.on('pageerror', (e) => messages.push(`pageerror: ${e.message}`))
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    const relevant = messages.filter((m) => !IGNORE.some((i) => m.includes(i)))
    if (relevant.length) {
      problems++
      console.log(`✗ ${viewport.width}px ${route}\n   ${relevant.join('\n   ')}`)
    }
    await page.close()
  }
  await context.close()
}
await browser.close()
server.close()
await vite.close()
console.log(problems ? `${problems} páginas con avisos` : `sin avisos de hidratación (${routes.length} rutas × 2 anchos)`)
process.exit(problems ? 1 : 0)
