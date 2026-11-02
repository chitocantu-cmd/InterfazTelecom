// Giro táctil del site para teléfonos y tabletas (RackTouch.tsx): renderiza la escena 3D real en formato vertical con
// la GPU de este equipo. Genera, en src/assets/site3d-touch/:
//   f00…fNN.webp  cuadros de la órbita (se recorren con el dedo, sin WebGL en el teléfono)
//   <pieza>.webp  acercamiento de cada componente (mismo encuadre vertical)
// y src/data/site3d-orbit.ts con la posición de cada pieza en cada cuadro (para las líneas guía).
//
// Uso, desde interfaz-redes-demo/:  npx vite --port 5199
//                                    node tools/site3d-orbit.mjs http://localhost:5199/
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/assets/site3d-touch')
const W = 800, H = 1000
/** Tamaño final. Cuadros más ligeros que los acercamientos: se ven en movimiento. */
const FRAME = { w: 720, h: 900, q: 0.66 }
const STILL = { w: 900, h: 1125, q: 0.78 }
/** Órbita: de `from` a `to` radianes, en pasos de `step` (10 px de arrastre = 0.05 rad en rackScene.ts). */
const ORBIT = { from: 0.9, frames: 25, stepPx: 10 }
const PARTS = ['tray', 'fiber', 'patch', 'organizer', 'switch', 'nvr', 'ups']

const url = process.argv[2] ?? 'http://localhost:5199/'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: W + 40, height: H + 40 }, deviceScaleFactor: 1.5 })
page.on('pageerror', (e) => console.log('pageerror', e.message))
await page.goto(url, { waitUntil: 'load' })

await page.evaluate(async ({ W, H, PARTS }) => {
  document.body.innerHTML = ''
  const wrap = document.createElement('div')
  wrap.id = 'captura'
  wrap.style.cssText = `position:fixed;left:0;top:0;width:${W}px;height:${H}px;z-index:9999;background:#060d17;overflow:hidden`
  const host = document.createElement('div'); host.style.cssText = 'position:absolute;inset:0'
  const overlay = document.createElement('div'); overlay.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none'
  wrap.append(host, overlay); document.body.append(wrap)
  const style = document.createElement('style')
  // Sin marcas ni etiquetas (van en el DOM del teléfono); esquinas del marco más gruesas para verse reducidas.
  style.textContent = `.rack-marker, .rack-focus-label { display: none !important; }
    .rack-focus i { width: 30px; height: 30px; }
    .rack-focus i:nth-child(1) { border-width: 3px 0 0 3px; } .rack-focus i:nth-child(2) { border-width: 3px 3px 0 0; }
    .rack-focus i:nth-child(3) { border-width: 0 0 3px 3px; } .rack-focus i:nth-child(4) { border-width: 0 3px 3px 0; }`
  document.head.append(style)
  const { createRackScene } = await import('/src/three/rackScene.ts')
  await new Promise((ok, fail) => {
    createRackScene(host, overlay, { onSelect() {}, onReady: ok, labels: Object.fromEntries(PARTS.map((p) => [p, ''])), reduced: true })
      .then((s) => { window.__scene = s })
      .catch(fail)
  })
}, { W, H, PARTS })
await page.waitForFunction(() => window.__scene, null, { timeout: 60000 })
await page.waitForTimeout(800)

const encode = async (name, { w, h, q }) => {
  const png = (await page.locator('#captura').screenshot()).toString('base64')
  const webp = await page.evaluate(async ({ png, w, h, q }) => {
    const img = new Image(); img.src = `data:image/png;base64,${png}`; await img.decode()
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'
    // Más exposición que en escritorio: en un teléfono, con luz ambiente, las sombras del cuarto se cierran.
    ctx.filter = 'brightness(1.34) contrast(1.05) saturate(1.05)'
    ctx.drawImage(img, 0, 0, w, h)
    return c.toDataURL('image/webp', q).split(',')[1]
  }, { png, w, h, q })
  const buf = Buffer.from(webp, 'base64')
  writeFileSync(`${OUT}/${name}.webp`, buf)
  return buf.length
}

// Posiciones (0–1) de cada pieza: rackScene.ts las escribe en cada marca aunque estén ocultas.
const anchors = () => page.evaluate(({ W, H, PARTS }) => PARTS.map((p) => {
  const m = document.querySelector(`.rack-marker[data-part="${p}"]`).style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/)
  return [+(+m[1] / W).toFixed(4), +(+m[2] / H).toFixed(4)]
}), { W, H, PARTS })

// Acercamientos (la escena sin movimiento salta directo a cada vista).
let total = 0
for (const p of PARTS) {
  await page.evaluate((p) => window.__scene.focus(p), p)
  await page.waitForTimeout(900)
  total += await encode(p, STILL)
}
await page.evaluate(() => window.__scene.focus(null))
await page.waitForTimeout(900)
total += await encode('overview', STILL)
console.log('acercamientos', Math.round(total / 1024), 'KB')

// Órbita: se arrastra con el mouse real sobre el lienzo. Primero se lleva la cámara al inicio (theta de la vista
// general: 0.48) y después avanza de 10 en 10 px.
const start = { x: 120, y: H / 2 }
await page.mouse.move(start.x, start.y)
await page.mouse.down()
let x = start.x
const toStart = Math.round((ORBIT.from - 0.48) / 0.005)
x -= toStart
await page.mouse.move(x, start.y, { steps: 6 })
await page.waitForTimeout(400)
const frames = []
total = 0
for (let i = 0; i < ORBIT.frames; i++) {
  await page.waitForTimeout(260)
  total += await encode(`f${String(i).padStart(2, '0')}`, FRAME)
  frames.push(await anchors())
  x += ORBIT.stepPx
  await page.mouse.move(x, start.y)
}
await page.mouse.up()
console.log('cuadros', ORBIT.frames, Math.round(total / 1024), 'KB')
await browser.close()

const data = `// Generado por tools/site3d-orbit.mjs: no editar a mano.
// Posición de cada pieza (fracción del ancho y alto) en cada cuadro de la órbita: frames[cuadro][pieza] = [x, y].
// Se descarga junto con los cuadros, sólo cuando el visitante se acerca a la sección.
export const ORBIT_PARTS = ${JSON.stringify(PARTS)} as const
/** Cuadro más cercano a la vista general de la escena (el primero que se ve). */
export const ORBIT_HOME = ${Math.round((ORBIT.from - 0.48) / (ORBIT.stepPx * 0.005))}
export const ORBIT_FRAMES: [number, number][][] = ${JSON.stringify(frames)}
`
writeFileSync(resolve(ROOT, 'src/data/site3d-orbit.ts'), data)
console.log('datos listos')
