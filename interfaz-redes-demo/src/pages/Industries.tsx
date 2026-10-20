import { AnimatePresence, m, motion } from 'motion/react'
import { useRef, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FinalCTA } from '../components/home/Sections'
import { PageHero } from '../components/layout/PageHero'
import { Media } from '../components/plates'
import { Button } from '../components/ui'
import { INDUSTRIES, type Industry } from '../data/content'
import { serviceBySlug } from '../data/solutions'
import { cn, lowerFirst, useHydrated, useReducedMotion } from '../lib/utils'
import { useSeo } from '../lib/seo'
import { SEO } from '../data/seo'

const MATRIX = ['cableado-estructurado', 'fibra-optica', 'redes-empresariales', 'wifi-empresarial', 'racks-y-site', 'cctv-videovigilancia', 'control-de-acceso']

export default function Industries() {
  useSeo(SEO.industries)
  const [params, setParams] = useSearchParams()
  // El sector activo sale de ?sector= (enlace compartible); sin él, el primero. Mientras se hidrata el HTML
  // prerenderizado (que no conoce el parámetro) se usa el primero, y al terminar se cambia al pedido.
  const requested = useHydrated() ? params.get('sector') : null
  const active = INDUSTRIES.find((i) => i.id === requested)?.id ?? INDUSTRIES[0].id
  const reduce = useReducedMotion()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const ind = INDUSTRIES.find((i) => i.id === active)!
  const idx = INDUSTRIES.findIndex((i) => i.id === active)

  const select = (id: string) => setParams({ sector: id }, { replace: true })
  const onKey = (e: KeyboardEvent) => {
    const last = INDUSTRIES.length - 1
    const n = e.key === 'ArrowRight' ? (idx + 1) % INDUSTRIES.length
      : e.key === 'ArrowLeft' ? (idx + last) % INDUSTRIES.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : -1
    if (n < 0) return
    e.preventDefault()
    select(INDUSTRIES[n].id); tabs.current[n]?.focus()
  }

  return (
    <>
      <PageHero crumbs={[{ label: 'Industrias' }]} title="Soluciones por industria" lede="Una nave, un corporativo y un centro de distribución no se conectan ni se protegen igual. Así cambian las prioridades según el sector." />

      <section className="pb-24 md:pb-28">
        <div className="container">
          <div role="tablist" aria-label="Sectores" onKeyDown={onKey} className="flex overflow-x-auto border-b border-line">
            {INDUSTRIES.map((it, i) => (
              <button
                key={it.id}
                ref={(el) => { tabs.current[i] = el }}
                role="tab"
                id={`ind-tab-${it.id}`}
                aria-selected={it.id === active}
                aria-controls={`ind-panel-${it.id}`}
                tabIndex={it.id === active ? 0 : -1}
                onClick={() => select(it.id)}
                className={cn('relative shrink-0 whitespace-nowrap py-4 pr-8 text-[1rem] transition-colors focus-visible:outline-offset-[-3px]', it.id === active ? 'font-medium text-ink' : 'text-muted hover:text-ink')}
              >
                {it.name}
                {/* La línea que se desliza entre pestañas usa layoutId: motion completo (sólo en esta página). */}
                {it.id === active && <motion.span layoutId={reduce ? undefined : 'ind-line'} aria-hidden className="absolute bottom-[-1px] left-0 right-8 h-[2px] bg-corp" />}
              </button>
            ))}
          </div>

          <div ref={panelRef} role="tabpanel" id={`ind-panel-${ind.id}`} aria-labelledby={`ind-tab-${ind.id}`} className="mt-12">
            <AnimatePresence mode="wait" initial={false}>
              <m.div key={ind.id} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }} className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                <SectorPanel ind={ind} />
              </m.div>
            </AnimatePresence>
          </div>
          {/* Los demás sectores también van en el HTML, ocultos: así los buscadores leen los cinco. */}
          {INDUSTRIES.filter((it) => it.id !== active).map((it) => (
            <div key={it.id} role="tabpanel" id={`ind-panel-${it.id}`} aria-labelledby={`ind-tab-${it.id}`} hidden className="mt-12">
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-14"><SectorPanel ind={it} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-mist py-24 md:py-28">
        <div className="container">
          <h2 className="max-w-2xl text-h2">Qué servicios intervienen en cada sector</h2>
          <div className="mt-12 overflow-x-auto bg-white">
            <table className="w-full min-w-[820px] border-collapse text-[0.9rem]">
              <thead>
                <tr className="border-b border-ink/80">
                  <th scope="col" className="px-5 py-4 text-left text-small font-medium text-muted">Sector</th>
                  {MATRIX.map((m) => {
                    const sv = serviceBySlug(m)!
                    return (
                      <th key={m} scope="col" className="px-3 py-4 text-center align-bottom">
                        <Link to={`/soluciones/${m}`} className="block text-small font-medium leading-tight text-ink hover:text-corp">{sv.name.replace(' y videovigilancia', '').replace(' de telecomunicaciones', '')}</Link>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {INDUSTRIES.map((it) => (
                  <tr key={it.id} className={cn('border-b border-line last:border-0 transition-colors', it.id === active && 'bg-ice/60')}>
                    <th scope="row" className="px-5 py-4 text-left">
                      <button type="button" onClick={() => { select(it.id); panelRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }) }} className="font-display font-medium text-ink hover:text-corp">{it.name}</button>
                    </th>
                    {MATRIX.map((m) => (
                      <td key={m} className="px-3 py-4 text-center">
                        {it.services.includes(m)
                          ? <span className="inline-block h-2.5 w-2.5 rounded-full bg-corp" role="img" aria-label="Frecuente" />
                          : <span className="inline-block h-px w-3 bg-line align-middle" role="img" aria-label="Según proyecto" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-label text-muted">Punto: interviene con frecuencia. Guion: según el alcance de cada proyecto.</p>
        </div>
      </section>
      <FinalCTA />
    </>
  )
}

function SectorPanel({ ind }: { ind: Industry }) {
  return (
    <>
      <div className="lg:col-span-6"><Media img={ind.img} plate={ind.plate} ratio="aspect-[4/3]" /></div>
      <div className="lg:col-span-6">
        <h2 className="text-h2">{ind.name}</h2>
        <p className="mt-4 max-w-measure text-lead text-body">{ind.lede}</p>
        <div className="mt-9 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
          <div>
            <p className="text-small font-medium text-ink">Áreas que cubrimos</p>
            <ul className="mt-3 space-y-1.5 text-small text-body">{ind.areas.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
          <div>
            <p className="text-small font-medium text-ink">Retos frecuentes</p>
            <ul className="mt-3 space-y-1.5 text-small text-body">{ind.challenges.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
        </div>
        <p className="mt-10 text-small font-medium text-ink">Servicios que suelen intervenir</p>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {ind.services.map((slug) => {
            const sv = serviceBySlug(slug)!
            return (
              <li key={slug}>
                <Link to={`/soluciones/${slug}`} className="group flex items-center gap-4 py-3">
                  <span className="flex-1 text-body text-ink transition-colors group-hover:text-corp">{sv.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="mt-8"><Button to={`/contacto?sector=${ind.id}`} className="!whitespace-normal text-center">Cotizar para {lowerFirst(ind.name)}</Button></div>
      </div>
    </>
  )
}
