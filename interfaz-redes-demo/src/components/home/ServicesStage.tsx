import { ArrowRight } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
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

interface Item { key: string; img: ImgKey; name: string; text: string; to: string; quote: string; quoteLabel: string }

/** En el servidor useLayoutEffect no hace nada y avisa; ahí basta useEffect. */
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Teléfono: índice que se lee completo de un vistazo (los ocho nombres a la vista) y un solo toque abre la foto, la
 * descripción y la cotización de ese servicio. La fila tocada no se mueve de bajo el dedo: lo que se cierra arriba de
 * ella se compensa con el desplazamiento.
 */
function ServicesIndex({ items, view }: { items: Item[]; view: string }) {
  const [open, setOpen] = useState(0)
  const rows = useRef<(HTMLLIElement | null)[]>([])
  const anchor = useRef<{ i: number; top: number } | null>(null)
  const toggle = (i: number) => {
    const top = rows.current[i]?.getBoundingClientRect().top
    if (top !== undefined) anchor.current = { i, top }
    setOpen((current) => (current === i ? -1 : i))
  }
  useIsoLayoutEffect(() => {
    const a = anchor.current
    anchor.current = null
    const el = a && rows.current[a.i]
    if (!a || !el) return
    const shift = el.getBoundingClientRect().top - a.top
    if (shift) window.scrollBy({ top: shift, behavior: 'instant' })
  }, [open])

  return (
    <ul className="mt-8 border-t border-ink/80 md:hidden">
      {items.map((it, i) => {
        const on = i === open
        const img = IMG[it.img]
        return (
          <li key={it.key} ref={(el) => { rows.current[i] = el }} className="border-b border-ink/15">
            <h3>
              <button type="button" aria-expanded={on} aria-controls={`sv-m-${i}`} id={`sv-mb-${i}`} onClick={() => toggle(i)} className="flex min-h-[64px] w-full items-center justify-between gap-4 py-3 text-left font-display text-[1.28rem] font-medium leading-tight tracking-[-0.012em] text-ink">
                {it.name}
                <span aria-hidden className="m-sign" />
              </button>
            </h3>
            <div id={`sv-m-${i}`} role="region" aria-labelledby={`sv-mb-${i}`} className={cn('m-acc', on && 'is-open')}>
              <div {...(on ? {} : { inert: '' })}>
                <div className="pb-6">
                  {on && (
                    <div className="aspect-[16/10] overflow-hidden bg-night">
                      <img src={img.src} srcSet={img.srcSet} sizes="88vw" alt={img.alt} loading="lazy" decoding="async" className="m-acc-img h-full w-full object-cover" style={{ objectPosition: img.pos }} />
                    </div>
                  )}
                  <p className="mt-4 text-body">{it.text}</p>
                  <div className="mt-5 grid gap-1">
                    <Button to={it.quote} track={`soluciones-${it.key}`} className="w-full">{it.quoteLabel}</Button>
                    <Link to={it.to} className="group inline-flex min-h-[48px] items-center justify-center gap-2 font-medium text-corp">
                      <span className="link-line">{view}</span>
                      <ArrowRight aria-hidden className="arrow-nudge h-4 w-4" strokeWidth={1.75} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Explorador de soluciones de la portada. Pantalla dividida: a la izquierda el índice editorial (pestañas accesibles:
 * clic, teclado con flechas, y en escritorio también el cursor con una breve pausa); a la derecha, el escenario. Al
 * cambiar, la foto nueva entra por una máscara sobre la anterior, el titular entra palabra por palabra y el CTA
 * cotiza ese servicio con el tipo preseleccionado. Desde 768 px; en el teléfono, ServicesIndex.
 */
export function ServicesStage() {
  const { t, c } = useI18n()
  const [active, setActive] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const hoverTimer = useRef<number>()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const root = useReveal<HTMLElement>()

  const items: Item[] = ITEMS.map((it) => {
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
    <section ref={root} id="soluciones" aria-labelledby="soluciones-title" className="bg-mist py-sec md:py-28">
      <div className="container">
        <div className="grid gap-10 md:grid-cols-12 lg:gap-14">
          <div className="min-w-0 md:col-span-5">
            <p data-reveal="rise" className="flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-corp max-md:hidden">
              <span aria-hidden className="h-px w-8 bg-corp" />{t.servicesExplorer.listLabel}
            </p>
            <h2 id="soluciones-title" data-reveal="words" className="text-h1 md:mt-5"><SplitWords text={t.servicesExplorer.title} mode="view" /></h2>
            <p data-reveal="rise" className="mt-4 max-w-sm text-body md:mt-5">{t.servicesExplorer.lede}</p>

            <ServicesIndex items={items} view={t.servicesExplorer.view} />
            <Link to="/soluciones" className="group mt-6 inline-flex min-h-[44px] items-center gap-2 font-medium text-corp md:hidden">
              <span className="link-line">{t.servicesExplorer.index}</span>
              <ArrowRight aria-hidden className="arrow-nudge h-4 w-4" strokeWidth={1.75} />
            </Link>

            <div role="tablist" aria-orientation="vertical" aria-label={t.servicesExplorer.listLabel} className="sv-tabs mt-10 block border-t border-line max-md:hidden">
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
                      'group relative flex w-full items-baseline gap-5 border-b border-line py-4 text-left text-small transition-colors',
                      on ? 'text-ink' : 'text-muted hover:text-ink',
                    )}
                  >
                    <span aria-hidden className={cn('absolute -left-5 top-0 h-full w-[2px] origin-top bg-corp transition-transform duration-500 ease-out', on ? 'scale-y-100' : 'scale-y-0')} />
                    <span className={cn('font-mono text-[0.7rem]', on ? 'text-corp' : 'text-faint')}>{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-display text-[1.3rem] font-medium leading-tight tracking-[-0.01em]">{it.name}</span>
                    <ArrowRight aria-hidden className={cn('ml-auto h-4 w-4 shrink-0 self-center transition-[opacity,transform] duration-300', on ? 'translate-x-0 text-corp opacity-100' : '-translate-x-2 opacity-0')} strokeWidth={1.75} />
                  </button>
                )
              })}
            </div>
            <Link to="/soluciones" className="mt-8 inline-block text-small font-medium text-corp link-line max-md:hidden">{t.servicesExplorer.index}</Link>
          </div>

          {/* Escenario */}
          <div className="min-w-0 max-md:hidden md:col-span-7">
            <div id="sv-panel" role="tabpanel" aria-labelledby={`sv-tab-${active}`} className="sv-stage relative overflow-hidden bg-night md:sticky md:top-28 md:h-[min(680px,calc(100vh-9rem))]">
              {items.map((it, i) => {
                const img = IMG[it.img]
                const state = i === active ? 'is-current' : i === prev ? 'is-prev' : ''
                return (
                  <div key={it.key} aria-hidden={i !== active} className={cn('sv-layer', state)}>
                    <img src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 55vw, 60vw" alt={i === active ? img.alt : ''} loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: img.pos }} />
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
          </div>
        </div>
      </div>
    </section>
  )
}
