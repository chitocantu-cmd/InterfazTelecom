import { ArrowRight, Box, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SITE3D_STILLS } from '../../data/site3d'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { cn } from '../../lib/utils'
import { hasWebGL, useExperience } from '../../motion/experience'
import { SplitWords, useReveal } from '../../motion/primitives'
import type { Part, RackScene } from '../../three/rackScene'

const PARTS: Part[] = ['tray', 'fiber', 'patch', 'organizer', 'switch', 'nvr', 'ups']
/** Servicios de Interfaz que intervienen en cada componente (y en la vista general). */
const RELATED: Record<Part | 'overview', string[]> = {
  overview: ['racks-y-site', 'cableado-estructurado', 'fibra-optica'],
  tray: ['cableado-estructurado', 'racks-y-site'],
  fiber: ['fibra-optica', 'certificacion-y-pruebas'],
  patch: ['cableado-estructurado', 'certificacion-y-pruebas'],
  organizer: ['racks-y-site', 'mantenimiento-y-soporte'],
  switch: ['redes-empresariales', 'wifi-empresarial'],
  nvr: ['cctv-videovigilancia'],
  ups: ['calidad-de-energia'],
}

/**
 * «Un site de telecomunicaciones, pieza por pieza». Escenario a todo el ancho con la lista de componentes y la ficha
 * como paneles sobre la escena (en el teléfono, debajo). La lista es el control accesible (teclado, lector de
 * pantalla, toque). En escritorio con WebGL, la escena 3D (three.js, descargada al acercarse) enfoca e inspecciona
 * cada pieza; sin WebGL, en el teléfono o con «reducir movimiento», la misma sección usa vistas fijas de la escena.
 */
