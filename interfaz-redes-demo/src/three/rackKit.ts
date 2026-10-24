/**
 * Piezas del rack 3D, adaptadas de tools/renders/lib.js (la misma librería con la que se hicieron los primeros
 * renders del sitio) para dibujarse en tiempo real: texturas procedurales sin marcas ni especificaciones escritas,
 * geometrías de cordones unidas por color (menos llamadas de dibujo) y materiales compartidos.
 * Es una representación ilustrativa: no reproduce equipos de ningún fabricante.
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export const U = 0.04445 // 1U en metros
const PW = 1086 // panel de 19" (proporción 0.4826 / 0.04445)
const PH = 100

export function mulberry(seed: number) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  draw(c.getContext('2d')!, w, h)
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

// Grano: un mosaico de ruido de 128 px que se genera una vez y se superpone con un patrón (recorrer los píxeles de
// cada textura con getImageData costaba cientos de milisegundos al armar la escena).
let noiseTile: HTMLCanvasElement | null = null
function grain(g: CanvasRenderingContext2D, w: number, h: number, amount = 0.03) {
  if (!noiseTile) {
    noiseTile = document.createElement('canvas')
    noiseTile.width = noiseTile.height = 128
    const ng = noiseTile.getContext('2d')!
    const d = ng.createImageData(128, 128)
    const rnd = mulberry(7)
    for (let i = 0; i < d.data.length; i += 4) { const v = rnd() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 }
    ng.putImageData(d, 0, 0)
  }
  g.save()
  g.globalAlpha = Math.min(1, amount * 2.4)
  g.globalCompositeOperation = 'overlay'
  g.fillStyle = g.createPattern(noiseTile, 'repeat')!
  g.fillRect(0, 0, w, h)
  g.restore()
}

function ears(g: CanvasRenderingContext2D, h: number, color = '#1b1e21') {
  g.fillStyle = color; g.fillRect(0, 0, 40, h); g.fillRect(PW - 40, 0, 40, h)
  g.fillStyle = '#050607'
  for (const [x, y] of [[20, h * 0.3], [20, h * 0.7], [PW - 20, h * 0.3], [PW - 20, h * 0.7]]) { g.beginPath(); g.ellipse(x, y, 7, 9, 0, 0, 7); g.fill() }
}

function patchX(i: number, ports: number) {
  const groups = ports / 6, pw = 26, gap = 8.5, ggap = 34
  const total = ports * pw + (ports - groups) * gap + (groups - 1) * ggap
  let x = (PW - total) / 2
  for (let k = 0; k < i; k++) { x += pw + gap; if ((k + 1) % 6 === 0) x += ggap - gap }
  return x
}

export const tex = {
  patch: () => canvasTex(PW, PH, (g, w, h) => {
    g.fillStyle = '#121416'; g.fillRect(0, 0, w, h); ears(g, h)
    for (let i = 0; i < 24; i++) {
      const x = patchX(i, 24)
      g.fillStyle = '#e7ecef'; g.fillRect(x - 1, 14, 28, 13)
      g.fillStyle = '#1b1e21'; g.font = '10px monospace'; g.textAlign = 'center'; g.fillText(String(i + 1).padStart(2, '0'), x + 13, 25)
      g.fillStyle = '#030303'; g.fillRect(x, 38, 26, 30)
      g.fillStyle = '#2a2d30'; g.fillRect(x + 4, 41, 18, 6)
      g.fillStyle = '#b9a467'; for (let k = 0; k < 4; k++) g.fillRect(x + 6 + k * 4, 43, 2, 3)
    }
    grain(g, w, h)
  }),
  switch: (seed: number) => {
    const rnd = mulberry(seed)
    const leds: [number, number][] = []
    const map = canvasTex(PW, PH, (g, w, h) => {
      g.fillStyle = '#1f2327'; g.fillRect(0, 0, w, h); ears(g, h, '#2a2f34')
      for (let c = 0; c < 24; c++) {
        const x = 150 + c * 25 + Math.floor(c / 6) * 10
        for (let r = 0; r < 2; r++) {
          const y = 22 + r * 34
          g.fillStyle = '#060708'; g.fillRect(x, y, 22, 26)
          g.fillStyle = '#3a3f44'; g.fillRect(x + 3, y + (r ? 19 : 2), 16, 5)
          leds.push([x + 11, r ? y + 30 : y - 3])
        }
      }
      for (let s = 0; s < 4; s++) { const x = w - 60 - (4 - s) * 40; g.fillStyle = '#0a0b0c'; g.fillRect(x, 30, 32, 40); g.fillStyle = '#6d757c'; g.fillRect(x + 3, 33, 26, 34) }
      g.fillStyle = '#2e3338'; g.fillRect(60, 40, 70, 30)
      grain(g, w, h, 0.025)
    })
    const emissive = canvasTex(PW, PH, (g, w, h) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h)
      for (const [x, y] of leds) { const r = rnd(); if (r < 0.66) { g.fillStyle = r < 0.07 ? '#ffb100' : '#38ff7a'; g.fillRect(x - 3, y - 1, 6, 3) } }
      g.fillStyle = '#38ff7a'; g.fillRect(64, 30, 6, 4); g.fillStyle = '#2aa8ff'; g.fillRect(76, 30, 6, 4)
    })
    return { map, emissive }
  },
  fiber: () => canvasTex(PW, PH, (g, w, h) => {
    g.fillStyle = '#1a1d20'; g.fillRect(0, 0, w, h); ears(g, h)
    for (let i = 0; i < 24; i++) {
      const x = 130 + i * 35
      g.fillStyle = '#0aa5b8'; g.fillRect(x, 32, 28, 34)
      g.fillStyle = '#04363d'; g.fillRect(x + 4, 39, 8, 20); g.fillRect(x + 16, 39, 8, 20)
    }
    grain(g, w, h)
  }),
  manager: () => canvasTex(PW, PH, (g, w, h) => {
    g.fillStyle = '#0d0f11'; g.fillRect(0, 0, w, h)
    for (let i = 0; i < 24; i++) { const x = 70 + i * ((w - 140) / 24); g.fillStyle = '#1d2125'; g.fillRect(x, 6, 26, h - 12); g.fillStyle = '#050607'; g.fillRect(x + 26, 6, 12, h - 30) }
    grain(g, w, h)
  }),
  blank: (units: number) => canvasTex(PW, PH * units, (g, w, h) => {
    g.fillStyle = '#141619'; g.fillRect(0, 0, w, h); ears(g, h)
    g.fillStyle = '#1c1f23'; for (let y = 6; y < h; y += 10) g.fillRect(50, y, w - 100, 2)
    grain(g, w, h)
  }),
  /** Grabador de video: bahías de discos con indicadores. */
  nvr: (seed: number) => {
    const rnd = mulberry(seed)
    const h = PH * 2
    const leds: [number, number][] = []
    const map = canvasTex(PW, h, (g, w) => {
      g.fillStyle = '#16191c'; g.fillRect(0, 0, w, h); ears(g, h, '#23282c')
      const bw = (w - 300) / 8
      for (let i = 0; i < 8; i++) {
        const x = 200 + i * bw
        g.fillStyle = '#0b0d0f'; g.fillRect(x + 3, 14, bw - 6, h - 28)
        for (let k = 0; k < 14; k++) { g.fillStyle = '#20262b'; g.fillRect(x + 10, 26 + k * 10, bw - 20, 4) }
        leds.push([x + bw - 16, 20])
      }
      g.fillStyle = '#2b3136'; g.fillRect(60, 30, 110, 60)
      g.fillStyle = '#0e1114'; g.fillRect(70, 40, 90, 40)
      grain(g, w, h, 0.03)
    })
    const emissive = canvasTex(PW, h, (g, w) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h)
      for (const [x, y] of leds) { g.fillStyle = rnd() < 0.5 ? '#2aa8ff' : '#38ff7a'; g.fillRect(x, y, 7, 4) }
      g.fillStyle = '#123a5c'; g.fillRect(72, 42, 86, 36)
      g.fillStyle = '#2aa8ff'; g.fillRect(80, 52, 40, 4); g.fillRect(80, 62, 60, 4)
    })
    return { map, emissive }
  },
  /** UPS: frente liso con pantalla y botones. */
  ups: () => {
    const h = PH * 3
    const map = canvasTex(PW, h, (g, w) => {
      g.fillStyle = '#17191c'; g.fillRect(0, 0, w, h); ears(g, h, '#202428')
      g.fillStyle = '#1f2326'; for (let y = 20; y < h - 20; y += 12) g.fillRect(480, y, w - 560, 4)
      g.fillStyle = '#0c0e10'; g.fillRect(90, 80, 260, 120)
      g.fillStyle = '#2a2f33'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(130 + i * 70, 240, 14, 0, 7); g.fill() }
      grain(g, w, h)
    })
    const emissive = canvasTex(PW, h, (g, w) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h)
      g.fillStyle = '#103a55'; g.fillRect(96, 86, 248, 108)
      g.fillStyle = '#5fd3ff'; g.fillRect(116, 110, 120, 10); g.fillRect(116, 136, 180, 8); g.fillRect(116, 158, 90, 8)
      g.fillStyle = '#38ff7a'; g.beginPath(); g.arc(130, 240, 6, 0, 7); g.fill()
    })
    return { map, emissive }
  },
  floor: () => {
    const t = canvasTex(1024, 1024, (g, w, h) => {
      g.fillStyle = '#0a1626'; g.fillRect(0, 0, w, h)
      g.strokeStyle = 'rgba(38,165,220,0.22)'; g.lineWidth = 2
      for (let i = 0; i <= 8; i++) { const p = (i / 8) * w; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, h); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke() }
      grain(g, w, h, 0.02)
    })
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(10, 10)
    return t
  },
  contact: () => canvasTex(256, 256, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    r.addColorStop(0, 'rgba(0,0,0,0.85)'); r.addColorStop(0.55, 'rgba(0,0,0,0.35)'); r.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = r; g.fillRect(0, 0, w, h)
  }, false),
}

