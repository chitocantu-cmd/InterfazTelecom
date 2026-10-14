import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { COMPANY } from '../../data/company'
import { INDUSTRIES, NEEDS, PROCESS, PROJECTS, type Project } from '../../data/content'
import { IMG, type ImgKey } from '../../data/media'
import { serviceBySlug } from '../../data/solutions'
import { cn, waLink } from '../../lib/utils'
import { Media } from '../plates'
import { Button, Reveal, SectionHead, TextLink } from '../ui'

/* ---------- Capacidad + razones ---------- */
const REASONS = [
  ['Ingeniería y ejecución', 'El mismo equipo que diseña responde por la instalación.'],
  ['Personal técnico en sitio', 'Ingenieros, arquitectos y técnicos que levantan, instalan y certifican.'],
  ['Proyectos a la medida', 'Cada red se diseña para su operación, su ambiente y su crecimiento.'],
  ['Mantenimiento y soporte', 'Preventivo y correctivo para que la infraestructura siga disponible.'],
]

export function Intro() {
  return (
    <section className="py-24 md:py-32" aria-labelledby="intro-title">
      <div className="container grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 id="intro-title" className="font-display text-[clamp(1.7rem,1.2rem+1.9vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.02em] text-ink">
            Diseñamos, instalamos, configuramos y mantenemos la infraestructura tecnológica de plantas industriales, corporativos y centros de distribución.
          </h2>
          <p className="mt-8 max-w-measure text-body">
            Desde la canalización y el cableado hasta el equipo activo, la videovigilancia y el soporte posterior. Un solo responsable técnico, de la visita de levantamiento a la entrega documentada.
          </p>
          <TextLink to="/nosotros" className="mt-8">Conozca a Interfaz Redes</TextLink>
        </div>
        <dl className="lg:col-span-4 lg:col-start-9">
          {REASONS.map(([k, v]) => (
            <div key={k} className="border-t border-line py-5 first:border-t-0 first:pt-0 lg:first:pt-2">
              <dt className="font-display text-h4 font-semibold text-ink">{k}</dt>
              <dd className="mt-1 text-small text-body">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="container mt-20">
        <dl className="grid gap-y-8 border-t border-ink/80 pt-8 sm:grid-cols-3">
          {[
            [COMPANY.years, 'años desarrollando proyectos de redes y telecomunicaciones'],
            ['REPSE', 'registro ante la STPS para servicios especializados'],
            ['Monterrey', 'base de operaciones en la Col. Industrial'],
          ].map(([v, d]) => (
            <div key={v} className="sm:pr-10">
              <dt className="font-display text-[2.6rem] font-medium leading-none tracking-[-0.03em] text-corp">{v}</dt>
              <dd className="mt-3 max-w-[16rem] text-small text-body">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ---------- Equipo en campo (fotografía real) ---------- */
export function FieldGallery({ items, lede, className }: { items: { img: ImgKey; caption: string }[]; lede: string; className?: string }) {
  return (
    <section className={cn('pb-24 md:pb-32', className)} aria-labelledby="campo-title">
      <div className="container">
        <SectionHead id="campo-title" title="Nuestro equipo en campo" lede={lede} />
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
          {items.map(({ img, caption }, i) => (
            <li key={img} className={cn(i % 2 === 1 && 'lg:mt-14')}>
              <figure>
                <div className="aspect-[3/4] overflow-hidden bg-mist">
                  <img src={IMG[img].src} srcSet={IMG[img].srcSet} sizes="(min-width: 1024px) 25vw, 50vw" alt={IMG[img].alt} loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: IMG[img].pos }} />
                </div>
                <figcaption className="mt-3 text-small text-body">{caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------- Proyectos ---------- */
export function ProjectMeta({ p, className }: { p: Project; className?: string }) {
  return <p className={cn('text-label text-muted', className)}>{p.sector} · {p.category} · Caso demostrativo</p>
}

export function FeaturedProjects() {
  const [a, b, c] = [PROJECTS[0], PROJECTS[2], PROJECTS[3]]
  return (
    <section className="py-24 md:py-32" aria-labelledby="proyectos-title">
      <div className="container">
        <SectionHead
          id="proyectos-title"
          title="Tipos de proyecto que ejecutamos"
          lede="Casos demostrativos con el alcance técnico de cada tipo de intervención; no corresponden a proyectos de clientes específicos."
        />
        <Reveal className="mt-14">
          <Link to={`/proyectos/${a.slug}`} className="group grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="overflow-hidden lg:col-span-8"><Media img={a.img} plate={a.plate} ratio="aspect-[16/10]" zoom pos="74% 50%" sizes="(min-width: 1024px) 66vw, 100vw" /></div>
            <div className="lg:col-span-4 lg:pb-2">
              <ProjectMeta p={a} />
              <h3 className="mt-3 text-h2 transition-colors group-hover:text-corp">{a.title}</h3>
              <p className="mt-4 text-body">{a.summary}</p>
              <span className="mt-6 inline-block text-small font-medium text-corp link-line">Ver el caso</span>
            </div>
          </Link>
        </Reveal>
        <div className="mt-20 grid gap-16 md:grid-cols-2 md:gap-10">
          {[b, c].map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06} className={i === 1 ? 'md:mt-24' : ''}>
              <Link to={`/proyectos/${p.slug}`} className="group block">
                <div className="overflow-hidden"><Media img={p.img} plate={p.plate} ratio="aspect-[4/3]" zoom sizes="(min-width: 768px) 50vw, 100vw" /></div>
                <ProjectMeta p={p} className="mt-6" />
                <h3 className="mt-2 text-h3 transition-colors group-hover:text-corp">{p.title}</h3>
                <p className="mt-2 max-w-measure text-small text-body">{p.summary}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-16"><TextLink to="/proyectos">Ver todos los proyectos</TextLink></div>
      </div>
    </section>
  )
}

/* ---------- Necesidades (sección azul marino) ---------- */
export function NeedsExplorer() {
  const [id, setId] = useState(NEEDS[0].id)
  const reduce = useReducedMotion()
  const need = NEEDS.find((n) => n.id === id)!

  const Result = ({ inline }: { inline?: boolean }) => (
    <div className={cn('bg-white text-body', inline ? 'mt-2 p-6' : 'p-9')}>
      <p className="text-lead text-ink">{need.answer}</p>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-small font-medium text-ink">Servicios que intervienen</p>
          <ul className="mt-3 space-y-2">
            {need.services.map((slug) => {
              const sv = serviceBySlug(slug)!
              return <li key={slug}><Link to={`/soluciones/${slug}`} className="text-small text-corp link-line">{sv.name}</Link></li>
            })}
          </ul>
        </div>
        <div>
          <p className="text-small font-medium text-ink">Para cotizar, tenga a la mano</p>
          <ul className="mt-3 space-y-2 text-small">
            {need.prepare.map((x) => <li key={x} className="flex gap-2.5"><span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-corp" />{x}</li>)}
          </ul>
        </div>
      </div>
      <div className="mt-9 border-t border-line pt-6"><Button to={`/contacto?tipo=${need.quoteType}&necesidad=${need.id}`}>Cotizar con esta necesidad</Button></div>
    </div>
  )

  return (
    <section className="bg-navy py-24 text-white md:py-32" aria-labelledby="necesidades-title">
      <div className="container">
        <SectionHead dark id="necesidades-title" title="¿Qué necesita tu infraestructura?" lede="Elija la situación más parecida a su proyecto. Le mostramos qué servicios suelen intervenir y qué información conviene reunir antes de cotizar." />
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <fieldset className="lg:col-span-5">
            <legend className="sr-only">Necesidad del proyecto</legend>
            <div className="border-t border-white/15">
              {NEEDS.map((n) => {
                const on = n.id === id
                return (
                  <div key={n.id} className="border-b border-white/15">
                    <label className="group flex cursor-pointer items-start gap-4 py-5">
                      <input type="radio" name="necesidad" value={n.id} checked={on} onChange={() => setId(n.id)} className="peer sr-only" />
                      <span aria-hidden className={cn('mt-[0.45rem] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-lumen peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-navy', on ? 'border-white' : 'border-white/35')}>
                        <span className={cn('h-2 w-2 rounded-full', on ? 'bg-white' : 'bg-transparent')} />
                      </span>
                      <span>
                        <span className={cn('block font-display text-[1.2rem] font-medium leading-snug transition-colors', on ? 'text-white' : 'text-white/60 group-hover:text-white/85')}>{n.label}</span>
                        <span className={cn('mt-0.5 block text-small', on ? 'text-white/70' : 'text-white/55')}>{n.context}</span>
                      </span>
                    </label>
                    {on && <div className="pb-6 lg:hidden"><Result inline /></div>}
                  </div>
                )
              })}
            </div>
          </fieldset>
          <div className="hidden lg:col-span-6 lg:col-start-7 lg:block" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={need.id} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Result />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Industrias ---------- */
export function IndustriesIndex() {
  const [hover, setHover] = useState(INDUSTRIES[0].id)
  const ind = INDUSTRIES.find((i) => i.id === hover)!
  return (
    <section className="py-24 md:py-32" aria-labelledby="industrias-title">
      <div className="container grid gap-14 lg:grid-cols-12">
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-36">
            <Media img={ind.img} plate={ind.plate} ratio="aspect-[4/5] max-h-[620px] w-full" sizes="40vw" />
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <h2 id="industrias-title" className="text-h2">Industrias</h2>
          <p className="mt-4 max-w-measure text-body">Una nave, un corporativo y un centro de distribución no se conectan ni se protegen igual.</p>
          <ul className="mt-10 border-t border-line">
            {INDUSTRIES.map((it) => (
              <li key={it.id} className="border-b border-line">
                <Link to={`/industrias?sector=${it.id}`} onMouseEnter={() => setHover(it.id)} onFocus={() => setHover(it.id)} className="group block py-6">
                  <span className={cn('block font-display text-[1.55rem] font-medium tracking-[-0.015em] transition-colors', hover === it.id ? 'text-corp' : 'text-ink')}>{it.name}</span>
                  <span className="mt-1.5 block text-small text-muted">{it.lede}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------- Proceso ---------- */
export function ProcessLine({ tone = 'mist' }: { tone?: 'mist' | 'white' }) {
  return (
    <section className={cn('py-24 md:py-32', tone === 'mist' ? 'bg-mist' : 'bg-white')} aria-labelledby="proceso-title">
      <div className="container">
        <SectionHead id="proceso-title" title="Cómo trabajamos" lede="Seis etapas, cada una con un entregable concreto. Nada se cotiza antes de estar diseñado." />
        <ol className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESS.map((p) => (
            <li key={p.n} className="border-t border-ink/80 pt-6">
              <span className="font-display text-[1.05rem] font-medium text-corp tabular">{p.n}</span>
              <h3 className="mt-3 text-h4">{p.title}</h3>
              <p className="mt-2 text-small text-body">{p.detail}</p>
              <p className="mt-4 text-label text-muted">Entregable: {p.output.split(' · ').map((x, i) => (i === 0 ? x.charAt(0).toLowerCase() + x.slice(1) : x.charAt(0).toLowerCase() + x.slice(1))).join(', ').replace('otdr', 'OTDR')}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- Llamado final ---------- */
export function FinalCTA() {
  return (
    <section className="relative bg-white" aria-labelledby="cta-title">
      <div className="relative mx-auto h-[420px] max-w-frame overflow-hidden md:h-[560px]">
        <img src={IMG.aisleWide.src} srcSet={IMG.aisleWide.srcSet} sizes="(min-width: 1600px) 1600px, 100vw" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 42%' }} />
      </div>
      <div className="container relative -mt-40 pb-24 md:-mt-48 md:pb-32">
        <div className="max-w-3xl bg-white px-0 pt-10 md:px-14 md:pt-14">
          <h2 id="cta-title" className="text-h1">Solicite un levantamiento técnico.</h2>
          <p className="mt-6 max-w-measure text-lead text-body">Cuéntenos qué necesita. Un especialista revisa la información, confirma el alcance y agenda la visita en sitio.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button to="/contacto">Solicitar cotización</Button>
            <Button href={waLink('Hola, quiero solicitar un levantamiento técnico con Interfaz Redes.')} variant="secondary">WhatsApp {COMPANY.whatsappDisplay}</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
