import { ChevronLeft, ChevronRight, MoveHorizontal, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import poster from '../../assets/site3d-touch/f08.webp'
import type { Site3dTouch } from '../../data/site3d-touch'
import { useI18n } from '../../i18n'
import { cn, useReducedMotion } from '../../lib/utils'
import type { Part } from '../../three/rackScene'

/** Cuadro de la vista general (el que se ve al llegar). Es `ORBIT_HOME` de src/data/site3d-orbit.ts. */
const HOME = 8

/** Orden de descarga: primero cuadros espaciados, para poder girar enseguida, y luego los intermedios. */
function loadOrder(count: number) {
  const seen = new Set([HOME])
  const order = [HOME]
  for (const step of [8, 4, 2, 1]) for (let i = 0; i < count; i += step) if (!seen.has(i)) { seen.add(i); order.push(i) }
  return order
}

const nothingToSpare = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return Boolean(c?.saveData) || c?.effectiveType === '2g' || c?.effectiveType === 'slow-2g'
}

/**
 * «Un site de telecomunicaciones, pieza por pieza» para el dedo (teléfono y tableta). En una pantalla angosta una fila
 * de racks con WebGL se vería diminuta y exigiría demasiado al equipo: aquí la escena real viene renderizada en vertical
 * (tools/site3d-orbit.mjs), y deslizar el dedo recorre esos cuadros, así que gira igual en cualquier teléfono.
 *
 * - Sólo se captura el arrastre horizontal (`touch-action: pan-y`): el desplazamiento vertical sigue siendo de la página.
 * - Las piezas están a pocos milímetros entre sí: en vez de puntos imposibles de tocar sobre el rack, cada una tiene un
 *   número grande en el borde con una línea guía que la sigue mientras la escena gira.
 * - Al elegir una pieza entra su acercamiento; «Restablecer vista» vuelve a la vista general.
 * - Con ahorro de datos o conexión 2G no se descargan los cuadros: queda la imagen fija y los acercamientos.
 */
