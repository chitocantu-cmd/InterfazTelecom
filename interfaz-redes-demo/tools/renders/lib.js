import * as THREE from 'three'

export const U = 0.04445 // 1U en metros

// ---------- texturas procedurales ----------
function canvasTex(w, h, draw, { srgb = true, repeat } = {}) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const g = c.getContext('2d')
  draw(g, w, h)
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat) }
  return t
}

const noise = (g, w, h, a = 0.04) => {
  const d = g.getImageData(0, 0, w, h)
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * a
    d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n
  }
  g.putImageData(d, 0, 0)
}

// panel 19" de 1U: 1024x54 px aprox (ratio 0.4826 / 0.04445 = 10.86)
const PW = 1086, PH = 100

export function patchPanelTex(ports = 24, label = true) {
  const map = canvasTex(PW, PH, (g, w, h) => {
    g.fillStyle = '#121416'; g.fillRect(0, 0, w, h)
    // orejas
    g.fillStyle = '#1b1e21'; g.fillRect(0, 0, 40, h); g.fillRect(w - 40, 0, 40, h)
    g.fillStyle = '#050607'
    ;[[20, 30], [20, 70], [w - 20, 30], [w - 20, 70]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 7, 9, 0, 0, 7); g.fill() })
    const groups = ports / 6
    const pw = 26, gap = 8.5, ggap = 34
    const total = ports * pw + (ports - groups) * gap + (groups - 1) * ggap
    let x = (w - total) / 2
    for (let i = 0; i < ports; i++) {
      // etiqueta
      if (label) { g.fillStyle = '#e7ecef'; g.fillRect(x - 1, 14, pw + 2, 13); g.fillStyle = '#1b1e21'; g.font = '10px monospace'; g.textAlign = 'center'; g.fillText(String(i + 1).padStart(2, '0'), x + pw / 2, 25) }
      g.fillStyle = '#030303'; g.fillRect(x, 38, pw, 30)
      g.fillStyle = '#2a2d30'; g.fillRect(x + 4, 41, pw - 8, 6)
      g.fillStyle = '#b9a467'; for (let k = 0; k < 4; k++) g.fillRect(x + 6 + k * 4, 43, 2, 3)
      x += pw + gap
      if ((i + 1) % 6 === 0) x += ggap - gap
    }
    noise(g, w, h, 0.03)
  })
  return map
}

export function switchTex(ports = 48, sfp = 4, seed = 1) {
  const rnd = mulberry(seed)
  let ledsPos = []
  const map = canvasTex(PW, PH, (g, w, h) => {
    g.fillStyle = '#1f2327'; g.fillRect(0, 0, w, h)
    g.fillStyle = '#2a2f34'; g.fillRect(0, 0, 40, h); g.fillRect(w - 40, 0, 40, h)
    g.fillStyle = '#e9edf0'; g.font = 'bold 13px sans-serif'; g.fillText('48P PoE+', 60, 22)
    const cols = ports / 2, pw = 22, gap = 3
    let x0 = 150
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * (pw + gap) + Math.floor(c / 6) * 10
      for (let r = 0; r < 2; r++) {
        const y = 22 + r * 34
        g.fillStyle = '#060708'; g.fillRect(x, y, pw, 26)
        g.fillStyle = '#3a3f44'; g.fillRect(x + 3, y + (r ? 19 : 2), pw - 6, 5)
        ledsPos.push([x + pw / 2, r ? y + 30 : y - 3])
      }
    }
    for (let s = 0; s < sfp; s++) {
      const x = w - 60 - (sfp - s) * 40
      g.fillStyle = '#0a0b0c'; g.fillRect(x, 30, 32, 40)
      g.fillStyle = '#6d757c'; g.fillRect(x + 3, 33, 26, 34)
    }
    g.fillStyle = '#2e3338'; g.fillRect(60, 40, 70, 30)
    noise(g, w, h, 0.025)
  })
  const emissive = canvasTex(PW, PH, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h)
    ledsPos.forEach(([x, y]) => {
      const r = rnd()
      if (r < 0.62) { g.fillStyle = r < 0.08 ? '#ffb100' : '#38ff7a'; g.fillRect(x - 3, y - 1, 6, 3) }
    })
    g.fillStyle = '#38ff7a'; g.fillRect(64, 30, 6, 4); g.fillStyle = '#2aa8ff'; g.fillRect(76, 30, 6, 4)
  })
  return { map, emissive }
}

