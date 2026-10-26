/**
 * Piezas del site 3D: racks de 42U, equipo montado, cordones con conectores, organizadores verticales con haces de
 * cable, escalerilla, canaleta, varillas roscadas, luminarias, piso técnico y muro. Texturas procedurales dibujadas
 * en canvas (sin marcas ni especificaciones escritas) y materiales físicos (PBR). Las geometrías repetidas se unen
 * en una sola por material para dibujar con pocas llamadas.
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export const U = 0.04445 // 1U en metros
const PW = 1086 // frente de 19" en píxeles (proporción 0.4826 / 0.04445)
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
  t.anisotropy = 8
  return t
}

// Grano: un mosaico de ruido de 128 px generado una vez y superpuesto con un patrón (barato).
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

/** Orejas de montaje con tornillos (en las orillas de cada frente de 19"). */
function ears(g: CanvasRenderingContext2D, h: number, color = '#1d2024') {
  g.fillStyle = color; g.fillRect(0, 0, 42, h); g.fillRect(PW - 42, 0, 42, h)
  for (const x of [21, PW - 21]) for (const y of h > 120 ? [h * 0.2, h * 0.8] : [h * 0.5]) {
    const r = g.createRadialGradient(x - 2, y - 2, 1, x, y, 8)
    r.addColorStop(0, '#9aa1a8'); r.addColorStop(1, '#3b4045')
    g.fillStyle = r; g.beginPath(); g.arc(x, y, 7.5, 0, 7); g.fill()
    g.strokeStyle = '#22262a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.moveTo(x, y - 4); g.lineTo(x, y + 4); g.stroke()
  }
}

/** Biselado sutil: el frente se oscurece hacia los bordes (se lee como volumen). */
function bevel(g: CanvasRenderingContext2D, w: number, h: number) {
  const v = g.createLinearGradient(0, 0, 0, h)
  v.addColorStop(0, 'rgba(255,255,255,0.06)'); v.addColorStop(0.08, 'rgba(255,255,255,0)'); v.addColorStop(0.92, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)')
  g.fillStyle = v; g.fillRect(0, 0, w, h)
}

function jack(g: CanvasRenderingContext2D, x: number, y: number, w = 24, h = 26) {
  g.fillStyle = '#020203'; g.fillRect(x, y, w, h)
  g.fillStyle = '#16191c'; g.fillRect(x + 3, y + h - 8, w - 6, 5)
  g.fillStyle = '#b39a55'; for (let k = 0; k < 4; k++) g.fillRect(x + 5 + k * 4, y + 3, 2, 4)
}

function patchX(i: number) {
  const pw = 26, gap = 8.5, ggap = 34
  const total = 24 * pw + 20 * gap + 3 * ggap
  let x = (PW - total) / 2
  for (let k = 0; k < i; k++) { x += pw + gap; if ((k + 1) % 6 === 0) x += ggap - gap }
  return x
}
const switchX = (c: number) => 150 + c * 25 + Math.floor(c / 6) * 10