// Phong y no PBR: en Windows cada programa de shader pasa por Direct3D y los PBR tardaban cientos de milisegundos en
// compilarse (bloqueando la página). Para este estilo de ilustración técnica, Phong da el mismo brillo en los bordes.
const phong = (color: number, shininess: number, specular = 0x2a3038) => new THREE.MeshPhongMaterial({ color, shininess, specular })
export const MAT = {
  paint: phong(0x1c2026, 26),
  rail: phong(0x2e333a, 40, 0x3a4048),
  inner: new THREE.MeshPhongMaterial({ color: 0x050607, shininess: 0, specular: 0x000000 }),
  galv: phong(0xb3bac0, 60, 0x8a929a),
  duct: phong(0xd9a714, 30, 0x3a3320),
}
export const cable = (color: number) => phong(color, 22, 0x1d2a3a)

export type Unit = 'pp' | 'fo' | 'mg' | 'sw' | 'bl' | 'nvr' | 'ups'
export interface LayoutItem { t: Unit; u: number; seed?: number; part?: string }

// Tres variantes de frente de switch bastan para que no se vean repetidos; cada textura se dibuja una sola vez.
const switchCache = new Map<number, ReturnType<typeof tex.switch>>()
const switchTex = (variant: number) => switchCache.get(variant) ?? switchCache.set(variant, tex.switch(variant + 3)).get(variant)!