export function serverTex(units = 1, seed = 2) {
  const rnd = mulberry(seed)
  const h = PH * units
  let leds = []
  const map = canvasTex(PW, h, (g, w) => {
    g.fillStyle = '#16191c'; g.fillRect(0, 0, w, h)
    g.fillStyle = '#23282c'; g.fillRect(0, 0, 40, h); g.fillRect(w - 40, 0, 40, h)
    // bahías
    const bays = units === 1 ? 10 : 12
    const bw = (w - 260) / bays
    for (let i = 0; i < bays; i++) {
      const x = 130 + i * bw
      g.fillStyle = '#0b0d0f'; g.fillRect(x + 2, 8, bw - 4, h - 16)
      g.fillStyle = '#2c3237'; g.fillRect(x + 4, 10, bw - 8, (h - 20) * 0.35)
      for (let k = 0; k < (h - 30) / 7; k++) { g.fillStyle = '#07080a'; g.fillRect(x + 8, 14 + (h - 20) * 0.35 + k * 7, bw - 16, 3) }
      leds.push([x + bw - 12, 16])
    }
    g.fillStyle = '#c9d1d7'; g.fillRect(56, h / 2 - 12, 50, 4)
    noise(g, w, h, 0.03)
  })
  const emissive = canvasTex(PW, h, (g, w) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h)
    leds.forEach(([x, y]) => { if (rnd() < 0.8) { g.fillStyle = rnd() < 0.5 ? '#2aa8ff' : '#38ff7a'; g.fillRect(x, y, 5, 3) } })
    g.fillStyle = '#2aa8ff'; g.fillRect(60, h / 2 - 20, 8, 4)
  })
  return { map, emissive }
}

export function managerTex() {
  return canvasTex(PW, PH, (g, w, h) => {
    g.fillStyle = '#0d0f11'; g.fillRect(0, 0, w, h)
    for (let i = 0; i < 24; i++) {
      const x = 70 + i * ((w - 140) / 24)
      g.fillStyle = '#1d2125'; g.fillRect(x, 6, 26, h - 12)
      g.fillStyle = '#050607'; g.fillRect(x + 26, 6, 12, h - 30)
    }
    noise(g, w, h, 0.03)
  })
}

export function blankTex(units = 1) {
  return canvasTex(PW, PH * units, (g, w, h) => {
    g.fillStyle = '#141619'; g.fillRect(0, 0, w, h)
    g.fillStyle = '#1c1f23'; for (let y = 6; y < h; y += 10) g.fillRect(50, y, w - 100, 2)
    noise(g, w, h, 0.03)
  })
}

export function fiberPanelTex() {
  const map = canvasTex(PW, PH, (g, w, h) => {
    g.fillStyle = '#1a1d20'; g.fillRect(0, 0, w, h)
    for (let i = 0; i < 24; i++) {
      const x = 120 + i * 36
      g.fillStyle = '#0aa5b8'; g.fillRect(x, 34, 28, 30)
      g.fillStyle = '#04363d'; g.fillRect(x + 4, 40, 8, 18); g.fillRect(x + 16, 40, 8, 18)
    }
    g.fillStyle = '#e8edf0'; g.font = '12px monospace'; g.fillText('FO · OM4 · LC', 1000, 56)
    noise(g, w, h, 0.03)
  })
  return map
}

export function floorTex() {
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#c9ced2'; g.fillRect(0, 0, w, h)
    noise(g, w, h, 0.05)
    g.strokeStyle = '#8f979d'; g.lineWidth = 6; g.strokeRect(0, 0, w, h)
    g.strokeStyle = '#b3babf'; g.lineWidth = 2; g.strokeRect(8, 8, w - 16, h - 16)
  }, { repeat: [1, 1] })
}

export function perfTex() {
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#bcc3c8'; g.fillRect(0, 0, w, h)
    g.fillStyle = '#5c646a'
    for (let y = 40; y < h - 30; y += 22) for (let x = 40; x < w - 30; x += 22) { g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill() }
    g.strokeStyle = '#8f979d'; g.lineWidth = 6; g.strokeRect(0, 0, w, h)
  })
}