export const tex = {
  patch: () => canvasTex(PW, PH, (g, w, h) => {
    g.fillStyle = '#16191c'; g.fillRect(0, 0, w, h); ears(g, h)
    for (let i = 0; i < 24; i++) {
      const x = patchX(i)
      g.fillStyle = '#e4e8eb'; g.fillRect(x - 1, 12, 28, 14)
      g.fillStyle = '#20252a'; g.font = '600 10px monospace'; g.textAlign = 'center'; g.fillText(String(i + 1).padStart(2, '0'), x + 13, 23)
      jack(g, x + 1, 36)
    }
    bevel(g, w, h); grain(g, w, h)
  }),
  switch: (seed: number) => {
    const rnd = mulberry(seed)
    const leds: [number, number, number][] = []
    const map = canvasTex(PW, PH, (g, w, h) => {
      const bg = g.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0, '#2a2f35'); bg.addColorStop(1, '#1d2125')
      g.fillStyle = bg; g.fillRect(0, 0, w, h); ears(g, h, '#262a2f')
      for (let c = 0; c < 24; c++) for (let r = 0; r < 2; r++) {
        const x = switchX(c), y = 20 + r * 34
        jack(g, x, y, 22, 26)
        leds.push([x + 11, r ? y + 30 : y - 4, r])
      }
      for (let s = 0; s < 4; s++) { const x = w - 64 - (4 - s) * 40; g.fillStyle = '#08090a'; g.fillRect(x, 30, 32, 40); g.fillStyle = '#5d646b'; g.fillRect(x + 3, 33, 26, 34); g.fillStyle = '#1b1f23'; g.fillRect(x + 8, 40, 16, 20) }
      g.fillStyle = '#121518'; for (let k = 0; k < 6; k++) g.fillRect(60, 28 + k * 8, 66, 3)
      bevel(g, w, h); grain(g, w, h, 0.02)
    })
    const emissive = canvasTex(PW, PH, (g, w, h) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h)
      for (const [x, y] of leds) { const r = rnd(); if (r < 0.7) { g.fillStyle = r < 0.06 ? '#ffae00' : '#3dff86'; g.fillRect(x - 3, y - 1, 6, 3) } }
      g.fillStyle = '#3dff86'; g.fillRect(64, 18, 6, 4); g.fillStyle = '#2aa8ff'; g.fillRect(76, 18, 6, 4)
    })
    return { map, emissive }
  },
  fiber: () => canvasTex(PW, PH, (g, w, h) => {
    g.fillStyle = '#1b1f23'; g.fillRect(0, 0, w, h); ears(g, h)
    for (let i = 0; i < 24; i++) {
      const x = 128 + i * 35
      g.fillStyle = '#12a8b9'; g.fillRect(x, 30, 28, 38)
      g.fillStyle = '#0d7f8c'; g.fillRect(x, 62, 28, 6)
      g.fillStyle = '#05383f'; g.fillRect(x + 4, 38, 8, 20); g.fillRect(x + 16, 38, 8, 20)
    }
    bevel(g, w, h); grain(g, w, h)
  }),
  manager: () => canvasTex(PW, PH, (g, w, h) => {
    g.fillStyle = '#0c0e10'; g.fillRect(0, 0, w, h)
    for (let i = 0; i < 26; i++) {
      const x = 56 + i * ((w - 112) / 26)
      const f = g.createLinearGradient(x, 0, x + 26, 0)
      f.addColorStop(0, '#24282d'); f.addColorStop(1, '#14171a')
      g.fillStyle = f; g.fillRect(x, 8, 26, h - 16)
    }
    bevel(g, w, h); grain(g, w, h)
  }),
  /** Tapa ventilada: perforación hexagonal. */
  blank: (units: number) => canvasTex(PW, PH * units, (g, w, h) => {
    g.fillStyle = '#17191c'; g.fillRect(0, 0, w, h); ears(g, h)
    g.fillStyle = '#08090a'
    for (let y = 12, row = 0; y < h - 8; y += 9, row++) for (let x = 60 + (row % 2) * 5; x < w - 60; x += 10) { g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill() }
    bevel(g, w, h); grain(g, w, h)
  }),
  nvr: (seed: number) => {
    const rnd = mulberry(seed)
    const h = PH * 2
    const leds: [number, number][] = []
    const map = canvasTex(PW, h, (g, w) => {
      g.fillStyle = '#191c20'; g.fillRect(0, 0, w, h); ears(g, h, '#23282c')
      const bw = (w - 320) / 8
      for (let i = 0; i < 8; i++) {
        const x = 210 + i * bw
        g.fillStyle = '#0b0d0f'; g.fillRect(x + 3, 14, bw - 6, h - 28)
        g.fillStyle = '#262c31'; for (let k = 0; k < 15; k++) g.fillRect(x + 10, 30 + k * 9, bw - 20, 3)
        g.fillStyle = '#4a5157'; g.fillRect(x + bw / 2 - 10, h - 30, 20, 8)
        leds.push([x + bw - 18, 20])
      }
      g.fillStyle = '#2b3136'; g.fillRect(64, 34, 116, 64)
      bevel(g, w, h); grain(g, w, h, 0.03)
    })
    const emissive = canvasTex(PW, h, (g, w) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h)
      for (const [x, y] of leds) { g.fillStyle = rnd() < 0.5 ? '#2aa8ff' : '#3dff86'; g.fillRect(x, y, 8, 4) }
      g.fillStyle = '#0f3554'; g.fillRect(70, 40, 104, 52)
      g.fillStyle = '#5fc9ff'; g.fillRect(80, 52, 46, 4); g.fillRect(80, 62, 70, 4); g.fillRect(80, 72, 30, 4)
    })
    return { map, emissive }
  },
  ups: () => {
    const h = PH * 3
    const map = canvasTex(PW, h, (g, w) => {
      g.fillStyle = '#191b1f'; g.fillRect(0, 0, w, h); ears(g, h, '#202428')
      g.fillStyle = '#0d0f11'; for (let y = 24; y < h - 24; y += 11) g.fillRect(470, y, w - 550, 5)
      g.fillStyle = '#0a0c0e'; g.fillRect(92, 70, 270, 130)
      g.fillStyle = '#2b3035'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(138 + i * 72, 246, 15, 0, 7); g.fill() }
      bevel(g, w, h); grain(g, w, h)
    })
    const emissive = canvasTex(PW, h, (g, w) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h)
      g.fillStyle = '#0d3550'; g.fillRect(98, 76, 258, 118)
      g.fillStyle = '#6fd6ff'; g.fillRect(120, 100, 130, 10); g.fillRect(120, 126, 190, 8); g.fillRect(120, 148, 96, 8)
      g.fillStyle = '#3dff86'; g.beginPath(); g.arc(138, 246, 6, 0, 7); g.fill()
    })
    return { map, emissive }
  },
  /** Piso técnico: losetas de 60 cm, con perforación en las del pasillo frío. */
  floor: (perforated: boolean) => {
    const t = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = perforated ? '#4f565d' : '#5a6168'; g.fillRect(0, 0, w, h)
      if (perforated) { g.fillStyle = '#3d4348'; for (let y = 34; y < h - 30; y += 15) for (let x = 34; x < w - 30; x += 15) { g.beginPath(); g.arc(x, y, 4.2, 0, 7); g.fill() } }
      g.strokeStyle = '#3a4045'; g.lineWidth = 6; g.strokeRect(0, 0, w, h)
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 2; g.strokeRect(5, 5, w - 10, h - 10)
      grain(g, w, h, 0.05)
    })
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
  },
  /** Puerta perforada (canal alfa): se ven los LED y el equipo, atenuados. */
  door: () => {
    const t = canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h)
      g.fillStyle = '#000000'
      for (let y = 6, row = 0; y < h; y += 11, row++) for (let x = 6 + (row % 2) * 5.5; x < w; x += 11) { g.beginPath(); g.arc(x, y, 3.6, 0, 7); g.fill() }
    }, false)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
  },
  wall: () => {
    const t = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = '#262d35'; g.fillRect(0, 0, w, h)
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, h - 3, w, 3); g.fillRect(w - 3, 0, 3, h)
      grain(g, w, h, 0.06)
    })
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
  },
  rail: () => {
    // 42U con tres perforaciones cuadradas por U (paso de 1024 / 126 px; agujero del 60 % del paso).
    const t = canvasTex(32, 1024, (g, w, h) => {
      g.fillStyle = '#9aa1a7'; g.fillRect(0, 0, w, h)
      const step = h / 126
      g.fillStyle = '#121416'; for (let y = step * 0.2; y < h; y += step) g.fillRect(10, y, 12, step * 0.6)
    })
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
  },
}

