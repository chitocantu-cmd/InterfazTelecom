// Vistas fijas de la escena 3D del site (vista general y cada componente enfocado) para donde no corre el 3D:
// teléfono, equipos sin WebGL y «reducir movimiento» (src/data/site3d.ts). Renderiza la escena real en Chrome con la
// GPU, oculta marcas, barra superior y la etiqueta del marco (deja esquinas y viñeta: sin texto, sirven en cualquier
// idioma) y guarda WebP de 1320 × 825 en src/assets/img/site3d/. Después, `python tools/variantes.py` crea las
// versiones reducidas.
//
// Uso, desde interfaz-redes-demo/:  npx vite build && npx vite preview --port 4173
//                                    node tools/site3d-stills.mjs http://localhost:4173/
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/assets/img/site3d')
const W = 1320, H = 825
// Botones de la lista en español (el nombre visible termina en el nombre de la pieza).
const PARTS = [['tray', 'Escalerilla y canaleta'], ['fiber', 'Bandeja de fibra'], ['patch', 'Patch panel'], ['organizer', 'Organizadores'], ['switch', 'Switch'], ['nvr', 'Grabador de video (NVR)'], ['ups', 'UPS']]

// A este ancho el sitio elegiría la versión ligera: se fuerza la escena 3D.
const url = new URL('?experiencia=full', process.argv[2] ?? 'http://localhost:4173/').href
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] })
// Escenario de menos de 900 px de ancho: encuadre centrado (sin el corrimiento que deja lugar a la lista en escritorio).
const page = await browser.newPage({ viewport: { width: 939, height: 900 }, deviceScaleFactor: 1.5 })
await page.goto(url, { waitUntil: 'networkidle' })
// Esquinas un poco más gruesas: la imagen se ve reducida en el teléfono.
await page.addStyleTag({ content: `.rack-marker, .rack-focus-label, .rack-toolbar { display: none !important; }
  .rack-focus i { width: 26px; height: 26px; }
  .rack-focus i:nth-child(1) { border-width: 3px 0 0 3px; } .rack-focus i:nth-child(2) { border-width: 3px 3px 0 0; }
  .rack-focus i:nth-child(3) { border-width: 0 0 3px 3px; } .rack-focus i:nth-child(4) { border-width: 0 3px 3px 0; }` })
const stage = page.locator('.rack-stage > div').first()
const show = () => page.evaluate(() => { const el = document.querySelector('.rack-stage'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'instant' }) })
await show()
await page.waitForSelector('.rack-host canvas', { timeout: 20000 })
await page.waitForFunction(() => !document.querySelector('.rack-stage')?.textContent?.match(/Preparando la escena/), null, { timeout: 20000 })
await page.waitForTimeout(2500)

const save = async (name) => {
  await show(); await page.waitForTimeout(400)
  const png = (await stage.screenshot()).toString('base64')
  // WebP con el codificador del propio navegador, escalado al tamaño final.
  const webp = await page.evaluate(async ({ png, W, H }) => {
    const img = new Image(); img.src = `data:image/png;base64,${png}`; await img.decode()
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'
    const s = Math.max(W / img.width, H / img.height)
    ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s)
    return c.toDataURL('image/webp', 0.84).split(',')[1]
  }, { png, W, H })
  writeFileSync(`${OUT}/${name}.webp`, Buffer.from(webp, 'base64'))
  console.log(`${name}.webp`)
}

await save('overview')
for (const [name, label] of PARTS) {
  await page.getByRole('button', { name: new RegExp(`${label.replace(/[()]/g, '\\$&')}$`) }).first().dispatchEvent('click')
  await page.waitForTimeout(2200)
  await save(name)
}
await browser.close()