export function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------- materiales ----------
export const M = {
  rackPaint: new THREE.MeshStandardMaterial({ color: 0x15181b, roughness: 0.55, metalness: 0.35 }),
  rackRail: new THREE.MeshStandardMaterial({ color: 0x2a2e33, roughness: 0.45, metalness: 0.6 }),
  steel: new THREE.MeshStandardMaterial({ color: 0x9aa3a9, roughness: 0.38, metalness: 0.8 }),
  galv: new THREE.MeshStandardMaterial({ color: 0xb8bfc4, roughness: 0.45, metalness: 0.75 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xe4e8eb, roughness: 0.9 }),
  ceiling: new THREE.MeshStandardMaterial({ color: 0x2b3036, roughness: 0.9 }),
  ledPanel: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xeaf4ff, emissiveIntensity: 2.4 }),
}

export const cableMat = (color, rough = 0.5) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.0 })

// ---------- rack ----------
// El rack queda con su frente en +X local mirando hacia +X; ancho en Z (0.6), fondo en X (1.07), alto Y.
export function buildRack({ layout, seed = 1, door = false, cords = true, cordColors = [0x1f6fd1], fiberColor = 0x00a7b5 }) {
  const rnd = mulberry(seed)
  const g = new THREE.Group()
  const W = 0.6, D = 1.07, H = 2.0
  const t = 0.03
  // estructura: laterales, techo, base
  const side = new THREE.BoxGeometry(D, H, t)
  const s1 = new THREE.Mesh(side, M.rackPaint); s1.position.set(-D / 2, H / 2, W / 2 - t / 2)
  const s2 = s1.clone(); s2.position.z = -W / 2 + t / 2
  const top = new THREE.Mesh(new THREE.BoxGeometry(D, t, W), M.rackPaint); top.position.set(-D / 2, H - t / 2, 0)
  const base = new THREE.Mesh(new THREE.BoxGeometry(D, 0.1, W), M.rackPaint); base.position.set(-D / 2, 0.05, 0)
  const back = new THREE.Mesh(new THREE.BoxGeometry(t, H, W), M.rackPaint); back.position.set(-D + t / 2, H / 2, 0)
  // marco frontal
  const fr1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, H, 0.05), M.rackPaint); fr1.position.set(-0.01, H / 2, W / 2 - 0.025)
  const fr2 = fr1.clone(); fr2.position.z = -W / 2 + 0.025
  const frT = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.07, W), M.rackPaint); frT.position.set(-0.01, H - 0.035, 0)
  g.add(s1, s2, top, base, back, fr1, fr2, frT)
  for (const m of [s1, s2, top, base, back]) { m.castShadow = true; m.receiveShadow = true }
  // rieles
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.02, 42 * U, 0.03), M.rackRail)
  const r1 = rail.clone(); r1.position.set(-0.06, 0.12 + 21 * U, 0.2413 + 0.008)
  const r2 = rail.clone(); r2.position.set(-0.06, 0.12 + 21 * U, -0.2413 - 0.008)
  g.add(r1, r2)
  // interior oscuro
  const inner = new THREE.Mesh(new THREE.BoxGeometry(0.01, H - 0.15, W - 0.06), new THREE.MeshStandardMaterial({ color: 0x050607, roughness: 1 }))
  inner.position.set(-D + 0.05, H / 2, 0); g.add(inner)

  const cache = {}
  const ports = [] // posiciones de puertos para cordones
  let u = 42
  const y0 = 0.12
  const anchors = {}
  for (const item of layout) {
    const n = item.u
    const yTop = y0 + u * U
    const yC = yTop - (n * U) / 2
    let mat
    const key = item.t + n + (item.seed ?? '')
    if (item.t === 'pp') mat = cache[key] ??= new THREE.MeshStandardMaterial({ map: patchPanelTex(24), roughness: 0.6, metalness: 0.3 })
    else if (item.t === 'fo') mat = cache[key] ??= new THREE.MeshStandardMaterial({ map: fiberPanelTex(), roughness: 0.5, metalness: 0.3 })
    else if (item.t === 'sw') { const tx = switchTex(48, 4, item.seed ?? seed); mat = new THREE.MeshStandardMaterial({ map: tx.map, emissiveMap: tx.emissive, emissive: 0xffffff, emissiveIntensity: 1.6, roughness: 0.45, metalness: 0.4 }) }
    else if (item.t === 'sv') { const tx = serverTex(n, (item.seed ?? seed) + u); mat = new THREE.MeshStandardMaterial({ map: tx.map, emissiveMap: tx.emissive, emissive: 0xffffff, emissiveIntensity: 1.6, roughness: 0.5, metalness: 0.45 }) }
    else if (item.t === 'mg') mat = cache[key] ??= new THREE.MeshStandardMaterial({ map: managerTex(), roughness: 0.7 })
    else if (item.t === 'ups') { mat = cache[key] ??= new THREE.MeshStandardMaterial({ map: blankTex(n), roughness: 0.6, metalness: 0.2 }) }
    else mat = cache[key] ??= new THREE.MeshStandardMaterial({ map: blankTex(n), roughness: 0.6, metalness: 0.3 })
    const depth = item.t === 'mg' ? 0.08 : item.t === 'pp' || item.t === 'fo' ? 0.12 : item.t === 'bl' ? 0.01 : 0.45
    const forward = item.t === 'mg' ? 0.055 : 0.0
    const faceMats = [mat, M.rackRail, M.rackRail, M.rackRail, M.rackRail, M.rackRail]
    const box = new THREE.Mesh(new THREE.BoxGeometry(depth, n * U - 0.002, 0.4826), faceMats)
    box.position.set(-0.05 - depth / 2 + forward, yC, 0)
    box.castShadow = true; box.receiveShadow = true
    g.add(box)
    if (item.t === 'pp' || item.t === 'sw') {
      // posiciones de puertos (Z) en espacio local
      const list = []
      if (item.t === 'pp') {
        for (let i = 0; i < 24; i++) {
          const px = textureX(i, 24)
          list.push(new THREE.Vector3(-0.05, yC - 0.004, px))
        }
      } else {
        for (let c = 0; c < 24; c++) for (let r = 0; r < 2; r++) {
          const px = (150 + c * 25 + Math.floor(c / 6) * 10 + 11) / PW
          list.push(new THREE.Vector3(-0.05, yC + (r ? -0.0084 : 0.0067), (0.5 - px) * 0.4826))
        }
      }
      ports.push({ type: item.t, list, y: yC })
    }
    if (item.anchor) anchors[item.anchor] = new THREE.Vector3(0, yC, 0)
    u -= n
  }

  if (cords) {
    const pps = ports.filter((p) => p.type === 'pp')
    const sws = ports.filter((p) => p.type === 'sw')
    const geoms = {}
    pps.forEach((pp, pi) => {
      const sw = sws[pi % Math.max(sws.length, 1)]
      if (!sw) return
      const color = cordColors[pi % cordColors.length]
      const mat = cableMat(color, color === 0xe9eef2 ? 0.7 : 0.5)
      const used = new Set()
      pp.list.forEach((a, i) => {
        if (rnd() < 0.12) return
        // puerto del switch más cercano en Z (fila superior o inferior alternada)
        let best = null, bd = 1e9
        sw.list.forEach((p, j) => { if (used.has(j)) return; const dd = Math.abs(p.z - a.z) + (j % 2 === (pi % 2) ? 0 : 0.004); if (dd < bd) { bd = dd; best = j } })
        if (best === null) return
        used.add(best)
        const b = sw.list[best]
        const out = 0.028 + rnd() * 0.014
        const mgY = (a.y + b.y) / 2
        const pts = [
          new THREE.Vector3(a.x + 0.01, a.y, a.z),
          new THREE.Vector3(a.x + out, a.y - 0.006, a.z),
          new THREE.Vector3(a.x + out + 0.01, mgY, (a.z + b.z) / 2),
          new THREE.Vector3(b.x + out, b.y + 0.006, b.z),
          new THREE.Vector3(b.x + 0.01, b.y, b.z),
        ]
        const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
        const geo = new THREE.TubeGeometry(curve, 28, 0.0029, 6, false)
        const m = new THREE.Mesh(geo, mat)
        m.castShadow = true
        g.add(m)
      })
    })
  }

  if (door) {
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.01, H - 0.1, W - 0.04), new THREE.MeshPhysicalMaterial({ color: 0x0d1216, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.55 }))
    glass.position.set(0.03, H / 2, 0); g.add(glass)
  }
  g.userData.anchors = anchors
  return g
}

