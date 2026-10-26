/**
 * Escena 3D «Un site de telecomunicaciones, pieza por pieza»: una fila de cinco racks rotulados con organizadores
 * verticales, escalerilla, canaleta, bajadas de cable y tierra física, en un cuarto con piso técnico, muro, plafón y
 * luminarias. Se descarga aparte (three.js) y sólo en el nivel «full» con WebGL.
 *
 * Imagen: materiales físicos (PBR) con relieve en cada frente, un entorno de reflejos hecho a la medida del cuarto
 * (las luminarias lineales se reflejan en metal y frentes), sombras estáticas (se calculan una vez), contraluz, niebla
 * que funde el fondo, brillo sutil (bloom) sólo en LED y luminarias, profundidad de campo con la profundidad real de
 * la escena y un acabado fotográfico (viñeta óptica y grano fino).
 * Inspección: al entrar en pantalla, la cámara llega desde un plano abierto; al elegir un componente se acerca, el
 * foco se va a la pieza (lo demás se desenfoca) y aparecen un marco con su nombre y una viñeta. Al pasar el mouse
 * sobre una pieza se marca con un marco tenue. «Restablecer vista» vuelve a la vista general. En reposo la cámara
 * respira apenas.
 *
 * Rendimiento (medido con la GPU de un equipo de oficina, Intel UHD / Direct3D 11): el armado se hace por pasos que
 * ceden el hilo principal; nada se dibuja hasta terminar; los shaders se compilan en paralelo (también los del
 * postproceso) y se calientan por material; se espera a la GPU con un fence de WebGL2; DPR ≤ 1.5; sombras estáticas;
 * dibujo sólo en pantalla y con la pestaña visible (30 cuadros por segundo en reposo, 60 al moverse).
 */
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { DofPass, FinishPass } from './lensPasses'
import { buildDrops, buildDuct, buildGround, buildLadder, buildNameplate, buildRack, buildRods, buildVerticalManager, disposeDeep, MAT, prepareRackTextures, tex, U, type LayoutItem } from './rackKit'

export const PARTS = ['tray', 'fiber', 'patch', 'organizer', 'switch', 'nvr', 'ups'] as const
export type Part = (typeof PARTS)[number]

/** Completa con tapas hasta 42U, antes de las UPS (sin huecos abiertos). */
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
  /** Nombre de cada componente (para la etiqueta del marco de enfoque). */
  labels: Record<Part, string>
  reduced?: boolean
}

export interface RackScene {
  focus: (part: Part | null) => void
  dispose: () => void
}

interface View { target: THREE.Vector3; theta: number; phi: number; radius: number }
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const breathe = () => new Promise<void>((resolve) => setTimeout(resolve, 0))
const mark = (step: string) => performance.mark(`rack:${step}`)

/**
 * Espera, sin bloquear, a que la GPU termine lo encolado. En Windows (ANGLE/Direct3D) el proceso de la GPU sigue
 * creando los shaders aunque la compilación en paralelo ya se dio por terminada; la primera consulta síncrona que
 * llegue mientras tanto (los uniformes de un programa nuevo) congela la página hasta que acabe. Con esta espera entre
 * compilar y usar, esa consulta ya no encuentra nada pendiente.
 */
async function waitForGpu(renderer: THREE.WebGLRenderer, signal?: AbortSignal) {
  const gl = renderer.getContext()
  if (!(gl instanceof WebGL2RenderingContext)) return
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
  if (!sync) return
  gl.flush()
  const t0 = performance.now()
  while (gl.getSyncParameter(sync, gl.SYNC_STATUS) !== gl.SIGNALED && performance.now() - t0 < 4000 && !signal?.aborted) {
    await new Promise((resolve) => setTimeout(resolve, 16))
  }
  gl.deleteSync(sync)
}

/**
 * Entorno de reflejos a la medida del cuarto: muros y plafón oscuros, piso gris, las dos luminarias lineales (muy
 * brillantes, como las reales) y un panel azul tenue donde está el contraluz. Así los reflejos en metal, pantallas y
 * frentes coinciden con la luz de la escena.
 */
