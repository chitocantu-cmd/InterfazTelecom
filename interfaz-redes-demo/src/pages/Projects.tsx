import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { FinalCTA, ProjectMeta } from '../components/home/Sections'
import { Breadcrumbs, PageHero } from '../components/layout/PageHero'
import { Media } from '../components/plates'
import { BeforeAfter } from '../components/projects/BeforeAfter'
import { Gallery } from '../components/projects/Gallery'
import { Button, Chip, Reveal, Tag } from '../components/ui'
import { familiesOf, isIndexable, PROJECT_FAMILIES, type ProjectFamily } from '../data/content'
import { IMG } from '../data/media'
import { projectSeo } from '../data/seo'
import { useI18n } from '../i18n'
import { Link, Navigate } from '../i18n/Link'
import { track } from '../lib/analytics'
import { cn, useHydrated, waLink } from '../lib/utils'
import { useSeo } from '../lib/seo'
import { SplitWords } from '../motion/primitives'

export function Projects() {
  const { t, c } = useI18n()
  const T = t.projects
  useSeo(t.seo.projects)
  const [params, setParams] = useSearchParams()
  // Los filtros de la URL se aplican al terminar de hidratar (el HTML prerenderizado muestra todos los casos).
  const hydrated = useHydrated()
  const fam = ((hydrated && params.get('tipo')) || 'todas') as ProjectFamily | 'todas'
  const sector = (hydrated && params.get('industria')) || 'todas'
  const industries = useMemo(() => c.industries.filter((i) => c.projects.some((p) => p.industry === i.id)), [c])
  const matches = (f: ProjectFamily | 'todas', s: string) => c.projects.filter((p) => (f === 'todas' || familiesOf(p).includes(f)) && (s === 'todas' || p.industry === s))
  const list = matches(fam, sector)

  const update = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v === 'todas') next.delete(k); else next.set(k, v)
    setParams(next, { replace: true })
  }

  return (
    <>
      <PageHero crumbs={[{ label: t.nav.projects }]} title={T.title} lede={T.lede} />
      <section className="pb-sec md:pb-28">
        <div className="container">
          <div className="flex flex-col gap-4 md:gap-6 md:border-y md:border-line md:py-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Teléfono: los filtros se deslizan en una sola fila. */}
            <div className="m-rail flex flex-wrap gap-2 [--card:auto] [--rail-gap:0.5rem]" role="group" aria-label={T.filterLabel}>
              <Chip active={fam === 'todas'} onClick={() => update('tipo', 'todas')} controls="lista-proyectos" count={matches('todas', sector).length}>{T.all}</Chip>
              {PROJECT_FAMILIES.map((f) => <Chip key={f} active={fam === f} onClick={() => update('tipo', f)} controls="lista-proyectos" count={matches(f, sector).length}>{T.families[f]}</Chip>)}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-1 md:flex md:flex-wrap md:gap-y-3">
              <label htmlFor="f-industria" className="text-small text-muted max-md:sr-only">{T.sector}</label>
              <select id="f-industria" value={sector} onChange={(e) => update('industria', e.target.value)} className="field min-w-[10rem] !py-2.5 md:!w-auto sm:min-w-[14rem]">
                <option value="todas">{T.allSectors}</option>
                {industries.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <p className="tabular text-small text-muted" aria-live="polite">{T.count(list.length)}</p>
            </div>
          </div>

          <div id="lista-proyectos" className="mt-10 md:mt-16">
            {list.length === 0 ? (
              <div className="bg-mist p-12 text-center">
                <p className="font-display text-h4 text-ink">{T.empty}</p>
                <button type="button" onClick={() => setParams({}, { replace: true })} className="mt-3 text-small font-medium text-corp link-line">{T.clear}</button>
              </div>
            ) : (
              <ul className="space-y-12 md:space-y-32">
                {list.map((p, i) => (
                  <Reveal as="li" key={p.slug}>
                    <Link to={`/proyectos/${p.slug}`} className="group grid gap-5 md:gap-8 lg:grid-cols-12 lg:items-center lg:gap-14">
                      <div className={cn('overflow-hidden lg:col-span-7', i % 2 === 1 && 'lg:order-2 lg:col-start-6')}>
                        <Media img={p.img} plate={p.plate} ratio="aspect-[3/2]" className="m-cv" zoom sizes="(min-width: 1024px) 58vw, 100vw" />
                      </div>
                      <div className={cn('lg:col-span-4', i % 2 === 1 ? 'lg:order-1' : 'lg:col-start-9')}>
                        <ProjectMeta p={p} />
                        <h2 className="mt-3 font-display text-[clamp(1.6rem,1.25rem+1.1vw,2.2rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink transition-colors group-hover:text-corp">{p.title}</h2>
                        <p className="mt-3 text-body md:mt-4">{p.summary}</p>
                        <p className="mt-4 text-small text-muted md:mt-6">{p.technologies.join(' · ')}</p>
                        <span className="mt-4 inline-flex items-center gap-2 text-small font-medium text-corp max-md:min-h-[44px] md:mt-7"><span className="link-line">{t.common.viewCase}</span><ArrowRight aria-hidden className="arrow-nudge h-4 w-4" strokeWidth={1.75} /></span>
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
  const { t, c } = useI18n()
  const T = t.project
  const p = c.projectBySlug(slug)
  useSeo(p ? projectSeo(p) : t.seo.projects, { noindex: p ? !isIndexable(p) : false })
  useEffect(() => { if (p) track('project_view', { proyecto: p.slug, estado: p.status }) }, [p])
  if (!p) return <><Navigate to="/proyectos" replace /><div className="min-h-[100svh]" /></>
  const i = c.projects.findIndex((x) => x.slug === p.slug)
  const prev = c.projects[(i - 1 + c.projects.length) % c.projects.length]
  const next = c.projects[(i + 1) % c.projects.length]
  const m = p.img ? IMG[p.img] : null
  const industry = c.industryById(p.industry)
  // Los tipos de proyecto (estado «demostrativo») no llevan rótulo: se presentan como lo que son, el alcance de un tipo
  // de intervención, sin cliente, fecha ni resultados. Sólo los proyectos autorizados muestran esos datos.
  const authorized = p.status === 'autorizado'
  const meta: [string, string][] = [
    [T.sector, industry?.name ?? ''],
    ...(p.client ? [[T.client, p.client] as [string, string]] : []),
    ...(p.location ? [[T.location, p.location] as [string, string]] : []),
    ...(p.year ? [[T.year, String(p.year)] as [string, string]] : []),
    ...(authorized ? [[T.status, T.authorized] as [string, string]] : []),
  ]

  return (
    <>
      <section className="bg-white">
        <div className="container pb-9 pt-5 md:pb-16 md:pt-12">
          <Breadcrumbs items={[{ to: '/proyectos', label: t.nav.projects }, { label: p.title }]} />
          <div className="mt-6 grid gap-5 md:mt-16 md:gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <ProjectMeta p={p} />
              <h1 className="mt-4 text-h1"><SplitWords text={p.title} delay={60} /></h1>
            </div>
            <p className="max-w-measure text-lead text-body lg:col-span-4">{p.summary}</p>
          </div>
        </div>
        <div className="relative mx-auto h-[320px] max-w-frame overflow-hidden md:h-[480px] lg:h-[600px]">
          {m ? <img src={m.src} srcSet={m.srcSet} sizes="(min-width: 1600px) 1600px, 100vw" alt={m.alt} className="enter-reveal absolute inset-0 h-full w-full object-cover" style={{ objectPosition: m.pos }} {...{ fetchpriority: 'high' }} /> : <Media plate={p.plate} ratio="h-full w-full" />}
        </div>
      </section>

      <section className="py-sec md:py-28">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="text-h3">{T.context}</h2>
            <p className="mt-5 font-display text-[clamp(1.25rem,1.1rem+0.6vw,1.6rem)] font-medium leading-snug tracking-[-0.012em] text-ink">{p.problem}</p>
            <h2 className="mt-10 text-h3 md:mt-16">{T.scope}</h2>
            <ul className="mt-6 border-t border-ink/80">
              {p.scope.map((s) => <li key={s} className="border-b border-line py-4 text-body text-ink">{s}</li>)}
            </ul>
            {p.results?.length ? (
              <div className="mt-12">
                <h2 className="text-h3">{T.results}</h2>
                <ul className="mt-6 space-y-3">{p.results.map((r) => <li key={r} className="flex gap-4 text-body"><span aria-hidden className="mt-[0.8em] h-px w-4 shrink-0 bg-corp" />{r}</li>)}</ul>
              </div>
            ) : null}
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-36">
              <dl className="border-t border-ink/80 text-small">
                {meta.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-line py-3.5"><dt className="text-muted">{k}</dt><dd className="text-right font-medium text-ink">{v}</dd></div>
                ))}
              </dl>
              <p className="mt-10 text-small font-medium text-ink">{T.services}</p>
              <ul className="mt-3 space-y-2">
                {p.services.map((slug) => <li key={slug}><Link to={`/soluciones/${slug}`} className="text-small text-corp link-line">{c.serviceBySlug(slug)!.name}</Link></li>)}
              </ul>
              <p className="mt-10 text-small font-medium text-ink">{T.technologies}</p>
              <p className="mt-2 text-small text-body">{p.technologies.join(', ')}</p>
              <div className="mt-10 flex flex-col gap-3">
                <Button to="/contacto" track={`proyecto-${p.slug}`}>{T.similar}</Button>
                <Button href={waLink(t.wa.project(p.title))} variant="secondary">{t.common.writeWhatsapp}</Button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {p.beforeAfter && (
        <section className="border-t border-line py-sec md:py-28">
          <div className="container grid gap-10 lg:grid-cols-12">
            <h2 className="text-h3 lg:col-span-3">{T.beforeAfter}</h2>
            <div className="lg:col-span-9"><BeforeAfter {...p.beforeAfter} /></div>
          </div>
        </section>
      )}

      {p.gallery?.length ? (
        <section className="border-t border-line py-sec md:py-28">
          <div className="container">
            <Tag>{p.code}</Tag>
            <h2 className="mt-2 text-h3">{T.gallery}</h2>
            <div className="mt-10"><Gallery items={p.gallery} /></div>
          </div>
        </section>
      ) : null}

      <nav aria-label={T.others} className="border-t border-line">
        <div className="container grid gap-5 py-10 md:grid-cols-2 md:gap-10 md:py-16">
          {[{ q: prev, dir: T.prev, end: false }, { q: next, dir: T.next, end: true }].map(({ q, dir, end }) => (
            <Link key={dir} to={`/proyectos/${q.slug}`} className={cn('group flex items-center gap-4 md:gap-6', end && 'md:flex-row-reverse md:text-right')}>
              <div className="w-24 shrink-0 overflow-hidden md:w-36"><Media img={q.img} plate={q.plate} ratio="aspect-[4/3]" zoom sizes="144px" /></div>
              <span><span className="block text-small text-muted">{dir}</span><span className="mt-1 block font-display text-h4 font-medium text-ink transition-colors group-hover:text-corp">{q.title}</span></span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