function textureX(i, ports) {
  const groups = ports / 6
  const pw = 26, gap = 8.5, ggap = 34
  const total = ports * pw + (ports - groups) * gap + (groups - 1) * ggap
  let x = (PW - total) / 2
  for (let k = 0; k < i; k++) { x += pw + gap; if ((k + 1) % 6 === 0) x += ggap - gap }
  const px = (x + pw / 2) / PW
  return (0.5 - px) * 0.4826
}

export const NETWORK_LAYOUT = [
  { t: 'bl', u: 1 }, { t: 'fo', u: 1, anchor: 'fiber' }, { t: 'mg', u: 1 },
  { t: 'pp', u: 1, anchor: 'patch' }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 3, anchor: 'switch' },
  { t: 'pp', u: 1 }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 4 },
  { t: 'pp', u: 1 }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 5 },
  { t: 'pp', u: 1 }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 6 },
  { t: 'bl', u: 2 }, { t: 'sv', u: 1, seed: 7 }, { t: 'bl', u: 1 },
  { t: 'sv', u: 2, seed: 8, anchor: 'nvr' }, { t: 'sv', u: 2, seed: 9 }, { t: 'bl', u: 2 },
  { t: 'sv', u: 2, seed: 10 }, { t: 'bl', u: 3 }, { t: 'sv', u: 1, seed: 12 }, { t: 'bl', u: 3 },
  { t: 'ups', u: 3, anchor: 'ups' }, { t: 'ups', u: 3 },
]