/** Rack de 42U. Frente en +X local, ancho en Z (0.6 m), fondo en X (1.07 m). Devuelve el grupo y las unidades con parte. */
export function buildRack(layout: LayoutItem[], { seed = 1, cords = true, cordColor = 0x1f6fd1 } = {}) {
  const rnd = mulberry(seed)
  const g = new THREE.Group()
  const W = 0.6, D = 1.07, H = 2.0, t = 0.03
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); mesh.position.set(x, y, z); g.add(mesh); return mesh
  }
  box(D, H, t, MAT.paint, -D / 2, H / 2, W / 2 - t / 2)
  box(D, H, t, MAT.paint, -D / 2, H / 2, -W / 2 + t / 2)
  box(D, t, W, MAT.paint, -D / 2, H - t / 2, 0)
  box(D, 0.1, W, MAT.paint, -D / 2, 0.05, 0)
  box(t, H, W, MAT.paint, -D + t / 2, H / 2, 0)
  box(0.02, H, 0.05, MAT.paint, -0.01, H / 2, W / 2 - 0.025)
  box(0.02, H, 0.05, MAT.paint, -0.01, H / 2, -W / 2 + 0.025)
  box(0.02, 0.07, W, MAT.paint, -0.01, H - 0.035, 0)
  box(0.02, 42 * U, 0.03, MAT.rail, -0.06, 0.12 + 21 * U, 0.2493)
  box(0.02, 42 * U, 0.03, MAT.rail, -0.06, 0.12 + 21 * U, -0.2493)
  box(0.01, H - 0.15, W - 0.06, MAT.inner, -D + 0.05, H / 2, 0)

  const cache = new Map<string, THREE.Material>()
  const units: { part?: string; mesh: THREE.Mesh; y: number; h: number; emissive?: THREE.MeshPhongMaterial }[] = []
  const pp: THREE.Vector3[][] = []
  const sw: THREE.Vector3[][] = []
  let u = 42
  for (const item of layout) {
    const n = item.u
    const yTop = 0.12 + u * U
    const yC = yTop - (n * U) / 2
    const key = `${item.t}${n}`
    let mat: THREE.MeshPhongMaterial
    if (item.t === 'pp') mat = (cache.get(key) ?? cache.set(key, new THREE.MeshPhongMaterial({ map: tex.patch(), shininess: 18, specular: 0x222831 })).get(key)) as THREE.MeshPhongMaterial
    else if (item.t === 'fo') mat = (cache.get(key) ?? cache.set(key, new THREE.MeshPhongMaterial({ map: tex.fiber(), shininess: 18, specular: 0x222831 })).get(key)) as THREE.MeshPhongMaterial
    else if (item.t === 'mg') mat = (cache.get(key) ?? cache.set(key, new THREE.MeshPhongMaterial({ map: tex.manager(), shininess: 8, specular: 0x14181d })).get(key)) as THREE.MeshPhongMaterial
    else if (item.t === 'sw') { const x = switchTex((item.seed ?? seed) % 3); mat = new THREE.MeshPhongMaterial({ map: x.map, emissiveMap: x.emissive, emissive: 0xffffff, emissiveIntensity: 1.5, shininess: 24, specular: 0x262c35 }) }
    else if (item.t === 'nvr') { const x = tex.nvr(item.seed ?? seed); mat = new THREE.MeshPhongMaterial({ map: x.map, emissiveMap: x.emissive, emissive: 0xffffff, emissiveIntensity: 1.4, shininess: 24, specular: 0x262c35 }) }
    else if (item.t === 'ups') { const x = tex.ups(); mat = new THREE.MeshPhongMaterial({ map: x.map, emissiveMap: x.emissive, emissive: 0xffffff, emissiveIntensity: 1.2, shininess: 20, specular: 0x222831 }) }
    else mat = (cache.get(key) ?? cache.set(key, new THREE.MeshPhongMaterial({ map: tex.blank(n), shininess: 18, specular: 0x222831 })).get(key)) as THREE.MeshPhongMaterial
    const depth = item.t === 'mg' ? 0.08 : item.t === 'pp' || item.t === 'fo' ? 0.12 : item.t === 'bl' ? 0.01 : item.t === 'ups' ? 0.6 : 0.45
    const forward = item.t === 'mg' ? 0.055 : 0
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(depth, n * U - 0.002, 0.4826), [mat, MAT.rail, MAT.rail, MAT.rail, MAT.rail, MAT.rail])
    mesh.position.set(-0.05 - depth / 2 + forward, yC, 0)
    if (item.part) mesh.userData.part = item.part
    g.add(mesh)
    units.push({ part: item.part, mesh, y: yC, h: n * U, emissive: mat.emissiveMap ? mat : undefined })
    if (item.t === 'pp') pp.push(Array.from({ length: 24 }, (_, i) => new THREE.Vector3(-0.05, yC - 0.004, (0.5 - (patchX(i, 24) + 13) / PW) * 0.4826)))
    if (item.t === 'sw') {
      const list: THREE.Vector3[] = []
      for (let c = 0; c < 24; c++) for (let r = 0; r < 2; r++) list.push(new THREE.Vector3(-0.05, yC + (r ? -0.0084 : 0.0067), (0.5 - (150 + c * 25 + Math.floor(c / 6) * 10 + 11) / PW) * 0.4826))
      sw.push(list)
    }
    u -= n
  }

  // Cordones de parcheo del patch panel al switch de abajo: una sola geometría por rack.
  if (cords) {
    const geos: THREE.BufferGeometry[] = []
    pp.forEach((ports, pi) => {
      const target = sw[pi]
      if (!target) return
      const used = new Set<number>()
      ports.forEach((a) => {
        if (rnd() < 0.12) return
        let best = -1, bd = 1e9
        target.forEach((p, j) => { if (used.has(j)) return; const dd = Math.abs(p.z - a.z) + (j % 2 === pi % 2 ? 0 : 0.004); if (dd < bd) { bd = dd; best = j } })
        if (best < 0) return
        used.add(best)
        const b = target[best]
        const out = 0.028 + rnd() * 0.014
        const midY = (a.y + b.y) / 2
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(a.x + 0.01, a.y, a.z), new THREE.Vector3(a.x + out, a.y - 0.006, a.z),
          new THREE.Vector3(a.x + out + 0.01, midY, (a.z + b.z) / 2), new THREE.Vector3(b.x + out, b.y + 0.006, b.z), new THREE.Vector3(b.x + 0.01, b.y, b.z),
        ], false, 'centripetal')
        geos.push(new THREE.TubeGeometry(curve, 20, 0.0029, 5, false))
      })
    })
    if (geos.length) { g.add(new THREE.Mesh(mergeGeometries(geos), cable(cordColor))); geos.forEach((x) => x.dispose()) }
  }
  return { group: g, units }
}

