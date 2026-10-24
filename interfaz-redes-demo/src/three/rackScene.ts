/**
 * Escena 3D «Explora una instalación»: un rack de telecomunicaciones entre otros dos, escalerilla con cableado,
 * canaleta de fibra y piso técnico. Se descarga aparte (three.js) y sólo en el nivel «full» con WebGL.
 *
 * Rendimiento: se arma por pasos que ceden el hilo principal; materiales Phong (compilan rápido también en
 * Windows/Direct3D) y sin mapa de entorno PMREM (bloqueaba más de medio segundo); se dibuja bajo demanda (sólo mientras la cámara se mueve, se arrastra o parpadea un LED, y nunca
 * fuera de pantalla o con la pestaña oculta); DPR limitado a 1.75; texturas procedurales pequeñas; cordones unidos
 * en una geometría por rack. Control: arrastrar gira la cámara dentro de un rango (la rueda del mouse sigue
 * desplazando la página); seleccionar un componente acerca la cámara y lo resalta.
 */
import * as THREE from 'three'
import { buildDrops, buildDuct, buildLadder, buildRack, disposeDeep, tex, U, type LayoutItem } from './rackKit'

export const PARTS = ['tray', 'fiber', 'patch', 'organizer', 'switch', 'nvr', 'ups'] as const
export type Part = (typeof PARTS)[number]

/** Completa con tapas hasta 42U, antes de las UPS (sin huecos abiertos que dejen ver el interior). */
const fill42 = (items: LayoutItem[]): LayoutItem[] => {
  const used = items.reduce((s, i) => s + i.u, 0)
  return used < 42 ? [...items.slice(0, -2), { t: 'bl', u: 42 - used }, ...items.slice(-2)] : items
}
const MAIN = fill42([
  { t: 'bl', u: 1 }, { t: 'fo', u: 1, part: 'fiber' }, { t: 'fo', u: 1 }, { t: 'mg', u: 1 },
  { t: 'pp', u: 1, part: 'patch' }, { t: 'mg', u: 1, part: 'organizer' }, { t: 'sw', u: 1, seed: 3, part: 'switch' },
  { t: 'pp', u: 1 }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 4 },
  { t: 'pp', u: 1 }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 5 },
  { t: 'pp', u: 1 }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 6 },
  { t: 'bl', u: 1 }, { t: 'nvr', u: 2, seed: 8, part: 'nvr' }, { t: 'nvr', u: 2, seed: 9 }, { t: 'bl', u: 1 },
  { t: 'pp', u: 1 }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 7 },
  { t: 'ups', u: 3, part: 'ups' }, { t: 'ups', u: 3 },
])
const SIDE = fill42([
  { t: 'bl', u: 1 }, { t: 'fo', u: 1 }, { t: 'mg', u: 1 }, { t: 'pp', u: 1 }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 21 },
  { t: 'pp', u: 1 }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 22 }, { t: 'pp', u: 1 }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 23 },
  { t: 'bl', u: 2 }, { t: 'pp', u: 1 }, { t: 'mg', u: 1 }, { t: 'sw', u: 1, seed: 24 },
  { t: 'ups', u: 3 }, { t: 'ups', u: 3 },
])

export interface RackSceneOptions {
  onSelect: (part: Part) => void
  onReady: () => void
  reduced?: boolean
}

export interface RackScene {
  focus: (part: Part | null) => void
  dispose: () => void
}

interface View { target: THREE.Vector3; theta: number; phi: number; radius: number }
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

/** Cede el hilo principal entre pasos del armado: el navegador puede pintar y responder a la persona. */
const breathe = () => new Promise<void>((resolve) => setTimeout(resolve, 0))
const mark = (step: string) => performance.mark(`rack:${step}`)

/**
 * Arma la escena por pasos (renderer y luces → cada rack → escalerilla → entorno → shaders) cediendo el hilo principal
 * entre uno y otro: ninguna tarea larga bloquea el desplazamiento ni los clics. Si `signal` se cancela a medio camino
 * (la persona salió de la página), libera lo creado y devuelve null.
 */