// Materiales físicos compartidos.
const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o)
export const MAT = {
  coat: std({ color: 0x16191d, roughness: 0.52, metalness: 0.3 }),
  coatEdge: std({ color: 0x23272c, roughness: 0.4, metalness: 0.45 }),
  inner: std({ color: 0x050607, roughness: 1, metalness: 0 }),
  galv: std({ color: 0xa9b0b6, roughness: 0.34, metalness: 0.92 }),
  rod: std({ color: 0x8c949b, roughness: 0.4, metalness: 0.9 }),
  duct: std({ color: 0xc99a22, roughness: 0.62, metalness: 0 }),
  plastic: std({ color: 0x111316, roughness: 0.6, metalness: 0 }),
  strap: std({ color: 0x0a0b0c, roughness: 0.85, metalness: 0 }),
  copper: std({ color: 0xb87333, roughness: 0.32, metalness: 1 }),
  boot: std({ color: 0x3b4148, roughness: 0.5, metalness: 0 }),
}
export const cable = (color: number, roughness = 0.42) => std({ color, roughness, metalness: 0 })

export type Unit = 'pp' | 'fo' | 'mg' | 'sw' | 'bl' | 'nvr' | 'ups'
export interface LayoutItem { t: Unit; u: number; seed?: number; part?: string }
export interface RackUnit { part?: string; mesh: THREE.Mesh; y: number; h: number; emissive?: THREE.MeshStandardMaterial }