export function RackTouch({ parts, selected, onChoose, card }: { parts: Part[]; selected: Part | null; onChoose: (p: Part | null) => void; card: ReactNode }) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const pins = useRef<(HTMLButtonElement | null)[]>([])
  const [data, setData] = useState<Site3dTouch | null>(null)
  const [ready, setReady] = useState(false)
  const [turned, setTurned] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [close, setClose] = useState<{ part: Part; src: string } | null>(null)
  const anim = useRef({ pos: HOME, target: HOME, raf: 0, drag: null as { x: number; pos: number; moved: boolean } | null, last: 0, speed: 0 })
  const images = useRef<(HTMLImageElement | undefined)[]>([])
  const draw = useRef<() => void>(() => {})

  // Datos y cuadros: al acercarse a la sección.
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      import('../../data/site3d-touch').then((m) => setData(m.SITE3D_TOUCH)).catch(() => {})
    }, { rootMargin: '700px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!data || nothingToSpare()) return
    let live = true
    const queue = loadOrder(data.frames.length)
    const worker = async () => {
      while (live && queue.length) {
        const i = queue.shift()!
        const img = new Image()
        img.src = data.frames[i]
        await img.decode().catch(() => {})
        if (live && img.naturalWidth) { images.current[i] = img; setReady(true); draw.current() }
      }
    }
    worker(); worker(); worker()
    return () => { live = false }
  }, [data])

  // Dibujo: mezcla los dos cuadros vecinos para que el giro sea continuo, con las líneas guía encima.
  useEffect(() => {
    const c = canvas.current
    const box = stage.current
    if (!c || !box || !data) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    let rail: { x: number; y: number }[] = []
    const measure = () => {
      // Al salir de la página, React limpia las referencias antes de que se desconecte el observador.
      if (pins.current.some((p) => !p)) return
      const r = box.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      c.width = Math.round(r.width * dpr)
      c.height = Math.round(r.height * dpr)
      rail = pins.current.map((p) => {
        const b = p!.getBoundingClientRect()
        return { x: (b.left + b.width / 2 - 15 - r.left) * dpr, y: (b.top + b.height / 2 - r.top) * dpr }
      })
      draw.current()
    }
    const nearest = (i: number) => {
      for (let d = 0; d < data.frames.length; d++) {
        const img = images.current[i - d] ?? images.current[i + d]
        if (img) return img
      }
      return undefined
    }
    draw.current = () => {
      const { pos } = anim.current
      const i = Math.min(Math.floor(pos), data.frames.length - 2)
      const f = pos - i
      const a = nearest(i)
      const b = images.current[i + 1]
      ctx.globalAlpha = 1
      ctx.clearRect(0, 0, c.width, c.height)
      if (a) ctx.drawImage(a, 0, 0, c.width, c.height)
      if (a && b && b !== a && f > 0.02) { ctx.globalAlpha = f; ctx.drawImage(b, 0, 0, c.width, c.height); ctx.globalAlpha = 1 }
      const dpr = c.width / (box.clientWidth || 1)
      parts.forEach((_, p) => {
        const pin = rail[p]
        if (!pin) return
        const x = (data.anchors[i][p][0] * (1 - f) + data.anchors[i + 1][p][0] * f) * c.width
        const y = (data.anchors[i][p][1] * (1 - f) + data.anchors[i + 1][p][1] * f) * c.height
        ctx.strokeStyle = 'rgba(233,246,253,0.62)'
        ctx.lineWidth = dpr
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(pin.x, pin.y); ctx.stroke()
        ctx.fillStyle = '#4cc3f0'
        ctx.beginPath(); ctx.arc(x, y, 2.75 * dpr, 0, Math.PI * 2); ctx.fill()
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    return () => { ro.disconnect(); draw.current = () => {} }
  }, [data, parts])

  const run = () => {
    const a = anim.current
    if (a.raf) return
    const tick = () => {
      a.raf = 0
      const gap = a.target - a.pos
      a.pos = reduce || Math.abs(gap) < 0.01 ? a.target : a.pos + gap * 0.22
      draw.current()
      if (a.pos !== a.target) a.raf = requestAnimationFrame(tick)
    }
    a.raf = requestAnimationFrame(tick)
  }
  useEffect(() => () => cancelAnimationFrame(anim.current.raf), [])

  const count = data?.frames.length ?? 25
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button') || selected || !ready) return
    anim.current.drag = { x: e.clientX, pos: anim.current.target, moved: false }
    anim.current.last = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const a = anim.current
    if (!a.drag) return
    const dx = e.clientX - a.drag.x
    if (!a.drag.moved && Math.abs(dx) > 6) { a.drag.moved = true; setTurned(true) }
    // Un ancho de escenario recorre casi toda la órbita. Arrastrar a la derecha acerca el lado izquierdo de la fila.
    const width = stage.current?.clientWidth || 1
    a.target = Math.min(count - 1, Math.max(0, a.drag.pos + (dx / width) * (count - 2)))
    a.speed = e.clientX - a.last
    a.last = e.clientX
    run()
  }
  const up = () => {
    const a = anim.current
    if (!a.drag) return
    a.drag = null
    setDragging(false)
    // Inercia corta al soltar.
    if (!reduce) { a.target = Math.min(count - 1, Math.max(0, a.target + a.speed * 0.12)); run() }
    a.speed = 0
  }

  const choose = (p: Part | null) => {
    onChoose(p)
    if (p) return
    anim.current.target = HOME
    setTurned(false)
    run()
  }

  // Acercamiento de la pieza: entra cuando ya está decodificado, sin parpadeo.
  useEffect(() => {
    if (!selected) { setClose(null); return }
    if (!data) return
    let live = true
    const src = data.close[selected]
    const img = new Image()
    img.src = src
    img.decode().catch(() => {}).then(() => { if (live) setClose({ part: selected, src }) })
    return () => { live = false }
  }, [selected, data])

  const i = selected ? parts.indexOf(selected) : -1
  const go = (delta: 1 | -1) => {
    const next = i + delta
    choose(next === -2 ? parts[parts.length - 1] : next < 0 || next >= parts.length ? null : parts[next])
  }

  return (
    <div className="mt-8 lg:hidden">
      <div className="sm:container sm:grid sm:grid-cols-2 sm:items-start sm:gap-8">
        <div
          ref={stage}
          role="group"
          aria-label={t.rack3d.canvasLabel}
          className={cn('rt-stage aspect-[4/5]', dragging && 'is-dragging')}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          <img src={poster} width={720} height={900} alt={t.rack3d.canvasLabel} loading="lazy" decoding="async" className="rt-layer" />
          <canvas ref={canvas} aria-hidden className="rt-layer" />
          <img src={close?.src ?? poster} alt="" aria-hidden loading="lazy" decoding="async" className={cn('rt-layer rt-close', close && selected && 'is-on')} />
          <span aria-hidden className="rt-scrim" />
          {!selected && ready && (
            <span aria-hidden className={cn('rt-hint', turned && 'is-off')}>
              <span className="inline-flex items-center gap-2 rounded-[2px] bg-night/70 px-3 py-1.5 text-label text-white/90">
                <MoveHorizontal className="h-4 w-4 text-lumen" strokeWidth={1.75} />{t.rack3d.touchHint}
              </span>
            </span>
          )}
          <button
            type="button"
            onClick={() => choose(null)}
            disabled={!selected && !turned}
            className="absolute left-3 top-3 z-[2] inline-flex min-h-[44px] items-center gap-2 rounded-[2px] bg-night/70 px-3 text-label text-white transition-opacity disabled:opacity-0"
          >
            <RotateCcw aria-hidden className="h-4 w-4" strokeWidth={1.75} />{t.rack3d.reset}
          </button>
          {/* Un número por pieza: el blanco táctil es de 44 px aunque en la foto la pieza mida unos cuantos píxeles. */}
          <ol className="rt-rail z-[2]" aria-label={t.rack3d.listLabel}>
            {parts.map((p, n) => (
              <li key={p}>
                <button ref={(el) => { pins.current[n] = el }} type="button" className="rt-pin" aria-pressed={selected === p} aria-label={t.rack3d.parts[p].name} onClick={() => choose(selected === p ? null : p)}>
                  <span>{n + 1}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="max-sm:container">
          <div className="flex items-center gap-1 border-b border-white/10 py-1">
            <button type="button" onClick={() => go(-1)} aria-label={t.rack3d.prev} className="-ml-2 grid h-12 w-12 shrink-0 place-items-center text-white"><ChevronLeft aria-hidden className="h-6 w-6" strokeWidth={1.5} /></button>
            <p className="min-w-0 flex-1 text-center font-display text-[1.08rem] font-medium leading-tight text-white">
              {selected ? <><span className="mr-2 font-mono text-[0.8rem] text-lumen">{i + 1}/{parts.length}</span>{t.rack3d.parts[selected].name}</> : t.rack3d.overview.name}
            </p>
            <button type="button" onClick={() => go(1)} aria-label={t.rack3d.next} className="-mr-2 grid h-12 w-12 shrink-0 place-items-center text-white"><ChevronRight aria-hidden className="h-6 w-6" strokeWidth={1.5} /></button>
          </div>
          <div className="mt-5">{card}</div>
        </div>
      </div>
    </div>
  )
}