function buildEnvScene() {
  const env = new THREE.Scene()
  const basic = (hex: number, k = 1, side: THREE.Side = THREE.FrontSide) => {
    const m = new THREE.MeshBasicMaterial({ side })
    m.color.setHex(hex).multiplyScalar(k)
    return m
  }
  const room = new THREE.Mesh(new THREE.BoxGeometry(12, 3, 8), basic(0x26303b, 1, THREE.BackSide))
  room.position.set(0, 1.5, -0.4)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), basic(0x3a4249))
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.002, -0.4)
  env.add(room, floor)
  for (const z of [0.75, -1.25]) {
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.16), basic(0xeaf3ff, 16))
    lamp.rotation.x = Math.PI / 2; lamp.position.set(0, 2.97, z)
    env.add(lamp)
  }
  const rim = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), basic(0x4d95d8, 1.4))
  rim.position.set(-3.6, 1.6, -3.4); rim.lookAt(0, 1.2, 0)
  env.add(rim)
  return env
}

function disposeScene(root: THREE.Object3D) {
  root.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose(); (m.material as THREE.Material | undefined)?.dispose() })
}

/**
 * Compila en paralelo (sin bloquear) los shaders que usa PMREMGenerator.fromScene: los materiales del cuarto del
 * entorno, la caja de fondo y los filtros de desenfoque y GGX. Sin esto, generar el entorno compilaba todo de
 * golpe en Windows (más de medio segundo con la página congelada). Usa métodos internos de three.js (r186): si
 * cambian, el entorno igual se genera, sólo que sin esta preparación.
 */
async function compileEnvironment(pmrem: THREE.PMREMGenerator, room: THREE.Scene) {
  const renderer = (pmrem as unknown as { _renderer: THREE.WebGLRenderer })._renderer
  const pm = pmrem as unknown as { _setSize?: (n: number) => void; _allocateTargets?: () => THREE.WebGLRenderTarget; _blurMaterial?: THREE.Material; _ggxMaterial?: THREE.Material }
  if (!renderer || !pm._setSize || !pm._allocateTargets) return
  pm._setSize(128)
  const target = pm._allocateTargets()
  const camera = new THREE.PerspectiveCamera(90, 1, 0.1, 100)
  const quad = new THREE.PlaneGeometry(2, 2)
  const box = new THREE.BoxGeometry()
  const extra = new THREE.Scene()
  for (const m of [pm._blurMaterial, pm._ggxMaterial]) if (m) extra.add(new THREE.Mesh(quad, m))
  const background = new THREE.MeshBasicMaterial({ side: THREE.BackSide, depthWrite: false, depthTest: false })
  extra.add(new THREE.Mesh(box, background))
  const previous = renderer.getRenderTarget()
  renderer.setRenderTarget(target)
  await Promise.all([renderer.compileAsync(room, camera), renderer.compileAsync(extra, camera)]).catch(() => {})
  // Primer uso de cada programa en un destino de 1 × 1 px, uno por uno y con la GPU libre.
  const tiny = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType })
  await waitForGpu(renderer)
  renderer.setRenderTarget(tiny)
  renderer.render(room, camera)
  await waitForGpu(renderer)
  for (const mesh of [...extra.children]) {
    const solo = new THREE.Scene(); solo.add(mesh)
    renderer.setRenderTarget(tiny); renderer.render(solo, camera)
    await waitForGpu(renderer)
  }
  renderer.setRenderTarget(previous)
  tiny.dispose(); target.dispose(); quad.dispose(); box.dispose(); background.dispose()
}

/**
 * Arma la escena por pasos cediendo el hilo principal entre uno y otro. Si `signal` se cancela a medio camino (la
 * persona salió de la página), libera lo creado y devuelve null.
 */