/** Escalerilla portacables a lo largo de Z con haces de cable (una geometría por haz). */
export function buildLadder({ length = 6, width = 0.4, y = 2.4, z0 = 0, bundles = [] as { offset: number; color: number; count?: number }[] }) {
  const g = new THREE.Group()
  const rail = new THREE.BoxGeometry(0.02, 0.06, length)
  const r1 = new THREE.Mesh(rail, MAT.galv); r1.position.set(-width / 2, y, z0 - length / 2)
  const r2 = new THREE.Mesh(rail, MAT.galv); r2.position.set(width / 2, y, z0 - length / 2)
  g.add(r1, r2)
  const rungs: THREE.BufferGeometry[] = []
  for (let z = 0; z < length; z += 0.3) { const b = new THREE.BoxGeometry(width, 0.015, 0.025); b.translate(0, y - 0.02, z0 - z); rungs.push(b) }
  g.add(new THREE.Mesh(mergeGeometries(rungs), MAT.galv)); rungs.forEach((b) => b.dispose())
  for (const { offset, color, count = 16 } of bundles) {
    const rnd = mulberry(Math.round(offset * 1000) + 7)
    const geos: THREE.BufferGeometry[] = []
    for (let i = 0; i < count; i++) {
      const ox = offset + (rnd() - 0.5) * 0.08
      const oy = y + 0.004 + rnd() * 0.035
      const pts: THREE.Vector3[] = []
      for (let k = 0; k <= 8; k++) pts.push(new THREE.Vector3(ox + (rnd() - 0.5) * 0.004, oy + (rnd() - 0.5) * 0.003, z0 - (k / 8) * length))
      geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.0035, 5, false))
    }
    g.add(new THREE.Mesh(mergeGeometries(geos), cable(color))); geos.forEach((x) => x.dispose())
  }
  return g
}