export function RackExplorer() {
  const { t, c } = useI18n()
  const tier = useExperience()
  const [selected, setSelected] = useState<Part | null>(null)
  const [status, setStatus] = useState<'off' | 'loading' | 'ready' | 'failed'>('off')
  const host = useRef<HTMLDivElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const scene = useRef<RackScene | null>(null)
  const root = useReveal<HTMLElement>()
  const use3d = tier === 'full' && status !== 'failed'
  // La escena puede terminar de armarse después de que la persona eligió un componente: enfoca el vigente.
  const selectedRef = useRef<Part | null>(selected)
  selectedRef.current = selected
  const labelsRef = useRef(Object.fromEntries(PARTS.map((p) => [p, t.rack3d.parts[p].name])) as Record<Part, string>)

  useEffect(() => {
    const el = host.current
    if (tier !== 'full' || !el || !overlay.current || !hasWebGL()) return
    const abort = new AbortController()
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      setStatus('loading')
      import('../../three/rackScene')
        .then(({ createRackScene }) => {
          if (abort.signal.aborted || !host.current || !overlay.current) return null
          return createRackScene(host.current, overlay.current, {
            onSelect: (p) => setSelected(p),
            onReady: () => setStatus('ready'),
            labels: labelsRef.current,
          }, abort.signal)
        })
        .then((created) => {
          if (!created) return
          scene.current = created
          if (selectedRef.current) created.focus(selectedRef.current)
        })
        .catch(() => setStatus('failed'))
    }, { rootMargin: '900px 0px' })
    io.observe(el)
    const lost = () => setStatus('failed')
    el.addEventListener('webglcontextlost', lost, true)
    return () => {
      abort.abort()
      io.disconnect()
      el.removeEventListener('webglcontextlost', lost, true)
      scene.current?.dispose()
      scene.current = null
    }
  }, [tier])

  const choose = (p: Part | null) => { setSelected(p); scene.current?.focus(p) }
  const info = selected ? t.rack3d.parts[selected] : t.rack3d.overview
  const still = SITE3D_STILLS[selected ?? 'overview']

  // En el teléfono, a dos columnas: la imagen sigue a la vista mientras se elige.
  const list = (compact: boolean) => (
    <ol aria-label={t.rack3d.listLabel} className={cn('grid gap-1', compact && 'grid-cols-2 md:grid-cols-1')}>
      {PARTS.map((p, i) => {
        const on = selected === p
        return (
          <li key={p}>
            <button type="button" aria-pressed={on} onClick={() => choose(on ? null : p)} className={cn('group flex h-full w-full items-center gap-2.5 rounded-[2px] px-2.5 py-2.5 text-left text-small leading-snug transition-colors sm:gap-3 sm:px-3', on ? 'bg-white/[0.1] text-white' : 'text-white/70 hover:bg-white/[0.05] hover:text-white')}>
              <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[0.66rem] transition-colors', on ? 'bg-lumen text-night' : 'border border-white/25 text-white/60 group-hover:border-white/50')}>{i + 1}</span>
              <span className="flex-1">{t.rack3d.parts[p].name}</span>
              <span aria-hidden className={cn('hidden h-px w-4 bg-lumen transition-transform duration-300 md:block', on ? 'scale-x-100' : 'scale-x-0')} />
            </button>
          </li>
        )
      })}
    </ol>
  )
  const card = (
    <div aria-live="polite">
      <div key={selected ?? 'overview'} className="sv-fade">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-lumen">{selected ? String(PARTS.indexOf(selected) + 1).padStart(2, '0') : '00'} · {info.name}</p>
        <p className="mt-2.5 text-[0.98rem] leading-relaxed text-white/85">{info.text}</p>
        {/* Ficha de lo que se ve en el modelo (no una especificación de proyecto). */}
        <p className="mt-4 border-t border-white/10 pt-3 font-mono text-[0.68rem] uppercase leading-relaxed tracking-[0.08em] text-white/60"><span className="text-white/35">{t.rack3d.inScene} ·</span> {info.spec}</p>
      </div>
      <p className="mt-5 text-label text-white/50">{t.rack3d.related}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {RELATED[selected ?? 'overview'].map((slug) => {
          const s = c.serviceBySlug(slug)
          return s && (
            <li key={slug}>
              <Link to={`/soluciones/${slug}`} className="group inline-flex items-center gap-1.5 rounded-[2px] border border-white/20 px-3 py-1.5 text-[0.85rem] text-white transition-colors hover:border-lumen hover:bg-white/[0.04]">
                {s.name}<ArrowRight aria-hidden className="arrow-nudge h-3.5 w-3.5 text-lumen" strokeWidth={1.75} />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )

  return (
    <section ref={root} aria-labelledby="instalacion-title" className="relative overflow-hidden bg-night py-20 text-white md:py-28">
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p data-reveal="rise" className="flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-lumen">
              <span aria-hidden className="h-px w-8 bg-lumen" />{t.rack3d.eyebrow}
            </p>
            <h2 id="instalacion-title" data-reveal="words" className="mt-5 max-w-[18ch] text-h1 !text-white"><SplitWords text={t.rack3d.title} mode="view" /></h2>
          </div>
          <p data-reveal="rise" className="max-w-[30rem] text-white/70 lg:col-span-5 lg:justify-self-end">{t.rack3d.lede}</p>
        </div>
      </div>

      {/* Escenario a todo el ancho (hasta 1600 px); los paneles se alinean con la retícula del contenido. */}
      <div data-reveal="mask" className="rack-stage relative mx-auto mt-12 max-w-frame overflow-hidden border-y border-white/10 bg-[#060d17] md:mt-14">
        <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[min(86svh,54vw)] lg:min-h-[560px]">
          <div ref={host} className={cn('rack-host absolute inset-0', use3d ? 'cursor-grab' : 'hidden')} role={use3d ? 'img' : undefined} aria-label={use3d ? t.rack3d.canvasLabel : undefined} />
          <div ref={overlay} aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', !use3d && 'hidden')} />
          {!use3d && (
            // Vistas fijas de la misma escena (teléfono, equipos sin WebGL, «reducir movimiento»).
            <img key={selected ?? 'overview'} src={still.src} srcSet={still.srcSet} sizes="(min-width: 1600px) 1600px, 100vw" alt={t.rack3d.canvasLabel} loading="lazy" decoding="async" className="rack-still absolute inset-0 h-full w-full object-cover" />
          )}
          {use3d && status !== 'ready' && (
            <div className="absolute inset-0 grid place-items-center">
              <p className="flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-white/60"><Box aria-hidden className="h-4 w-4 animate-pulse text-lumen" strokeWidth={1.5} />{t.rack3d.loading}</p>
            </div>
          )}
          <div className="rack-toolbar pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-night/80 to-transparent pb-8 sm:pb-10">
            <div className="container flex items-center justify-between gap-4 pt-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-white/60 sm:pt-4">
              {use3d && <span className="min-w-0 truncate">{t.rack3d.hint}</span>}
              <button type="button" onClick={() => choose(null)} disabled={!selected} className="pointer-events-auto ml-auto inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[2px] border border-white/20 bg-night/50 px-3 py-1.5 text-white/85 backdrop-blur-sm transition-[color,border-color,opacity] hover:border-lumen hover:text-white disabled:opacity-40">
                <RotateCcw aria-hidden className="h-3.5 w-3.5" strokeWidth={1.75} />{t.rack3d.reset}
              </button>
            </div>
          </div>
          {/* Paneles sobre la escena (escritorio), dentro de la retícula del contenido */}
          <div className="container pointer-events-none absolute inset-0 hidden lg:block">
            <div className="relative h-full">
              <div className="rack-panel pointer-events-auto absolute left-0 top-16 max-h-[calc(100%-6rem)] w-[16.5rem] overflow-y-auto p-3">{list(false)}</div>
              <div className="rack-panel pointer-events-auto absolute bottom-6 right-0 w-[24rem] p-5">{card}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Teléfono y tableta: lista y ficha debajo del escenario */}
      <div className="container">
        <div className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2 md:gap-6 lg:hidden">
          <div className="rack-panel p-2 sm:p-3">{list(true)}</div>
          <div className="rack-panel p-5">{card}</div>
        </div>
      </div>
    </section>
  )
}