export async function createRackScene(host: HTMLElement, overlay: HTMLElement, opts: RackSceneOptions, signal?: AbortSignal): Promise<RackScene | null> {
  mark('inicio')
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  // Sin revisar el registro de cada shader al usarlo por primera vez: en Windows esa consulta obliga a terminar la
  // compilación de golpe (~0.4 s de bloqueo). Los shaders son los de three.js; en desarrollo se siguen revisando.
  renderer.debug.checkShaderErrors = import.meta.env.DEV
  renderer.domElement.className = 'block h-full w-full'
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x050d18, 5.5, 12)
  const abandon = () => { disposeDeep(scene); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); return null }

  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 40)

  // Luz de producto: principal desde el frente derecho, un cono desde el plafón que ilumina el pasillo, y un
  // contraluz azul (el color de Interfaz) casi horizontal que dibuja los costados sin teñir los techos.
  const key = new THREE.DirectionalLight(0xf3f7ff, 2.3); key.position.set(2.5, 3.2, 4.5); scene.add(key)
  const rim = new THREE.DirectionalLight(0x26a5dc, 1.8); rim.position.set(-4.5, 1.1, -2.5); scene.add(rim)
  const fill = new THREE.HemisphereLight(0x7f9fc3, 0x0a1626, 0.75); scene.add(fill)
  const pool = new THREE.SpotLight(0xe4f1ff, 22, 9, 0.6, 0.65, 1.4); pool.position.set(0.4, 4.4, 2.4); pool.target.position.set(0, 0, 0.3); scene.add(pool, pool.target)

  // Piso técnico oscuro con retícula y sombra de contacto bajo los racks.
  const floorTex = tex.floor()
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshPhongMaterial({ map: floorTex, shininess: 12, specular: 0x10202c }))
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.9), new THREE.MeshBasicMaterial({ map: tex.contact(), transparent: true, depthWrite: false }))
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, 0.002, -0.45)
  scene.add(shadow)

  // Tres racks en línea; el del centro es el que se explora. Frente hacia +Z (rotación de -90° en Y).
  await breathe(); if (signal?.aborted) return abandon()
  const row = new THREE.Group()
  scene.add(row)
  mark('base')
  const main = buildRack(MAIN, { seed: 2, cordColor: 0x1f6fd1 })
  mark('rack-principal')
  await breathe(); if (signal?.aborted) return abandon()
  const left = buildRack(SIDE, { seed: 5, cordColor: 0x1f6fd1 })
  await breathe(); if (signal?.aborted) return abandon()
  const right = buildRack(SIDE, { seed: 9, cordColor: 0xe9eef2 })
  mark('racks-laterales')
  for (const [r, x] of [[left.group, -0.62], [main.group, 0], [right.group, 0.62]] as const) { r.rotation.y = -Math.PI / 2; r.position.x = x; row.add(r) }
  await breathe(); if (signal?.aborted) return abandon()

  // Escalerilla con cableado azul y canaleta de fibra, a lo largo de la fila; bajada de cable al rack principal.
  const ladder = buildLadder({ length: 5, y: 2.34, z0: 2.5, bundles: [{ offset: -0.1, color: 0x1f6fd1, count: 18 }, { offset: 0.08, color: 0x2d7fe0, count: 14 }] })
  ladder.rotation.y = Math.PI / 2; ladder.position.z = -0.45
  ladder.userData.part = 'tray'
  ladder.traverse((o) => { o.userData.part = 'tray' })
  scene.add(ladder)
  const duct = buildDuct({ length: 5, y: 2.52, z0: 2.5 })
  duct.rotation.y = Math.PI / 2; duct.position.z = -0.2
  duct.traverse((o) => { o.userData.part = 'tray' })
  scene.add(duct)
  // Bajadas de cable de la escalerilla al techo de cada rack (por la parte trasera).
  const drops = buildDrops([-0.62, 0, 0.62])
  drops.traverse((o) => { o.userData.part = 'tray' })
  scene.add(drops)

  mark('escalerilla')

  // Anclas de cada parte (centro del frente) y su caja de resaltado.
  const anchors = new Map<Part, { pos: THREE.Vector3; size: THREE.Vector3 }>()
  scene.updateMatrixWorld(true)
  for (const unit of main.units) {
    if (!unit.part) continue
    const p = new THREE.Vector3(0, unit.y, 0)
    main.group.localToWorld(p)
    p.z = 0.02
    anchors.set(unit.part as Part, { pos: p, size: new THREE.Vector3(0.5, unit.h + 0.012, 0.05) })
  }
  anchors.set('tray', { pos: new THREE.Vector3(0, 2.5, -0.35), size: new THREE.Vector3(1.6, 0.32, 0.6) })
  const highlight = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), new THREE.LineBasicMaterial({ color: 0x4cc3f0, transparent: true, opacity: 0.95 }))
  highlight.visible = false
  scene.add(highlight)

  // Marcas numeradas sobre cada parte (decorativas: la lista de la sección es el control accesible).
  const markers = new Map<Part, HTMLButtonElement>()
  PARTS.forEach((part, i) => {
    const b = document.createElement('button')
    b.type = 'button'; b.tabIndex = -1; b.setAttribute('aria-hidden', 'true')
    b.className = 'rack-marker'; b.textContent = String(i + 1); b.dataset.part = part
    b.addEventListener('click', () => { opts.onSelect(part); focus(part) })
    overlay.appendChild(b)
    markers.set(part, b)
  })

  // Cámara: órbita limitada alrededor del objetivo.
  const DEFAULT: View = { target: new THREE.Vector3(0.05, 1.34, -0.25), theta: 0.52, phi: 1.47, radius: 4.7 }
  const view: View = { target: DEFAULT.target.clone(), theta: DEFAULT.theta, phi: DEFAULT.phi, radius: DEFAULT.radius }
  const LIMITS = { theta: [-0.75, 0.9], phi: [1.12, 1.66] } as const
  const applyCamera = () => {
    const s = new THREE.Spherical(view.radius, view.phi, view.theta)
    camera.position.setFromSpherical(s).add(view.target)
    camera.lookAt(view.target)
  }

  let tween: { from: View; to: View; t0: number; dur: number } | null = null
  const viewFor = (part: Part | null): View => {
    if (!part) return { ...DEFAULT, target: DEFAULT.target.clone() }
    const a = anchors.get(part)!
    if (part === 'tray') return { target: new THREE.Vector3(0, 2.2, -0.4), theta: 0.55, phi: 1.62, radius: 2.9 }
    const near = part === 'ups' ? 2.2 : 1.65
    return { target: a.pos.clone().setZ(0), theta: 0.4, phi: part === 'ups' ? 1.36 : 1.45, radius: near }
  }

  // Dibujo bajo demanda.
  let visible = true
  let raf = 0
  let dragging = false
  let selected: Part | null = null
  let blinkUntil = 0
  const loop = (now: number) => {
    raf = 0
    let more = false
    if (tween) {
      const k = Math.min(1, (now - tween.t0) / tween.dur)
      const e = easeInOut(k)
      view.target.lerpVectors(tween.from.target, tween.to.target, e)
      view.theta = tween.from.theta + (tween.to.theta - tween.from.theta) * e
      view.phi = tween.from.phi + (tween.to.phi - tween.from.phi) * e
      view.radius = tween.from.radius + (tween.to.radius - tween.from.radius) * e
      if (k < 1) more = true; else tween = null
    }
    if (selected) {
      const pulse = 0.65 + 0.35 * Math.sin(now / 260)
      ;(highlight.material as THREE.LineBasicMaterial).opacity = pulse
      more = more || now < blinkUntil
    }
    applyCamera()
    renderer.render(scene, camera)
    placeMarkers()
    if ((more || dragging) && visible) raf = requestAnimationFrame(loop)
  }
  // Nada se dibuja hasta terminar el armado: un cuadro adelantado (lo pedían los observadores de tamaño y visibilidad)
  // compilaba todos los shaders de golpe, antes de la compilación en paralelo.
  let ready = false
  const request = () => { if (ready && !raf && visible) raf = requestAnimationFrame(loop) }

  const placeMarkers = () => {
    const w = host.clientWidth, h = host.clientHeight
    const v = new THREE.Vector3()
    const placed: { part: Part; el: HTMLButtonElement; x: number; y: number; inside: boolean }[] = []
    for (const [part, el] of markers) {
      v.copy(anchors.get(part)!.pos)
      if (part !== 'tray') v.x = 0.31 // al borde derecho del rack, sin tapar el equipo
      v.project(camera)
      const x = ((v.x + 1) / 2) * w, y = ((1 - v.y) / 2) * h
      placed.push({ part, el, x, y, inside: v.z < 1 && x > 8 && x < w - 8 && y > 8 && y < h - 8 })
    }
    // Componentes contiguos (1U cada uno) quedan a pocos píxeles: se muestra una sola marca, la elegida si es una.
    const shown: { x: number; y: number }[] = []
    for (const m of [...placed].sort((a, b) => Number(b.part === selected) - Number(a.part === selected))) {
      const crowded = shown.some((s) => Math.hypot(s.x - m.x, s.y - m.y) < 28)
      const visible = m.inside && !crowded
      if (visible) shown.push(m)
      m.el.style.transform = `translate(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px)`
      m.el.style.opacity = visible ? '1' : '0'
      m.el.style.pointerEvents = visible ? 'auto' : 'none'
      m.el.classList.toggle('is-active', m.part === selected)
    }
  }

  function focus(part: Part | null) {
    selected = part
    if (part) {
      const a = anchors.get(part)!
      highlight.position.copy(a.pos)
      highlight.scale.copy(a.size)
      highlight.visible = true
      blinkUntil = performance.now() + 2600
    } else highlight.visible = false
    const to = viewFor(part)
    if (opts.reduced) { Object.assign(view, { ...to, target: to.target }); tween = null }
    else tween = { from: { ...view, target: view.target.clone() }, to, t0: performance.now(), dur: 1100 }
    request()
  }

  // Arrastre (mouse o lápiz); la rueda del mouse no se captura: la página sigue desplazándose.
  let last: { x: number; y: number } | null = null
  let moved = 0
  const canvas = renderer.domElement
  canvas.style.touchAction = 'pan-y'
  const down = (e: PointerEvent) => { last = { x: e.clientX, y: e.clientY }; moved = 0; dragging = true; tween = null; canvas.setPointerCapture(e.pointerId); host.classList.add('is-dragging'); request() }
  const move = (e: PointerEvent) => {
    if (!last) return
    const dx = e.clientX - last.x, dy = e.clientY - last.y
    moved += Math.abs(dx) + Math.abs(dy)
    last = { x: e.clientX, y: e.clientY }
    view.theta = THREE.MathUtils.clamp(view.theta - dx * 0.0055, LIMITS.theta[0], LIMITS.theta[1])
    view.phi = THREE.MathUtils.clamp(view.phi - dy * 0.004, LIMITS.phi[0], LIMITS.phi[1])
  }
  const raycaster = new THREE.Raycaster()
  const up = (e: PointerEvent) => {
    if (!last) return
    last = null; dragging = false; host.classList.remove('is-dragging')
    if (moved < 6) {
      // Clic sin arrastre: ¿qué parte se tocó?
      const r = canvas.getBoundingClientRect()
      raycaster.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera)
      const hit = raycaster.intersectObjects([main.group, ladder, duct], true).find((h) => h.object.userData.part)
      if (hit) { const part = hit.object.userData.part as Part; opts.onSelect(part); focus(part) }
    }
    request()
  }
  canvas.addEventListener('pointerdown', down)
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerup', up)
  canvas.addEventListener('pointercancel', up)

  // Tamaño, visibilidad y pestaña oculta.
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    request()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; if (visible) request() })
  io.observe(host)
  const onVis = () => { visible = !document.hidden; if (visible) request() }
  document.addEventListener('visibilitychange', onVis)

  // Indicadores: un LED cambia de vez en cuando (un solo cuadro, no una animación continua).
  const leds = main.units.filter((u) => u.emissive).map((u) => u.emissive!)
  const blink = window.setInterval(() => {
    if (!visible || opts.reduced || leds.length === 0) return
    const m = leds[Math.floor(Math.random() * leds.length)]
    m.emissiveIntensity = m.emissiveIntensity > 1.3 ? 0.9 : 1.5
    request()
  }, 900)

  /**
   * En Windows (ANGLE sobre Direct3D) cada shader se termina de crear la primera vez que dibuja algo: con toda la
   * escena a la vez eran ~0.5 s de bloqueo. Se dibuja un objeto de cada tipo de material por turno, cediendo el hilo
   * entre uno y otro, así ninguna tarea es larga. En otros sistemas cuesta casi nada.
   */
  async function warmUp() {
    const drawables: THREE.Object3D[] = []
    scene.traverse((o) => { if ((o as THREE.Mesh).isMesh || (o as THREE.LineSegments).isLineSegments) drawables.push(o) })
    const kinds = new Map<string, THREE.Object3D>()
    for (const o of drawables) {
      const m = (o as THREE.Mesh).material
      for (const mt of Array.isArray(m) ? m : [m]) {
        const k = `${mt.type}:${'map' in mt && mt.map ? 'm' : ''}${'emissiveMap' in mt && mt.emissiveMap ? 'e' : ''}${mt.transparent ? 't' : ''}`
        if (!kinds.has(k)) kinds.set(k, o)
      }
    }
    // Texturas: se suben a la GPU de a pocas (subir las ~30 de golpe en el primer cuadro bloqueaba ~0.4 s).
    const textures = new Set<THREE.Texture>()
    for (const o of drawables) {
      const m = (o as THREE.Mesh).material
      for (const mt of Array.isArray(m) ? m : [m]) for (const v of Object.values(mt)) if (v instanceof THREE.Texture) textures.add(v)
    }
    let n = 0
    for (const tx of textures) {
      if (signal?.aborted) return
      renderer.initTexture(tx)
      if (++n % 3 === 0) await breathe()
    }
    const before = drawables.map((o) => [o.visible, o.frustumCulled] as const)
    for (const rep of new Set(kinds.values())) {
      if (signal?.aborted) break
      drawables.forEach((o) => { o.visible = o === rep; o.frustumCulled = o !== rep })
      renderer.render(scene, camera)
      await breathe()
    }
    drawables.forEach((o, i) => { o.visible = before[i][0]; o.frustumCulled = before[i][1] })
  }

  /**
   * Espera, sin bloquear, a que la GPU termine lo encolado por el primer cuadro (en Windows ahí se crean los shaders
   * de Direct3D). Sin esto, la siguiente consulta de WebGL del primer clic esperaba ~0.4 s con la página congelada.
   */
  async function settleGpu() {
    const gl = renderer.getContext()
    if (!(gl instanceof WebGL2RenderingContext)) return
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
    if (!sync) return
    gl.flush()
    const t0 = performance.now()
    while (gl.getSyncParameter(sync, gl.SYNC_STATUS) !== gl.SIGNALED && performance.now() - t0 < 4000 && !signal?.aborted) {
      await new Promise((resolve) => setTimeout(resolve, 32))
    }
    gl.deleteSync(sync)
  }

  const api: RackScene = {
    focus,
    dispose() {
      cancelAnimationFrame(raf)
      window.clearInterval(blink)
      ro.disconnect(); io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      markers.forEach((m) => m.remove())
      disposeDeep(scene)
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }

  resize()
  applyCamera()
  // Los shaders se compilan en paralelo cuando el navegador lo permite; el primer cuadro ya no se traba.
  await breathe()
  // El contorno de resaltado se compila con todo lo demás (si no, su shader se compilaría al primer clic).
  highlight.visible = true
  if (!signal?.aborted) await renderer.compileAsync(scene, camera).catch(() => {})
  highlight.visible = false
  mark('shaders')
  if (signal?.aborted) { api.dispose(); return null }
  await warmUp()
  mark('calentamiento')
  if (signal?.aborted) { api.dispose(); return null }
  renderer.render(scene, camera)
  mark('primer-cuadro')
  await settleGpu()
  mark('gpu-lista')
  if (signal?.aborted) { api.dispose(); return null }
  ready = true
  placeMarkers()
  opts.onReady()
  return api
}

export { U }
