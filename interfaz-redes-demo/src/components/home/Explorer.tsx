import { AnimatePresence, m } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { QuoteType } from '../../data/quote-types'
import type { Category, CategoryId } from '../../data/solutions'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { cn, useReducedMotion } from '../../lib/utils'
import { Media } from '../plates'
import { Button, Tag } from '../ui'

/** Tipo del cotizador que corresponde a cada frente (el CTA de cada panel llega con él preseleccionado). */
export const QUOTE_FOR: Record<CategoryId, QuoteType> = { infraestructura: 'cableado', fibra: 'fibra', seguridad: 'cctv', conectividad: 'infra', ingenieria: 'otro' }

function Panel({ cat, inline }: { cat: Category; inline?: boolean }) {
  const { t, c } = useI18n()
  const services = c.servicesOf(cat.id)
  return (
    <div>
      <Media img={cat.img} plate={cat.plate} ratio="aspect-[3/2]" sizes="(min-width: 1024px) 60vw, 100vw" />
      <div className="mt-8 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-5">
          {!inline && <><Tag>{cat.code} · {t.servicesExplorer.servicesCount(services.length)}</Tag><h3 className="mt-2 text-h3">{cat.name}</h3></>}
          <p className={cn('text-small text-body', !inline && 'mt-3')}>{cat.technical}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button to={`/contacto?tipo=${QUOTE_FOR[cat.id]}`} track={`explorador-${cat.id}`} className="!px-5 !py-2.5 !text-[0.9rem]">{cat.cta}</Button>
            <Link to={`/soluciones#${cat.id}`} className="text-small font-medium text-corp link-line">{t.servicesExplorer.seeCategory(cat.name)}</Link>
          </div>
        </div>
        <ul className="border-t border-line md:col-span-7">
          {services.map((s) => (
            <li key={s.slug} className="border-b border-line">
              <Link to={`/soluciones/${s.slug}`} className="group flex items-start justify-between gap-4 py-4">
                <span>
                  <span className="block font-display text-[1.1rem] font-medium text-ink transition-colors group-hover:text-corp">{s.name}</span>
                  <span className="mt-0.5 block text-small text-muted">{s.short}</span>
                </span>
                <ArrowRight aria-hidden className="arrow-nudge mt-1.5 h-4 w-4 shrink-0 text-faint group-hover:text-corp" strokeWidth={1.75} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * Explorador de frentes técnicos de la portada. En escritorio, la lista de la izquierda cambia el panel de la derecha
 * (imagen, descripción, servicios y un CTA con el tipo de cotización preseleccionado); en el teléfono funciona como
 * acordeón.
 */
export function Explorer() {
  const { t, c } = useI18n()
  const [active, setActive] = useState(c.categories[0].id)
  const reduce = useReducedMotion()
  const cat = c.categoryById(active)

  return (
    <section id="soluciones" className="bg-mist py-20 md:py-28" aria-labelledby="soluciones-title">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 id="soluciones-title" className="text-h2">{t.servicesExplorer.title}</h2>
            <p className="mt-4 max-w-sm text-body">{t.servicesExplorer.lede}</p>

            <ul className="mt-10 border-t border-line" aria-label={t.servicesExplorer.listLabel}>
              {c.categories.map((ct, i) => {
                const on = ct.id === active
                return (
                  <li key={ct.id} className="relative border-b border-line">
                    {/* Indicador del frente seleccionado (crece al elegirlo, en escritorio). */}
                    <span aria-hidden className={cn('absolute -left-4 top-5 hidden h-[calc(100%-2.5rem)] w-[2px] origin-top bg-corp transition-transform duration-300 ease-out lg:block', on ? 'scale-y-100' : 'scale-y-0')} />
                    <button type="button" aria-expanded={on} onClick={() => setActive(ct.id)} className="group w-full py-5 text-left">
                      <span className="mono-tag text-muted">{String(i + 1).padStart(2, '0')}</span>
                      <span className={cn('mt-1 block font-display text-[1.45rem] font-medium leading-tight tracking-[-0.015em] transition-colors', on ? 'text-ink' : 'text-muted group-hover:text-ink')}>{ct.name}</span>
                      <span className={cn('mt-1 block text-small transition-colors', on ? 'text-body' : 'text-muted')}>{ct.lede}</span>
                    </button>
                    {on && <div className="pb-10 lg:hidden"><Panel cat={ct} inline /></div>}
                  </li>
                )
              })}
            </ul>
            <Link to="/soluciones" className="mt-8 hidden text-small font-medium text-corp link-line lg:inline-block">{t.servicesExplorer.index}</Link>
          </div>

          <div className="hidden lg:col-span-8 lg:block" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={cat.id}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <Panel cat={cat} />
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