/** Bajadas de cable desde la escalerilla hasta el techo de cada rack, por la parte trasera. */
export function buildDrops(xs: number[], { yTop = 2.33, yBottom = 1.98, z = -0.78 } = {}) {
  const geos: THREE.BufferGeometry[] = []
  xs.forEach((x0, k) => {
    const rnd = mulberry(31 + k)
    for (let i = 0; i < 12; i++) {
      const ox = x0 - 0.12 + (rnd() - 0.5) * 0.06
      const oz = z + (rnd() - 0.5) * 0.05
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(ox, yTop, -0.45 + (rnd() - 0.5) * 0.05), new THREE.Vector3(ox, yTop - 0.06, (oz - 0.45) / 2),
        new THREE.Vector3(ox + (rnd() - 0.5) * 0.01, (yTop + yBottom) / 2, oz), new THREE.Vector3(ox, yBottom - 0.05, oz),
      ])
      geos.push(new THREE.TubeGeometry(curve, 16, 0.0035, 5, false))
    }
  })
  const g = new THREE.Group()
  g.add(new THREE.Mesh(mergeGeometries(geos), cable(0x1f6fd1)))
  geos.forEach((x) => x.dispose())
  return g
}

/** Canaleta de fibra (amarilla). */
export function buildDuct({ length = 6, y = 2.6, z0 = 0 }) {
  const g = new THREE.Group()
  const parts = [new THREE.BoxGeometry(0.12, 0.006, length).translate(0, y, z0 - length / 2), new THREE.BoxGeometry(0.006, 0.1, length).translate(-0.06, y + 0.05, z0 - length / 2), new THREE.BoxGeometry(0.006, 0.1, length).translate(0.06, y + 0.05, z0 - length / 2)]
  g.add(new THREE.Mesh(mergeGeometries(parts), MAT.duct)); parts.forEach((p) => p.dispose())
  return g
}

/** Libera geometrías, materiales y texturas de un objeto y sus hijos. */
export function disposeDeep(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : []
    for (const m of mats) {
      for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose()
      m.dispose()
    }
  })
}
