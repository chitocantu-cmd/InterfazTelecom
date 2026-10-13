import { useMemo } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { FinalCTA, ProjectMeta } from '../components/home/Sections'
import { Breadcrumbs, PageHero } from '../components/layout/PageHero'
import { Media } from '../components/plates'
import { Button, Chip, Reveal } from '../components/ui'
import { PROJECT_CATEGORIES, PROJECTS, projectBySlug } from '../data/content'
import { IMG } from '../data/media'
import { serviceBySlug } from '../data/solutions'
import { cn, waLink } from '../lib/utils'
import { useSeo } from '../lib/seo'

export function Projects() {
  useSeo('Proyectos', 'Tipos de proyecto de infraestructura que ejecuta Interfaz Redes: redes industriales, fibra óptica, CCTV, racks y sites, y redes corporativas.')
  const [params, setParams] = useSearchParams()
  const cat = params.get('categoria') ?? 'todas'
  const sector = params.get('sector') ?? 'todos'
  const sectors = useMemo(() => Array.from(new Set(PROJECTS.map((p) => p.sector))), [])
  const list = PROJECTS.filter((p) => (cat === 'todas' || p.category === cat) && (sector === 'todos' || p.sector === sector))

  const update = (k: string, v: string, all: string) => {
    const next = new URLSearchParams(params)
    if (v === all) next.delete(k); else next.set(k, v)
    setParams(next, { replace: true })
  }

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Proyectos' }]}
        title="Proyectos"
        lede="Tipos de intervención que ejecuta el equipo técnico: el problema, el alcance y las tecnologías de cada caso."
        aside={<p className="mt-4 text-small text-muted">Casos demostrativos: describen tipos de intervención, no proyectos de clientes específicos.</p>}
      />
      <section className="pb-28">
        <div className="container">
          <div className="flex flex-col gap-6 border-y border-line py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
              <Chip active={cat === 'todas'} onClick={() => update('categoria', 'todas', 'todas')} controls="lista-proyectos">Todas</Chip>
              {PROJECT_CATEGORIES.map((c) => <Chip key={c} active={cat === c} onClick={() => update('categoria', c, 'todas')} controls="lista-proyectos">{c}</Chip>)}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <label htmlFor="f-sector" className="text-small text-muted">Sector</label>
              <select id="f-sector" value={sector} onChange={(e) => update('sector', e.target.value, 'todos')} className="field !w-auto min-w-[10rem] sm:min-w-[12rem] !py-2.5">
                <option value="todos">Todos</option>
                {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <p className="tabular text-small text-muted" aria-live="polite">{list.length} {list.length === 1 ? 'caso' : 'casos'}</p>
            </div>
          </div>

          <div id="lista-proyectos" className="mt-16">
            {list.length === 0 ? (
              <div className="bg-mist p-12 text-center">
                <p className="font-display text-h4 text-ink">No hay casos con esa combinación de filtros.</p>
                <button type="button" onClick={() => setParams({}, { replace: true })} className="mt-3 text-small font-medium text-corp link-line">Quitar filtros</button>
              </div>
            ) : (
              <ul className="space-y-24 md:space-y-32">
                {list.map((p, i) => (
                  <Reveal as="li" key={p.slug}>
                    <Link to={`/proyectos/${p.slug}`} className="group grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-14">
                      <div className={cn('overflow-hidden lg:col-span-7', i % 2 === 1 && 'lg:order-2 lg:col-start-6')}>
                        <Media img={p.img} plate={p.plate} ratio="aspect-[3/2]" zoom />
                      </div>
                      <div className={cn('lg:col-span-4', i % 2 === 1 ? 'lg:order-1' : 'lg:col-start-9')}>
                        <ProjectMeta p={p} />
                        <h2 className="mt-3 font-display text-[clamp(1.6rem,1.25rem+1.1vw,2.2rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink transition-colors group-hover:text-corp">{p.title}</h2>
                        <p className="mt-4 text-body">{p.summary}</p>
                        <p className="mt-6 text-small text-muted">{p.technologies.join(' · ')}</p>
                        <span className="mt-7 inline-block text-small font-medium text-corp link-line">Ver el caso</span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
      <FinalCTA />
    </>
  )
}

export function ProjectDetail() {
  const { slug } = useParams()
  const p = projectBySlug(slug)
  useSeo(p ? p.title : 'Proyectos', p ? p.summary : '')
  if (!p) return <Navigate to="/proyectos" replace />
  const i = PROJECTS.findIndex((x) => x.slug === p.slug)
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length]
  const next = PROJECTS[(i + 1) % PROJECTS.length]
  const m = p.img ? IMG[p.img] : null

  return (
    <>
      <section className="bg-white">
        <div className="container pb-14 pt-10 md:pb-16 md:pt-12">
          <Breadcrumbs items={[{ to: '/proyectos', label: 'Proyectos' }, { label: p.title }]} />
          <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <ProjectMeta p={p} />
              <h1 className="mt-4 text-h1">{p.title}</h1>
            </div>
            <p className="max-w-measure text-lead text-body lg:col-span-4">{p.summary}</p>
          </div>
        </div>
        <div className="relative mx-auto h-[320px] max-w-frame overflow-hidden md:h-[480px] lg:h-[600px]">
          {m ? <img src={m.src} alt={m.alt} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: m.pos }} /> : <Media plate={p.plate} ratio="h-full w-full" />}
          {m?.ref && <p className="img-caption">Imagen de referencia, no corresponde a este caso</p>}
        </div>
      </section>

      <section className="py-24 md:py-28">
        <div className="container grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-h3">Contexto y problema técnico</h2>
            <p className="mt-5 font-display text-[clamp(1.25rem,1.1rem+0.6vw,1.6rem)] font-medium leading-snug tracking-[-0.012em] text-ink">{p.problem}</p>
            <h2 className="mt-16 text-h3">Alcance de la intervención</h2>
            <ul className="mt-6 border-t border-ink/80">
              {p.scope.map((s) => <li key={s} className="border-b border-line py-4 text-body text-ink">{s}</li>)}
            </ul>
            <div className="mt-12 bg-mist p-7">
              <p className="font-medium text-ink">Resultados documentados</p>
              <p className="mt-2 text-small text-body">Este espacio se completa con la documentación entregada al cliente (reportes de certificación, planos y fotografías) cuando el caso esté autorizado para publicarse.</p>
            </div>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-36">
              <dl className="border-t border-ink/80 text-small">
                {[['Sector', p.sector], ['Categoría', p.category], ['Estado', 'Caso demostrativo']].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-line py-3.5"><dt className="text-muted">{k}</dt><dd className="text-right font-medium text-ink">{v}</dd></div>
                ))}
              </dl>
              <p className="mt-10 text-small font-medium text-ink">Servicios implementados</p>
              <ul className="mt-3 space-y-2">
                {p.services.map((slug) => <li key={slug}><Link to={`/soluciones/${slug}`} className="text-small text-corp link-line">{serviceBySlug(slug)!.name}</Link></li>)}
              </ul>
              <p className="mt-10 text-small font-medium text-ink">Tecnologías</p>
              <p className="mt-2 text-small text-body">{p.technologies.join(', ')}</p>
              <div className="mt-10 flex flex-col gap-3">
                <Button to="/contacto">Cotizar un proyecto similar</Button>
                <Button href={waLink(`Hola, me interesa un proyecto similar a: ${p.title}.`)} variant="secondary">Escribir por WhatsApp</Button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <nav aria-label="Otros proyectos" className="border-t border-line">
        <div className="container grid gap-10 py-16 md:grid-cols-2">
          {[{ q: prev, dir: 'Caso anterior' }, { q: next, dir: 'Caso siguiente' }].map(({ q, dir }) => (
            <Link key={dir} to={`/proyectos/${q.slug}`} className={cn('group flex items-center gap-6', dir === 'Caso siguiente' && 'md:flex-row-reverse md:text-right')}>
              <div className="w-36 shrink-0 overflow-hidden"><Media img={q.img} plate={q.plate} ratio="aspect-[4/3]" zoom /></div>
              <span><span className="block text-small text-muted">{dir}</span><span className="mt-1 block font-display text-h4 font-medium text-ink transition-colors group-hover:text-corp">{q.title}</span></span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
