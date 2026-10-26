import { ArrowRight } from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { IMG, type ImgKey } from '../../data/media'
import { QUOTE_FOR, type CategoryId } from '../../data/solutions'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { cn } from '../../lib/utils'
import { SplitWords, useReveal } from '../../motion/primitives'
import { Button } from '../ui'

/** Soluciones del escenario: siete servicios y el frente de ingeniería y mantenimiento (sólo lo que Interfaz ofrece). */
const ITEMS: ({ slug: string; img: ImgKey } | { category: CategoryId; img: ImgKey })[] = [
  { slug: 'cableado-estructurado', img: 'proyCorporativo' },
  { slug: 'fibra-optica', img: 'fiber' },
  { slug: 'redes-empresariales', img: 'rack' },
  { slug: 'cctv-videovigilancia', img: 'cctv' },
  { slug: 'control-de-acceso', img: 'access' },
  { slug: 'racks-y-site', img: 'proySite' },
  { slug: 'wifi-empresarial', img: 'wifi' },
  { category: 'ingenieria', img: 'nave' },
]

/**
 * Explorador de soluciones de la portada. Pantalla dividida: a la izquierda el índice editorial (pestañas accesibles:
 * clic, teclado con flechas, y en escritorio también el cursor con una breve pausa); a la derecha, el escenario. Al
 * cambiar, la foto nueva entra por una máscara sobre la anterior, el titular entra palabra por palabra y el CTA
 * cotiza ese servicio con el tipo preseleccionado. En el teléfono, las pestañas se deslizan en horizontal.
 */