const texCache = new Map<string, THREE.Texture | { map: THREE.Texture; emissive: THREE.Texture }>()
function cached<T extends THREE.Texture | { map: THREE.Texture; emissive: THREE.Texture }>(key: string, make: () => T): T {
  return (texCache.get(key) as T) ?? (texCache.set(key, make()).get(key) as T)
}

/**
 * Rack de 42U. Frente en +X local, ancho en Z (0.6 m), fondo en X (1.07 m).
 * `door`: puerta frontal perforada (los racks vecinos); el rack que se explora va abierto.
 */
export function buildRack(layout: LayoutItem[], { seed = 1, cords = true, cordColor = 0x1f6fd1, door = false } = {}) {
  const rnd = mulberry(seed)
  const g = new THREE.Group()
  const W = 0.6, D = 1.07, H = 2.0, t = 0.03
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, shadow = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
    mesh.position.set(x, y, z); mesh.castShadow = shadow; mesh.receiveShadow = true
    g.add(mesh)
    return mesh
  }
  box(D, H, t, MAT.coat, -D / 2, H / 2, W / 2 - t / 2)
  box(D, H, t, MAT.coat, -D / 2, H / 2, -W / 2 + t / 2)
  box(D, t, W, MAT.coat, -D / 2, H - t / 2, 0)
  box(D, 0.08, W - 0.02, MAT.coat, -D / 2, 0.04, 0)
  box(t, H, W, MAT.coat, -D + t / 2, H / 2, 0)
  // Marco frontal con canto más claro y zoclo
  box(0.025, H, 0.045, MAT.coatEdge, -0.0125, H / 2, W / 2 - 0.0225)
  box(0.025, H, 0.045, MAT.coatEdge, -0.0125, H / 2, -W / 2 + 0.0225)
  box(0.025, 0.07, W, MAT.coatEdge, -0.0125, H - 0.035, 0)
  box(0.03, 0.06, W, MAT.plastic, -0.015, 0.03, 0)
  // Rieles perforados
  const railMat = std({ map: cached('rail', tex.rail) as THREE.Texture, roughness: 0.38, metalness: 0.85 })
  ;(railMat.map as THREE.Texture).repeat.set(1, 1)
  box(0.02, 42 * U, 0.032, railMat, -0.06, 0.12 + 21 * U, 0.2493, false)
  box(0.02, 42 * U, 0.032, railMat, -0.06, 0.12 + 21 * U, -0.2493, false)
  box(0.01, H - 0.15, W - 0.06, MAT.inner, -D + 0.05, H / 2, 0, false)

  const units: RackUnit[] = []
  const pp: THREE.Vector3[][] = []
  const sw: THREE.Vector3[][] = []
  let u = 42
  for (const item of layout) {
    const n = item.u
    const yC = 0.12 + u * U - (n * U) / 2
    let mat: THREE.MeshStandardMaterial
    const glowing = (x: { map: THREE.Texture; emissive: THREE.Texture }, intensity: number, rough = 0.45) =>
      std({ map: x.map, emissiveMap: x.emissive, emissive: 0xffffff, emissiveIntensity: intensity, roughness: rough, metalness: 0.35 })
    if (item.t === 'pp') mat = std({ map: cached('pp', tex.patch) as THREE.Texture, roughness: 0.5, metalness: 0.3 })
    else if (item.t === 'fo') mat = std({ map: cached('fo', tex.fiber) as THREE.Texture, roughness: 0.45, metalness: 0.3 })
    else if (item.t === 'mg') mat = std({ map: cached('mg', tex.manager) as THREE.Texture, roughness: 0.7, metalness: 0 })
    else if (item.t === 'sw') mat = glowing(cached(`sw${(item.seed ?? seed) % 3}`, () => tex.switch(((item.seed ?? seed) % 3) + 3)), 2.2, 0.42)
    else if (item.t === 'nvr') mat = glowing(cached(`nvr${item.seed ?? seed}`, () => tex.nvr(item.seed ?? seed)), 2, 0.45)
    else if (item.t === 'ups') mat = glowing(cached('ups', tex.ups), 1.6, 0.55)
    else mat = std({ map: cached(`bl${n}`, () => tex.blank(n)) as THREE.Texture, roughness: 0.55, metalness: 0.35 })
    const depth = item.t === 'mg' ? 0.08 : item.t === 'pp' || item.t === 'fo' ? 0.12 : item.t === 'bl' ? 0.012 : item.t === 'ups' ? 0.6 : 0.45
    const forward = item.t === 'mg' ? 0.055 : 0
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(depth, n * U - 0.002, 0.4826), [mat, MAT.coatEdge, MAT.coatEdge, MAT.coatEdge, MAT.coatEdge, MAT.coatEdge])
    mesh.position.set(-0.05 - depth / 2 + forward, yC, 0)
    mesh.castShadow = true; mesh.receiveShadow = true
    if (item.part) mesh.userData.part = item.part
    g.add(mesh)
    units.push({ part: item.part, mesh, y: yC, h: n * U, emissive: mat.emissiveMap ? mat : undefined })
    if (item.t === 'pp') pp.push(Array.from({ length: 24 }, (_, i) => new THREE.Vector3(-0.05, yC - 0.002, (0.5 - (patchX(i) + 13) / PW) * 0.4826)))
    if (item.t === 'sw') {
      const list: THREE.Vector3[] = []
      for (let c = 0; c < 24; c++) for (let r = 0; r < 2; r++) list.push(new THREE.Vector3(-0.05, yC + (r ? -0.0084 : 0.0067), (0.5 - (switchX(c) + 11) / PW) * 0.4826))
      sw.push(list)
    }
    u -= n
  }

  // Cordones de parcheo con su conector (bota) en cada extremo: una geometría por color y otra para las botas.
  if (cords) {
    const tubes: THREE.BufferGeometry[] = []
    const whites: THREE.BufferGeometry[] = []
    const boots: THREE.BufferGeometry[] = []
    pp.forEach((ports, pi) => {
      const target = sw[pi]
      if (!target) return
      const used = new Set<number>()
      ports.forEach((a, i) => {
        if (rnd() < 0.1) return
        let best = -1, bd = 1e9
        target.forEach((p, j) => { if (used.has(j)) return; const dd = Math.abs(p.z - a.z) + (j % 2 === pi % 2 ? 0 : 0.004); if (dd < bd) { bd = dd; best = j } })
        if (best < 0) return
        used.add(best)
        const b = target[best]
        const out = 0.03 + rnd() * 0.016
        const midY = (a.y + b.y) / 2 - 0.004
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(a.x + 0.022, a.y, a.z), new THREE.Vector3(a.x + out, a.y - 0.008, a.z),
          new THREE.Vector3(a.x + out + 0.012, midY, (a.z + b.z) / 2), new THREE.Vector3(b.x + out, b.y + 0.008, b.z), new THREE.Vector3(b.x + 0.022, b.y, b.z),
        ], false, 'centripetal')
        ;(i % 7 === 3 ? whites : tubes).push(new THREE.TubeGeometry(curve, 22, 0.0028, 6, false))
        for (const p of [a, b]) boots.push(new THREE.BoxGeometry(0.024, 0.0105, 0.0125).translate(p.x + 0.012, p.y, p.z))
      })
    })
    const add = (geos: THREE.BufferGeometry[], m: THREE.Material) => {
      if (!geos.length) return
      const mesh = new THREE.Mesh(mergeGeometries(geos), m)
      mesh.castShadow = true
      g.add(mesh)
      geos.forEach((x) => x.dispose())
    }
    add(tubes, cable(cordColor))
    add(whites, cable(0xe8ecef, 0.5))
    add(boots, MAT.boot)
  }

  // Puerta frontal perforada: el equipo se ve atenuado detrás, como en un site real.
  if (door) {
    const alpha = cached('door', tex.door) as THREE.Texture
    const doorTex = alpha.clone(); doorTex.repeat.set(10, 34); doorTex.needsUpdate = true
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.03, H - 0.12), std({ color: 0x15181c, roughness: 0.5, metalness: 0.45, alphaMap: doorTex, transparent: true, side: THREE.DoubleSide, depthWrite: false }))
    panel.rotation.y = Math.PI / 2; panel.position.set(0.012, H / 2, 0)
    g.add(panel)
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.025), MAT.galv)
    handle.position.set(0.03, H * 0.55, -W / 2 + 0.06)
    g.add(handle)
  }
  return { group: g, units }
}

