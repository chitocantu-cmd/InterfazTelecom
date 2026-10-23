import { ArrowRight, Box, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { IMG } from '../../data/media'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { cn } from '../../lib/utils'
import { hasWebGL, useExperience } from '../../motion/experience'
import { SplitWords, useReveal } from '../../motion/primitives'
import type { Part, RackScene } from '../../three/rackScene'

const PARTS: Part[] = ['tray', 'fiber', 'patch', 'organizer', 'switch', 'nvr', 'ups']
/** Servicios de Interfaz que intervienen en cada componente. */
const RELATED: Record<Part, string[]> = {
  tray: ['cableado-estructurado', 'racks-y-site'],
  fiber: ['fibra-optica', 'certificacion-y-pruebas'],
  patch: ['cableado-estructurado', 'certificacion-y-pruebas'],
  organizer: ['racks-y-site', 'mantenimiento-y-soporte'],
  switch: ['redes-empresariales', 'wifi-empresarial'],
  nvr: ['cctv-videovigilancia'],
  ups: ['calidad-de-energia'],
}

/**
 * «Explora una instalación». La lista de componentes es el control (teclado, lector de pantalla, teléfono); en
 * escritorio con WebGL, la escena 3D (three.js, descargada al acercarse a la sección) enfoca y resalta el componente
 * elegido y deja girar el rack. Sin WebGL, en el teléfono o con «reducir movimiento», la misma sección funciona con
 * una fotografía y la ficha de cada componente.
 */
export function RackExplorer() {
  const { t, c } = useI18n()
  const tier = useExperience()
  const [selected, setSelected] = useState<Part>('patch')
  const [status, setStatus] = useState<'off' | 'loading' | 'ready' | 'failed'>('off')
  const host = useRef<HTMLDivElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const scene = useRef<RackScene | null>(null)
  const root = useReveal<HTMLElement>()
  const use3d = tier === 'full' && status !== 'failed'

  useEffect(() => {
    const el = host.current
    if (tier !== 'full' || !el || !overlay.current || !hasWebGL()) return
    let cancelled = false
    // La escena se descarga cuando la sección está a una pantalla de distancia.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      setStatus('loading')
      import('../../three/rackScene')
        .then(({ createRackScene }) => {
          if (cancelled || !host.current || !overlay.current) return
          scene.current = createRackScene(host.current, overlay.current, {
            onSelect: (p) => setSelected(p),
            onReady: () => setStatus('ready'),
          })
          scene.current.focus('patch')
        })
        .catch(() => setStatus('failed'))
    }, { rootMargin: '900px 0px' })
    io.observe(el)
    const lost = () => setStatus('failed')
    el.addEventListener('webglcontextlost', lost, true)
    return () => {
      cancelled = true
      io.disconnect()
      el.removeEventListener('webglcontextlost', lost, true)
      scene.current?.dispose()
      scene.current = null
    }
  }, [tier])

  const choose = (p: Part) => { setSelected(p); scene.current?.focus(p) }
  const part = t.rack3d.parts[selected]

  return (
    <section ref={root} aria-labelledby="instalacion-title" className="relative overflow-hidden bg-night py-20 text-white md:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_70%_45%,rgb(23_105_200/0.28),transparent_70%)]" />
      <div className="container relative grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-4">
          <p data-reveal="rise" className="flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-lumen">
            <span aria-hidden className="h-px w-8 bg-lumen" />{t.rack3d.eyebrow}
          </p>
          <h2 id="instalacion-title" data-reveal="words" className="mt-5 text-h2 !text-white"><SplitWords text={t.rack3d.title} mode="view" /></h2>
          <p data-reveal="rise" className="mt-5 text-white/70">{t.rack3d.lede}</p>

          <ol aria-label={t.rack3d.listLabel} className="mt-8 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-1">
            {PARTS.map((p, i) => (
              <li key={p} className="bg-night">
                <button type="button" aria-pressed={selected === p} onClick={() => choose(p)} className={cn('flex w-full items-center gap-3 px-4 py-3 text-left text-small transition-colors', selected === p ? 'bg-white/[0.07] text-white' : 'text-white/65 hover:bg-white/[0.04] hover:text-white')}>
                  <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[0.68rem]', selected === p ? 'bg-lumen text-night' : 'border border-white/25 text-white/60')}>{i + 1}</span>
                  {t.rack3d.parts[p].name}
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="min-w-0 lg:col-span-8">
          <div className="relative overflow-hidden border border-white/10 bg-[radial-gradient(70%_70%_at_50%_40%,#102036,#050d18)]">
            <div className={cn('relative', use3d ? 'aspect-[4/3] xl:aspect-[16/11]' : 'aspect-[4/3]')}>
              {/* Escena 3D o, sin ella, la fotografía */}
              <div ref={host} className={cn('rack-host absolute inset-0', use3d ? 'cursor-grab' : 'hidden')} role={use3d ? 'img' : undefined} aria-label={use3d ? t.rack3d.canvasLabel : undefined} />
              <div ref={overlay} aria-hidden className={cn('pointer-events-none absolute inset-0', !use3d && 'hidden')} />
              {!use3d && (
                <img src={IMG.rack.src} srcSet={IMG.rack.srcSet} sizes="(min-width: 1024px) 60vw, 100vw" alt={IMG.rack.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: IMG.rack.pos }} />
              )}
              {use3d && status !== 'ready' && (
                <div className="absolute inset-0 grid place-items-center">
                  <p className="flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-white/60"><Box aria-hidden className="h-4 w-4 animate-pulse text-lumen" strokeWidth={1.5} />{t.rack3d.loading}</p>
                </div>
              )}
              {use3d && status === 'ready' && (
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-night/85 to-transparent p-4 pb-8 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-white/55">
                  <span>{t.rack3d.hint}</span>
                  <button type="button" onClick={() => { scene.current?.focus(null) }} className="pointer-events-auto inline-flex items-center gap-2 border border-white/20 px-3 py-1.5 text-white/80 transition-colors hover:border-lumen hover:text-white">
                    <RotateCcw aria-hidden className="h-3.5 w-3.5" strokeWidth={1.75} />{t.rack3d.reset}
                  </button>
                </div>
              )}
            </div>

            {/* Ficha del componente */}
            <div className="relative border-t border-white/10 bg-night/80 p-5 md:p-6" aria-live="polite">
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
                <div key={selected} className="sv-fade">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-lumen">{String(PARTS.indexOf(selected) + 1).padStart(2, '0')} · {part.name}</p>
                  <p className="mt-2 max-w-[38rem] text-white/80">{part.text}</p>
                </div>
                <div>
                  <p className="text-label text-white/50">{t.rack3d.related}</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {RELATED[selected].map((slug) => {
                      const s = c.serviceBySlug(slug)
                      return s && (
                        <li key={slug}>
                          <Link to={`/soluciones/${slug}`} className="group inline-flex items-center gap-1.5 border border-white/20 px-3 py-1.5 text-[0.85rem] text-white transition-colors hover:border-lumen">
                            {s.name}<ArrowRight aria-hidden className="arrow-nudge h-3.5 w-3.5 text-lumen" strokeWidth={1.75} />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-label text-white/45">{t.rack3d.note}{!use3d && IMG.rack.ref ? ` ${t.common.referenceImage}.` : ''}</p>
        </div>
      </div>
    </section>
  )
}