export function ServicesStage() {
  const { t, c } = useI18n()
  const [active, setActive] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const hoverTimer = useRef<number>()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const root = useReveal<HTMLElement>()

  const items = ITEMS.map((it) => {
    if ('slug' in it) {
      const s = c.serviceBySlug(it.slug)!
      return { key: it.slug, img: it.img, name: s.name, text: s.short, to: `/soluciones/${it.slug}`, quote: `/contacto?servicio=${it.slug}`, quoteLabel: t.servicesExplorer.quote(s.name) }
    }
    const cat = c.categoryById(it.category)
    return { key: it.category, img: it.img, name: cat.name, text: cat.lede, to: `/soluciones#${it.category}`, quote: `/contacto?tipo=${QUOTE_FOR[it.category]}`, quoteLabel: cat.cta }
  })
  const item = items[active]

  const select = (i: number, fromHover = false) => {
    // Un clic, el foco o el teclado mandan sobre una selección pendiente del cursor (si no, la pausa del hover
    // podría deshacer lo que se acaba de elegir).
    if (!fromHover) window.clearTimeout(hoverTimer.current)
    setActive((current) => {
      if (current !== i) setPrev(current)
      return i
    })
  }
  const onKey = (e: KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : delta ? (i + delta + items.length) % items.length : null
    if (to === null) return
    e.preventDefault()
    select(to)
    tabs.current[to]?.focus()
  }
  const hoverIn = (i: number, pointer: string) => {
    if (pointer !== 'mouse') return
    window.clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(() => select(i, true), 140)
  }

  return (
    <section ref={root} id="soluciones" aria-labelledby="soluciones-title" className="bg-mist py-20 md:py-28">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-5">
            <p data-reveal="rise" className="flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-corp">
              <span aria-hidden className="h-px w-8 bg-corp" />{t.servicesExplorer.listLabel}
            </p>
            <h2 id="soluciones-title" data-reveal="words" className="mt-5 text-h1"><SplitWords text={t.servicesExplorer.title} mode="view" /></h2>
            <p data-reveal="rise" className="mt-5 max-w-sm text-body">{t.servicesExplorer.lede}</p>

            <div role="tablist" aria-orientation="vertical" aria-label={t.servicesExplorer.listLabel} className="sv-tabs -mx-[var(--gutter)] mt-10 flex snap-x scroll-px-[var(--gutter)] gap-2 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none] lg:mx-0 lg:block lg:overflow-visible lg:border-t lg:border-line lg:px-0 lg:pb-0">
              {items.map((it, i) => {
                const on = i === active
                return (
                  <button
                    key={it.key}
                    ref={(el) => { tabs.current[i] = el }}
                    type="button"
                    role="tab"
                    id={`sv-tab-${i}`}
                    aria-selected={on}
                    aria-controls="sv-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(i)}
                    onFocus={() => select(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    onPointerEnter={(e) => hoverIn(i, e.pointerType)}
                    onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
                    className={cn(
                      'group relative shrink-0 snap-start text-left transition-colors',
                      'rounded-[2px] border px-4 py-2.5 text-small lg:flex lg:w-full lg:items-baseline lg:gap-5 lg:rounded-none lg:border-0 lg:border-b lg:border-line lg:px-0 lg:py-4',
                      on ? 'border-corp bg-corp text-white lg:bg-transparent lg:text-ink' : 'border-line bg-white text-body lg:bg-transparent lg:text-muted lg:hover:text-ink',
                    )}
                  >
                    <span aria-hidden className={cn('absolute -left-5 top-0 hidden h-full w-[2px] origin-top bg-corp transition-transform duration-500 ease-out lg:block', on ? 'scale-y-100' : 'scale-y-0')} />
                    <span className={cn('hidden font-mono text-[0.7rem] lg:inline', on ? 'text-corp' : 'text-faint')}>{String(i + 1).padStart(2, '0')}</span>
                    <span className="whitespace-nowrap lg:whitespace-normal lg:font-display lg:text-[1.3rem] lg:font-medium lg:leading-tight lg:tracking-[-0.01em]">{it.name}</span>
                    <ArrowRight aria-hidden className={cn('ml-auto hidden h-4 w-4 shrink-0 self-center transition-[opacity,transform] duration-300 lg:block', on ? 'translate-x-0 text-corp opacity-100' : '-translate-x-2 opacity-0')} strokeWidth={1.75} />
                  </button>
                )
              })}
            </div>
            <Link to="/soluciones" className="mt-8 hidden text-small font-medium text-corp link-line lg:inline-block">{t.servicesExplorer.index}</Link>
          </div>

          {/* Escenario */}
          <div className="min-w-0 lg:col-span-7">
            <div id="sv-panel" role="tabpanel" aria-labelledby={`sv-tab-${active}`} className="sv-stage relative aspect-[4/5] overflow-hidden bg-night sm:aspect-[4/3] lg:sticky lg:top-28 lg:aspect-auto lg:h-[min(680px,calc(100vh-9rem))]">
              {items.map((it, i) => {
                const img = IMG[it.img]
                const state = i === active ? 'is-current' : i === prev ? 'is-prev' : ''
                // En el teléfono sólo se descargan la foto activa y la anterior; en escritorio, todas (carga diferida).
                return (
                  <div key={it.key} aria-hidden={i !== active} className={cn('sv-layer', state, !state && 'max-lg:hidden')}>
                    <img src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 55vw, 100vw" alt={i === active ? img.alt : ''} loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: img.pos }} />
                  </div>
                )
              })}
              <div aria-hidden className="pointer-events-none absolute inset-0 z-[4] bg-[linear-gradient(0deg,rgb(5_13_24/0.9)_0%,rgb(5_13_24/0.55)_38%,transparent_70%)]" />
              <div className="absolute inset-x-0 bottom-0 z-[5] p-6 text-white md:p-10">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-lumen">{String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</p>
                <h3 key={item.key} className="mt-3 max-w-[18ch] text-[clamp(1.8rem,1.2rem+1.9vw,3rem)] font-semibold leading-[1.04] tracking-[-0.026em] !text-white">
                  <SplitWords text={item.name} />
                </h3>
                <p key={`${item.key}-t`} className="sv-fade mt-4 max-w-[30rem] text-white/75">{item.text}</p>
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Button to={item.quote} variant="light" track={`soluciones-${item.key}`} className="!px-5 !py-2.5 !text-[0.9rem]">{item.quoteLabel}</Button>
                  <Link to={item.to} className="group inline-flex items-center gap-2 text-small font-medium text-white">
                    <span className="link-line">{t.servicesExplorer.view}</span>
                    <ArrowRight aria-hidden className="arrow-nudge h-4 w-4 text-lumen" strokeWidth={1.75} />
                  </Link>
                </div>
              </div>
            </div>
            <Link to="/soluciones" className="mt-6 inline-block text-small font-medium text-corp link-line lg:hidden">{t.servicesExplorer.index}</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