/** Organizador vertical entre racks (de piso a techo del rack) con su haz de cables y cinchos. */
export function buildVerticalManager(x: number, { seed = 1, color = 0x1f6fd1, count = 34 } = {}) {
  const g = new THREE.Group()
  const H = 2.0, Dm = 0.62, Wm = 0.15
  const side = new THREE.BoxGeometry(0.012, H, Dm)
  for (const dx of [-Wm / 2, Wm / 2]) { const m = new THREE.Mesh(side, MAT.plastic); m.position.set(x + dx, H / 2, -Dm / 2 + 0.02); m.castShadow = true; m.receiveShadow = true; g.add(m) }
  // Dedos del organizador al frente (cada 1U)
  const fingers: THREE.BufferGeometry[] = []
  for (let k = 0; k < 42; k++) for (const dx of [-Wm / 2 + 0.018, Wm / 2 - 0.018]) fingers.push(new THREE.BoxGeometry(0.03, 0.02, 0.02).translate(x + dx, 0.13 + k * U, 0.01))
  const fm = new THREE.Mesh(mergeGeometries(fingers), MAT.plastic); fm.castShadow = true; g.add(fm); fingers.forEach((f) => f.dispose())
  // Haz de cables que baja por el organizador
  const rnd = mulberry(seed)
  const tubes: THREE.BufferGeometry[] = []
  for (let i = 0; i < count; i++) {
    const ox = x + (rnd() - 0.5) * 0.09
    const oz = -0.1 - rnd() * 0.12
    const pts: THREE.Vector3[] = []
    for (let k = 0; k <= 10; k++) pts.push(new THREE.Vector3(ox + (rnd() - 0.5) * 0.006, 0.1 + (k / 10) * (H + 0.32), oz + (rnd() - 0.5) * 0.006))
    tubes.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.0034, 5, false))
  }
  const tm = new THREE.Mesh(mergeGeometries(tubes), cable(color)); tm.castShadow = true; g.add(tm); tubes.forEach((t2) => t2.dispose())
  // Cinchos de velcro
  const straps: THREE.BufferGeometry[] = []
  for (let y = 0.35; y < H; y += 0.32) straps.push(new THREE.CylinderGeometry(0.058, 0.058, 0.025, 18, 1, true).translate(x, y, -0.16))
  const sm = new THREE.Mesh(mergeGeometries(straps), MAT.strap); g.add(sm); straps.forEach((s) => s.dispose())
  return g
}