export async function createRackScene(host: HTMLElement, overlay: HTMLElement, opts: RackSceneOptions, signal?: AbortSignal): Promise<RackScene | null> {
  mark('inicio')
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
  const dpr = Math.min(window.devicePixelRatio, 1.5)
  renderer.setPixelRatio(dpr)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.96
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.shadowMap.autoUpdate = false // la escena es estática: las sombras se calculan una vez
  // Consultar el registro de cada shader fuerza en Windows a terminar la compilación de golpe; sólo en desarrollo.
  renderer.debug.checkShaderErrors = import.meta.env.DEV
  renderer.domElement.className = 'block h-full w-full'
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const BG = 0x060d17
  scene.background = new THREE.Color(BG)
  scene.fog = new THREE.Fog(BG, 6.5, 13)
  let pmrem: THREE.PMREMGenerator | null = null
  let envTex: THREE.Texture | null = null
  const abandon = () => { disposeDeep(scene); envTex?.dispose(); pmrem?.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); return null }

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 40)

  // Luz: cenital fría de luminarias (con sombras suaves), relleno muy bajo y un contraluz azul que separa los racks
  // del fondo. Sin luces de colores de ciencia ficción.
  const key = new THREE.DirectionalLight(0xf2f6ff, 1.25)
  key.position.set(1.6, 4.2, 3.2)
  key.target.position.set(0, 0.8, -0.4)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  Object.assign(key.shadow.camera, { left: -2.6, right: 2.6, top: 3.2, bottom: -1.2, near: 0.5, far: 9 })
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.025
  scene.add(key, key.target)
  const fill = new THREE.HemisphereLight(0xb7c8dc, 0x0a121c, 0.36); scene.add(fill)
  const rim = new THREE.DirectionalLight(0x4d95d8, 0.9); rim.position.set(-3.5, 1.8, -3.6); scene.add(rim)
  for (const z of [0.75, -1.25]) {
    const s = new THREE.SpotLight(0xe9f1ff, 6.5, 7.5, 0.95, 1, 1.7)
    s.position.set(0, 2.94, z); s.target.position.set(0, 0, z * 0.6)
    scene.add(s, s.target)
  }

  // Cuarto: piso técnico (losetas perforadas en el pasillo frío), muro, plafón y luminarias lineales.
  const floorTex = tex.floor(false); floorTex.repeat.set(20, 12)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 7.2), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.62, metalness: 0.06 }))
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -0.4); floor.receiveShadow = true
  scene.add(floor)
  const perfTex = tex.floor(true); perfTex.repeat.set(4, 1)
  const perf = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshStandardMaterial({ map: perfTex, roughness: 0.6, metalness: 0.12 }))
  perf.rotation.x = -Math.PI / 2; perf.position.set(0, 0.002, 0.45); perf.receiveShadow = true
  scene.add(perf)
  const wallTex = tex.wall(); wallTex.repeat.set(6, 1.6)
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.2), new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9, metalness: 0 }))
  wall.position.set(0, 1.6, -1.85); wall.receiveShadow = true
  scene.add(wall)
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(12, 7.2), new THREE.MeshStandardMaterial({ color: 0x10161d, roughness: 1 }))
  ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, 3.0, -0.4)
  scene.add(ceiling)
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xeaf3ff, emissiveIntensity: 5, roughness: 1 })
  for (const z of [0.75, -1.25]) {
    const housing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.035, 0.16), MAT.coatEdge); housing.position.set(0, 2.98, z); scene.add(housing)
    const lens = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.11), lampMat); lens.rotation.x = Math.PI / 2; lens.position.set(0, 2.96, z); scene.add(lens)
  }
  // Barra de tierra en el muro (detalle de un site real).
  const bus = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.012), MAT.copper); bus.position.set(-1.55, 2.25, -1.83); scene.add(bus)

  await breathe(); if (signal?.aborted) return abandon()
  mark('cuarto')

  // Fila de racks: el del centro (abierto) es el que se explora; los vecinos llevan puerta perforada. Entre racks,
  // organizadores verticales con su haz de cables. Frente hacia +Z (rotación de -90° en Y).
  const row = new THREE.Group()
  scene.add(row)
  await prepareRackTextures([{ layout: MAIN, seed: 2 }, { layout: SIDE, seed: 5 }, { layout: SIDE, seed: 9 }], breathe, signal)
  if (signal?.aborted) return abandon()
  mark('texturas')
  const main = buildRack(MAIN, { seed: 2, cordColor: 0x1f6fd1 })
  await breathe(); if (signal?.aborted) return abandon()
  const left = buildRack(SIDE, { seed: 5, cordColor: 0x1f6fd1, door: true })
  await breathe(); if (signal?.aborted) return abandon()
  const right = buildRack(SIDE, { seed: 9, cordColor: 0xe9eef2, door: true })
  for (const [r, x] of [[left.group, -0.75], [main.group, 0], [right.group, 0.75]] as const) { r.rotation.y = -Math.PI / 2; r.position.x = x; row.add(r) }
  row.add(buildVerticalManager(-0.375, { seed: 3 }), buildVerticalManager(0.375, { seed: 4 }))
  // La fila sigue a ambos lados (copias que comparten geometría y materiales: casi no cuestan).
  for (const [src, x] of [[left.group, -1.5], [right.group, 1.5]] as const) { const c = src.clone(); c.position.x = x; row.add(c) }
  // Placa de identificación en el travesaño superior de cada rack (R-01 a R-05; el que se explora es R-03).
  ;[-1.5, -0.75, 0, 0.75, 1.5].forEach((x, i) => { const plate = buildNameplate(`R-0${i + 1}`); plate.position.set(x - 0.17, 1.965, 0.002); row.add(plate) })
  // Tierra física: del rack que se explora, por arriba, hasta la barra de tierra del muro.
  row.add(buildGround([[0.24, 1.99, -0.92], [0.24, 2.3, -0.95], [0.2, 2.46, -1.3], [-0.3, 2.46, -1.76], [-1.1, 2.42, -1.8], [-1.42, 2.27, -1.82]]))
  mark('racks')
  await breathe(); if (signal?.aborted) return abandon()

  // Escalerilla con cableado, canaleta de fibra, bajadas a cada organizador y varillas al plafón.
  const ladder = buildLadder({ length: 6, y: 2.34, z: -0.42, bundles: [{ offset: -0.1, color: 0x1f6fd1, count: 22 }, { offset: 0.09, color: 0x2d7fe0, count: 16 }] })
  const duct = buildDuct({ length: 6, y: 2.58, z: -0.1 })
  const drops = buildDrops([-0.375, 0.375], { yTop: 2.36, z: -0.42 })
  const rods = buildRods([-2.2, -1.1, 0, 1.1, 2.2].flatMap((x) => [[x, -0.65, 2.3, 3.0], [x, -0.19, 2.3, 3.0], [x + 0.3, -0.17, 2.56, 3.0], [x + 0.3, -0.03, 2.56, 3.0]] as [number, number, number, number][]))
  for (const o of [ladder, duct, drops]) o.traverse((c) => { c.userData.part = 'tray' })
  scene.add(ladder, duct, drops, rods)
  mark('escalerilla')

  // Reflejos suaves del entorno (PMREM de 128 px). Prueba: ?entorno=0 lo omite.
  await breathe(); if (signal?.aborted) return abandon()
  if (new URLSearchParams(location.search).get('entorno') !== '0') {
    pmrem = new THREE.PMREMGenerator(renderer)
    const room = buildEnvScene()
    await compileEnvironment(pmrem, room)
    if (signal?.aborted) { disposeScene(room); return abandon() }
    envTex = pmrem.fromScene(room, 0.03, 0.1, 100, { size: 128, position: new THREE.Vector3(0, 1.3, -0.2) }).texture
    disposeScene(room)
    scene.environment = envTex
    scene.environmentIntensity = 0.72
  }
  mark('entorno')

  // Postproceso: MSAA (con la profundidad resuelta para el desenfoque), profundidad de campo, brillo sutil (sólo lo
  // muy luminoso: LED, pantallas, luminarias), salida con ACES y acabado fotográfico.
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4, depthTexture: new THREE.DepthTexture(1, 1) })
  const composer = new EffectComposer(renderer, target)
  composer.setPixelRatio(dpr)
  composer.addPass(new RenderPass(scene, camera))
  const dof = new DofPass(camera)
  composer.addPass(dof)
  // Umbral alto: sólo brilla lo que emite luz (LED, pantallas, luminarias), no las superficies iluminadas.
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.38, 0.45, 1.15)
  composer.addPass(bloom)
  const output = new OutputPass()
  composer.addPass(output)
  // OutputPass arma sus definiciones (tono y espacio de color) en su primer cuadro y ahí recompilaría su shader:
  // se fijan antes, iguales, para compilarlo en paralelo con lo demás.
  const outPriv = output as unknown as { _outputColorSpace: string; _toneMapping: number }
  outPriv._outputColorSpace = renderer.outputColorSpace
  outPriv._toneMapping = renderer.toneMapping
  output.material.defines = { SRGB_TRANSFER: '', ACES_FILMIC_TONE_MAPPING: '' }
  output.material.needsUpdate = true
  const finish = new FinishPass()
  composer.addPass(finish)

  // Anclas y cajas de cada parte (para la cámara, las marcas y el marco de enfoque).
  scene.updateMatrixWorld(true)
  const parts = new Map<Part, { anchor: THREE.Vector3; box: THREE.Box3 }>()
  for (const unit of main.units) {
    if (!unit.part) continue
    const box = new THREE.Box3().setFromObject(unit.mesh)
    const anchor = box.getCenter(new THREE.Vector3()); anchor.z = box.max.z
    parts.set(unit.part as Part, { anchor, box })
  }
  parts.set('tray', { anchor: new THREE.Vector3(0.15, 2.3, -0.2), box: new THREE.Box3(new THREE.Vector3(-0.75, 2.28, -0.66), new THREE.Vector3(0.75, 2.66, -0.03)) })

  // Superposición: marcas numeradas, marco de enfoque con etiqueta y viñeta (DOM, decorativos: la lista de la
  // sección es el control accesible).
  const vignette = document.createElement('div'); vignette.className = 'rack-vignette'; overlay.appendChild(vignette)
  const frame = document.createElement('div'); frame.className = 'rack-focus'
  frame.innerHTML = '<i></i><i></i><i></i><i></i><span class="rack-focus-label"></span>'
  overlay.appendChild(frame)
  const frameLabel = frame.querySelector('span')!
  const hoverFrame = document.createElement('div'); hoverFrame.className = 'rack-focus is-hover'
  hoverFrame.innerHTML = '<i></i><i></i><i></i><i></i>'
  overlay.appendChild(hoverFrame)
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
  const DEFAULT: View = { target: new THREE.Vector3(0.05, 1.3, -0.4), theta: 0.48, phi: 1.5, radius: 4.6 }
  // Entrada: plano abierto y más alto, desde el pasillo; la cámara llega a la vista general al entrar en pantalla.
  const INTRO: View = { target: new THREE.Vector3(0.1, 1.42, -0.5), theta: 0.92, phi: 1.38, radius: 6.3 }
  let introPending = !opts.reduced
  const start = introPending ? INTRO : DEFAULT
  const view: View = { target: start.target.clone(), theta: start.theta, phi: start.phi, radius: start.radius }
  const LIMITS = { theta: [-0.7, 0.95], phi: [1.2, 1.72] } as const
  let drift = { theta: 0, phi: 0 }
  const applyCamera = () => {
    camera.position.setFromSpherical(new THREE.Spherical(view.radius, view.phi + drift.phi, view.theta + drift.theta)).add(view.target)
    camera.lookAt(view.target)
  }
  const viewFor = (part: Part | null): View => {
    if (!part) return { ...DEFAULT, target: DEFAULT.target.clone() }
    const a = parts.get(part)!.anchor
    // Escalerilla: desde arriba y de frente, para ver los haces sobre los peldaños (la canaleta queda delante).
    if (part === 'tray') return { target: new THREE.Vector3(0.2, 2.4, -0.4), theta: 0.55, phi: 1.4, radius: 2.1 }
    if (part === 'ups') return { target: new THREE.Vector3(0, a.y + 0.05, 0), theta: 0.36, phi: 1.36, radius: 2.0 }
    return { target: new THREE.Vector3(0, a.y, 0), theta: 0.32, phi: 1.47, radius: 1.55 }
  }

  // Dibujo bajo demanda: 60 cps al moverse; en reposo, la cámara respira a 30 cps; nada fuera de pantalla.
  let ready = false
  let visible = true
  let raf = 0
  let dragging = false
  let selected: Part | null = null
  let tween: { from: View; to: View; t0: number; dur: number } | null = null
  let lastFrame = 0
  let hovered: Part | null = null
  // Lente: el foco sigue al objetivo de la cámara; la apertura es mínima en la vista general y amplia al inspeccionar.
  const APERTURE = { overview: 7, part: 24 }
  let aperture = { from: APERTURE.overview, to: APERTURE.overview }
  const lens = (k: number) => {
    const h = composer.readBuffer.height || 1
    const u = dof.material.uniforms
    u.focus.value = view.radius
    u.aperture.value = (aperture.from + (aperture.to - aperture.from) * k) * (h / 1000)
    u.maxBlur.value = 16 * (h / 1000)
  }
  const loop = (now: number) => {
    raf = 0
    const idle = !tween && !dragging
    if (idle && !opts.reduced && now - lastFrame < 31) { raf = requestAnimationFrame(loop); return }
    lastFrame = now
    let e = 1
    if (tween) {
      const k = Math.min(1, (now - tween.t0) / tween.dur)
      e = easeInOut(k)
      view.target.lerpVectors(tween.from.target, tween.to.target, e)
      view.theta = tween.from.theta + (tween.to.theta - tween.from.theta) * e
      view.phi = tween.from.phi + (tween.to.phi - tween.from.phi) * e
      view.radius = tween.from.radius + (tween.to.radius - tween.from.radius) * e
      if (k >= 1) tween = null
    }
    if (!opts.reduced) drift = { theta: 0.028 * Math.sin(now / 3400), phi: 0.012 * Math.sin(now / 4300) }
    applyCamera()
    lens(e)
    finish.material.uniforms.seed.value = (now % 1000) / 7
    composer.render()
    placeOverlay()
    if (visible && (!opts.reduced || tween || dragging)) raf = requestAnimationFrame(loop)
  }
  const request = () => { if (ready && !raf && visible) raf = requestAnimationFrame(loop) }

  const v = new THREE.Vector3()
  const toScreen = (p: THREE.Vector3, w: number, h: number) => { v.copy(p).project(camera); return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, z: v.z } }
  const corners = Array.from({ length: 8 }, () => new THREE.Vector3())
  /** Rectángulo en pantalla de la caja de una pieza (con margen y dentro del escenario). */
  const rectOf = (part: Part, w: number, h: number) => {
    const b = parts.get(part)!.box
    let i = 0
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) corners[i++].set(x, y, z)
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (const c of corners) { const p = toScreen(c, w, h); x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y) }
    const pad = 10
    return { x0: Math.max(6, x0 - pad), y0: Math.max(6, y0 - pad), x1: Math.min(w - 6, x1 + pad), y1: Math.min(h - 6, y1 + pad) }
  }
  const place = (el: HTMLElement, r: { x0: number; y0: number; x1: number; y1: number }) => {
    el.style.transform = `translate(${r.x0.toFixed(1)}px, ${r.y0.toFixed(1)}px)`
    el.style.width = `${Math.max(24, r.x1 - r.x0).toFixed(1)}px`
    el.style.height = `${Math.max(18, r.y1 - r.y0).toFixed(1)}px`
  }
  const placeOverlay = () => {
    const w = host.clientWidth, h = host.clientHeight
    // Marcas: al borde derecho de cada pieza; si dos quedan a menos de 28 px se muestra una (la elegida si es una).
    const placed: { part: Part; el: HTMLButtonElement; x: number; y: number; inside: boolean }[] = []
    for (const [part, el] of markers) {
      const p = parts.get(part)!.anchor.clone()
      if (part !== 'tray') p.x = 0.31
      const s = toScreen(p, w, h)
      placed.push({ part, el, x: s.x, y: s.y, inside: s.z < 1 && s.x > 10 && s.x < w - 10 && s.y > 10 && s.y < h - 10 })
    }
    const shown: { x: number; y: number }[] = []
    for (const m of [...placed].sort((a, b) => Number(b.part === selected) - Number(a.part === selected))) {
      const ok = m.inside && !shown.some((s) => Math.hypot(s.x - m.x, s.y - m.y) < 28)
      if (ok) shown.push(m)
      m.el.style.transform = `translate(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px)`
      m.el.style.opacity = ok ? '1' : '0'
      m.el.style.pointerEvents = ok ? 'auto' : 'none'
      m.el.classList.toggle('is-active', m.part === selected)
    }
    // Marco tenue sobre la pieza bajo el mouse (si no es la elegida).
    for (const m of markers.values()) m.classList.toggle('is-hover', m.dataset.part === hovered && hovered !== selected)
    if (hovered && hovered !== selected) { const r = rectOf(hovered, w, h); place(hoverFrame, r); hoverFrame.classList.add('is-on') }
    else hoverFrame.classList.remove('is-on')
    // Marco de enfoque y viñeta alrededor de la pieza elegida.
    if (!selected) { frame.classList.remove('is-on'); vignette.classList.remove('is-on'); return }
    const { x0, y0, x1, y1 } = rectOf(selected, w, h)
    place(frame, { x0, y0, x1, y1 })
    frame.classList.toggle('label-below', y0 < 44)
    frame.classList.add('is-on')
    vignette.style.setProperty('--fx', `${((((x0 + x1) / 2) / w) * 100).toFixed(1)}%`)
    vignette.style.setProperty('--fy', `${((((y0 + y1) / 2) / h) * 100).toFixed(1)}%`)
    vignette.style.setProperty('--fr', `${Math.max(x1 - x0, y1 - y0).toFixed(0)}px`)
    vignette.classList.add('is-on')
  }

  function focus(part: Part | null) {
    selected = part
    introPending = false
    frameLabel.textContent = part ? opts.labels[part] : ''
    const to = viewFor(part)
    const current = dof.material.uniforms.aperture.value / ((composer.readBuffer.height || 1) / 1000)
    aperture = { from: current, to: part ? APERTURE.part : APERTURE.overview }
    if (opts.reduced) { Object.assign(view, { ...to, target: to.target }); tween = null; aperture.from = aperture.to }
    else tween = { from: { ...view, target: view.target.clone() }, to, t0: performance.now(), dur: 1300 }
    request()
  }
  /** Llegada a la vista general (una vez, al entrar el escenario en pantalla). */
  const intro = () => {
    if (!introPending || !ready) return
    introPending = false
    tween = { from: { ...view, target: view.target.clone() }, to: viewFor(null), t0: performance.now(), dur: 2600 }
    request()
  }

  // Arrastre (mouse o lápiz) dentro de un rango; la rueda del mouse no se captura: la página sigue desplazándose.
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
    view.theta = THREE.MathUtils.clamp(view.theta - dx * 0.005, LIMITS.theta[0], LIMITS.theta[1])
    view.phi = THREE.MathUtils.clamp(view.phi - dy * 0.0035, LIMITS.phi[0], LIMITS.phi[1])
  }
  const raycaster = new THREE.Raycaster()
  const hit = new THREE.Vector3()
  /** Pieza bajo el puntero: el rayo contra la caja de cada pieza (barato y estable, sin recorrer los cables). */
  const pick = (cx: number, cy: number): Part | null => {
    const r = canvas.getBoundingClientRect()
    raycaster.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera)
    let best: Part | null = null, bestD = Infinity
    for (const [part, { box }] of parts) {
      if (!raycaster.ray.intersectBox(box, hit)) continue
      const d = hit.distanceTo(raycaster.ray.origin)
      if (d < bestD) { bestD = d; best = part }
    }
    return best
  }
  let hoverRaf = 0, hx = 0, hy = 0
  const hoverAt = () => {
    hoverRaf = 0
    const p = ready && !dragging ? pick(hx, hy) : null
    if (p === hovered) return
    hovered = p
    canvas.style.cursor = p ? 'pointer' : ''
    placeOverlay()
  }
  const hoverMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || last) return
    hx = e.clientX; hy = e.clientY
    hoverRaf ||= requestAnimationFrame(hoverAt)
  }
  const hoverLeave = () => { hx = -1e5; hy = -1e5; hoverRaf ||= requestAnimationFrame(hoverAt) }
  const up = (e: PointerEvent) => {
    if (!last) return
    last = null; dragging = false; host.classList.remove('is-dragging')
    if (moved < 6) {
      const part = pick(e.clientX, e.clientY)
      if (part) { opts.onSelect(part); focus(part) }
    }
    request()
  }
  canvas.addEventListener('pointerdown', down)
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointermove', hoverMove)
  canvas.addEventListener('pointerleave', hoverLeave)
  canvas.addEventListener('pointerup', up)
  canvas.addEventListener('pointercancel', up)

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    composer.setSize(w, h)
    camera.aspect = w / h
    // Con la lista sobre el borde izquierdo del escenario (≥ 1024 px), el encuadre se corre a la derecha.
    if (w >= 1024) camera.setViewOffset(w, h, -Math.round(w * 0.07), 0, w, h)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
    request()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  let onScreen = 0
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting && !document.hidden
    onScreen = e.intersectionRatio
    if (visible) request()
    if (onScreen >= 0.3) intro()
  }, { threshold: [0, 0.3] })
  io.observe(host)
  const onVis = () => { visible = !document.hidden; if (visible) request() }
  document.addEventListener('visibilitychange', onVis)

  // Indicadores: algunos LED cambian de vez en cuando (se ve en el siguiente cuadro).
  const leds = main.units.filter((u) => u.emissive).map((u) => u.emissive!)
  const blink = window.setInterval(() => {
    if (!visible || opts.reduced || leds.length === 0) return
    const m = leds[Math.floor(Math.random() * leds.length)]
    m.emissiveIntensity = m.emissiveIntensity > 2 ? 1.5 : 2.3
    request()
  }, 700)

  /**
   * Primer uso de cada shader, uno por turno y con la GPU libre entre uno y otro: un objeto por programa de la escena,
   * luego la escena completa en 1 × 1 px (sombras incluidas) y al final cada material del postproceso.
   */
  async function warmUp() {
    const drawables: THREE.Object3D[] = []
    scene.traverse((o) => { if ((o as THREE.Mesh).isMesh || (o as THREE.LineSegments).isLineSegments) drawables.push(o) })
    const textures = new Set<THREE.Texture>()
    const kinds = new Map<string, THREE.Object3D>()
    for (const o of drawables) {
      const m = (o as THREE.Mesh).material
      for (const mt of Array.isArray(m) ? m : [m]) {
        for (const val of Object.values(mt)) if (val instanceof THREE.Texture) textures.add(val)
        const program = (renderer.properties.get(mt) as { currentProgram?: { id: number } }).currentProgram
        const k = program ? `p${program.id}` : mt.type
        if (!kinds.has(k)) kinds.set(k, o)
      }
    }
    let n = 0
    for (const tx of textures) { if (signal?.aborted) return; renderer.initTexture(tx); if (++n % 3 === 0) await breathe() }
    const before = drawables.map((o) => [o.visible, o.frustumCulled] as const)
    // El mapa de sombras debe existir antes de dibujar materiales que lo leen (si no, WebGL marca el tipo de textura).
    renderer.shadowMap.needsUpdate = true
    for (const rep of new Set(kinds.values())) {
      if (signal?.aborted) break
      drawables.forEach((o) => { o.visible = o === rep; o.frustumCulled = o !== rep })
      renderer.setRenderTarget(composer.readBuffer) // la misma variante de shader que usa el postproceso
      renderer.render(scene, camera)
      renderer.setRenderTarget(null)
      await waitForGpu(renderer, signal)
    }
    drawables.forEach((o, i) => { o.visible = before[i][0]; o.frustumCulled = before[i][1] })
    if (signal?.aborted) return
    // Escena completa en un destino diminuto: sombras de todos los objetos (y sus materiales de profundidad).
    const tiny = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType })
    renderer.shadowMap.needsUpdate = true
    renderer.setRenderTarget(tiny)
    renderer.render(scene, camera)
    await waitForGpu(renderer, signal)
    // Postproceso: cada material de pase en un plano, hacia el mismo tipo de destino que usará (el último, a pantalla).
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2))
    quad.frustumCulled = false
    const enabled = composer.passes.filter((p) => p.enabled)
    for (const pass of enabled) {
      for (const val of Object.values(pass)) {
        for (const m of Array.isArray(val) ? val : [val]) {
          if (!(m instanceof THREE.Material) || signal?.aborted) continue
          quad.material = m
          renderer.setRenderTarget(pass === enabled[enabled.length - 1] ? null : tiny)
          renderer.render(quad, camera)
          await waitForGpu(renderer, signal)
        }
      }
    }
    renderer.setRenderTarget(null)
    quad.geometry.dispose(); tiny.dispose()
  }

  /** Compila en paralelo también los shaders del postproceso (cada material de pase como un plano aparte). */
  async function compilePasses() {
    const quad = new THREE.PlaneGeometry(2, 2)
    const passScene = new THREE.Scene()
    for (const pass of composer.passes) {
      for (const val of Object.values(pass)) {
        for (const m of Array.isArray(val) ? val : [val]) if (m instanceof THREE.Material) passScene.add(new THREE.Mesh(quad, m))
      }
    }
    await renderer.compileAsync(passScene, camera).catch(() => {})
    quad.dispose()
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
      canvas.removeEventListener('pointermove', hoverMove)
      canvas.removeEventListener('pointerleave', hoverLeave)
      cancelAnimationFrame(hoverRaf)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      markers.forEach((m) => m.remove())
      frame.remove(); hoverFrame.remove(); vignette.remove()
      composer.dispose(); target.dispose()
      disposeDeep(scene)
      envTex?.dispose(); pmrem?.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }

  resize()
  applyCamera()
  await breathe()
  // La escena se dibuja en el búfer del postproceso (sin tono ni espacio de color: eso lo hace OutputPass), así que
  // sus shaders se compilan para ese destino; los de los pases, para ambos (búfer intermedio y pantalla).
  renderer.setRenderTarget(composer.readBuffer)
  if (!signal?.aborted) await renderer.compileAsync(scene, camera).catch(() => {})
  mark('shaders')
  if (!signal?.aborted) await compilePasses()
  renderer.setRenderTarget(null)
  if (!signal?.aborted) await compilePasses()
  mark('postproceso')
  if (signal?.aborted) { api.dispose(); return null }
  await waitForGpu(renderer, signal)
  await warmUp()
  mark('calentamiento')
  if (signal?.aborted) { api.dispose(); return null }
  composer.render()
  mark('primer-cuadro')
  await waitForGpu(renderer, signal)
  mark('gpu-lista')
  if (signal?.aborted) { api.dispose(); return null }
  ready = true
  placeOverlay()
  opts.onReady()
  request()
  if (onScreen >= 0.3) intro()
  return api
}

export { U }