export const SERVER_LAYOUT = [
  { t: 'bl', u: 1 }, { t: 'pp', u: 1 }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 21 }, { t: 'bl', u: 1 },
  { t: 'sv', u: 2, seed: 22 }, { t: 'sv', u: 2, seed: 23 }, { t: 'sv', u: 1, seed: 24 }, { t: 'sv', u: 1, seed: 25 },
  { t: 'sv', u: 2, seed: 26 }, { t: 'bl', u: 2 }, { t: 'sv', u: 2, seed: 27 }, { t: 'sv', u: 2, seed: 28 },
  { t: 'sv', u: 1, seed: 29 }, { t: 'sv', u: 1, seed: 30 }, { t: 'sv', u: 2, seed: 31 }, { t: 'bl', u: 3 },
  { t: 'sv', u: 2, seed: 32 }, { t: 'sv', u: 2, seed: 33 }, { t: 'bl', u: 4 }, { t: 'ups', u: 3 }, { t: 'ups', u: 3 },
]

// Escalerilla portacables a lo largo de Z
export function buildLadder({ length = 6, width = 0.4, y = 2.4, x = 0, z0 = 0, bundles = [] }) {
  const g = new THREE.Group()
  const railGeo = new THREE.BoxGeometry(0.02, 0.06, length)
  const r1 = new THREE.Mesh(railGeo, M.galv); r1.position.set(x - width / 2, y, z0 - length / 2)
  const r2 = r1.clone(); r2.position.x = x + width / 2
  g.add(r1, r2)
  for (let z = 0; z < length; z += 0.3) {
    const rung = new THREE.Mesh(new THREE.BoxGeometry(width, 0.015, 0.025), M.galv)
    rung.position.set(x, y - 0.02, z0 - z); g.add(rung)
  }
  // haces de cable
  bundles.forEach(({ offset, color, count = 18, r = 0.0035, spread = 0.08 }) => {
    const mat = cableMat(color, 0.55)
    const rnd = mulberry(Math.round(offset * 1000) + 7)
    const geos = []
    for (let i = 0; i < count; i++) {
      const ox = x + offset + (rnd() - 0.5) * spread
      const oy = y + 0.004 + rnd() * 0.035
      const pts = []
      for (let k = 0; k <= 8; k++) pts.push(new THREE.Vector3(ox + (rnd() - 0.5) * 0.004, oy + (rnd() - 0.5) * 0.003, z0 - (k / 8) * length))
      geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, r, 5, false))
    }
    geos.forEach((geo) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; g.add(m) })
  })
  return g
}

// Canaleta de fibra amarilla
export function buildFiberDuct({ length = 6, y = 2.25, x = 0, z0 = 0 }) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xd9a714, roughness: 0.55 })
  const g = new THREE.Group()
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.006, length), mat); bottom.position.set(x, y, z0 - length / 2)
  const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.1, length), mat); s1.position.set(x - 0.06, y + 0.05, z0 - length / 2)
  const s2 = s1.clone(); s2.position.x = x + 0.06
  g.add(bottom, s1, s2)
  ;[bottom, s1, s2].forEach((m) => (m.castShadow = true))
  return g
}

export function project(v, camera, w, h) {
  const p = v.clone().project(camera)
  return { x: ((p.x + 1) / 2) * w, y: ((1 - p.y) / 2) * h, xp: (p.x + 1) / 2, yp: (1 - p.y) / 2 }
}