/** Escalerilla portacables a lo largo de X, con haces de cable. */
export function buildLadder({ length = 5, width = 0.42, y = 2.34, z = -0.4, bundles = [] as { offset: number; color: number; count?: number }[] }) {
  const g = new THREE.Group()
  const parts: THREE.BufferGeometry[] = []
  for (const dz of [-width / 2, width / 2]) parts.push(new THREE.BoxGeometry(length, 0.065, 0.02).translate(0, y, z + dz))
  for (let x = -length / 2; x <= length / 2; x += 0.3) parts.push(new THREE.BoxGeometry(0.025, 0.014, width).translate(x, y - 0.022, z))
  const lm = new THREE.Mesh(mergeGeometries(parts), MAT.galv); lm.castShadow = true; lm.receiveShadow = true; g.add(lm); parts.forEach((p) => p.dispose())
  for (const { offset, color, count = 16 } of bundles) {
    const rnd = mulberry(Math.round(offset * 1000) + 7)
    const geos: THREE.BufferGeometry[] = []
    for (let i = 0; i < count; i++) {
      const oz = z + offset + (rnd() - 0.5) * 0.08
      const oy = y + 0.004 + rnd() * 0.036
      const pts: THREE.Vector3[] = []
      for (let k = 0; k <= 10; k++) pts.push(new THREE.Vector3(-length / 2 + (k / 10) * length, oy + (rnd() - 0.5) * 0.003, oz + (rnd() - 0.5) * 0.004))
      geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.0036, 5, false))
    }
    const bm = new THREE.Mesh(mergeGeometries(geos), cable(color)); bm.castShadow = true; g.add(bm); geos.forEach((x) => x.dispose())
  }
  return g
}

/** Bajadas: el cableado sale de la escalerilla y entra por arriba a cada organizador vertical. */
export function buildDrops(xs: number[], { yTop = 2.34, z = -0.4, color = 0x1f6fd1 } = {}) {
  const geos: THREE.BufferGeometry[] = []
  xs.forEach((x0, k) => {
    const rnd = mulberry(31 + k)
    for (let i = 0; i < 18; i++) {
      const ox = x0 + (rnd() - 0.5) * 0.08
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(ox + 0.25, yTop + 0.02, z + (rnd() - 0.5) * 0.06), new THREE.Vector3(ox + 0.06, yTop + 0.01, z + 0.05),
        new THREE.Vector3(ox, yTop - 0.12, -0.18 + (rnd() - 0.5) * 0.04), new THREE.Vector3(ox + (rnd() - 0.5) * 0.02, 2.05, -0.16 + (rnd() - 0.5) * 0.04),
      ])
      geos.push(new THREE.TubeGeometry(curve, 24, 0.0035, 5, false))
    }
  })
  const g = new THREE.Group()
  const m = new THREE.Mesh(mergeGeometries(geos), cable(color)); m.castShadow = true; g.add(m)
  geos.forEach((x) => x.dispose())
  return g
}

/** Canaleta de fibra (amarilla) a lo largo de X. */
export function buildDuct({ length = 5, y = 2.56, z = -0.12 }) {
  const parts = [
    new THREE.BoxGeometry(length, 0.006, 0.13).translate(0, y, z),
    new THREE.BoxGeometry(length, 0.1, 0.006).translate(0, y + 0.05, z - 0.065),
    new THREE.BoxGeometry(length, 0.1, 0.006).translate(0, y + 0.05, z + 0.065),
  ]
  const g = new THREE.Group()
  const m = new THREE.Mesh(mergeGeometries(parts), MAT.duct); m.castShadow = true; g.add(m)
  parts.forEach((p) => p.dispose())
  return g
}

/** Varillas roscadas que cuelgan la escalerilla y la canaleta del techo. */
export function buildRods(points: [number, number, number, number][]) {
  const geos = points.map(([x, z, y0, y1]) => new THREE.CylinderGeometry(0.006, 0.006, y1 - y0, 8).translate(x, (y0 + y1) / 2, z))
  const g = new THREE.Group()
  g.add(new THREE.Mesh(mergeGeometries(geos), MAT.rod))
  geos.forEach((x) => x.dispose())
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
  texCache.clear()
}
