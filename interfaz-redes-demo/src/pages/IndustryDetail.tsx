import { ArrowRight, Minus, Plus } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/layout/PageHero'
import { Media } from '../components/plates'
import { Button, Reveal, Tag } from '../components/ui'
import { industryById as baseIndustry } from '../data/content'
import { IMG } from '../data/media'
import { industrySeo } from '../data/seo'
import { useI18n } from '../i18n'
import { Link, Navigate } from '../i18n/Link'
import { scrollToId, waLink } from '../lib/utils'
import { useSeo } from '../lib/seo'

const QuoteWizard = lazy(() => import('../components/quote/QuoteWizard').then((m) => ({ default: m.QuoteWizard })))

/** Página de un sector: necesidades, soluciones, consideraciones técnicas, implementación y asesoría con el sector preseleccionado. */
export default function IndustryDetail() {
  const { id } = useParams()
  const { t, c } = useI18n()
  const ind = c.industryById(id)
  useSeo(ind ? industrySeo(ind, t) : t.seo.industries)
  if (!ind) return <><Navigate to="/industrias" replace /><div className="min-h-[100svh]" /></>
  const T = t.industry
  const img = ind.img ? IMG[ind.img] : null
  const services = ind.services.map((slug) => c.serviceBySlug(slug)).filter((s): s is NonNullable<typeof s> => Boolean(s))
  const others = c.industries.filter((x) => x.id !== ind.id)

  return (
    <>
      <section className="relative mx-auto flex max-w-frame flex-col overflow-hidden bg-white lg:block">
        <div className="container relative order-1">
          <div className="flex flex-col pb-14 pt-10 lg:min-h-[600px] lg:w-[46%] lg:pb-20">
            <Breadcrumbs items={[{ to: '/industrias', label: t.nav.industries }, { label: ind.name }]} />
            <div className="mt-14 lg:my-auto lg:pt-10">
              <p className="mb-3 text-small font-medium text-corp">{t.nav.industries}</p>
              <h1 className="text-h1">{ind.name}</h1>
              <p className="mt-6 max-w-measure text-lead text-body">{ind.intro}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button onClick={() => scrollToId('asesoria')} track={`industria-${ind.id}`}>{T.advice}</Button>
                <Button href={waLink(t.wa.industry(ind.name))} variant="secondary">{t.common.writeWhatsapp}</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="relative order-2 aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[48%]">
          {img ? (
            <>
              <img src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 48vw, 100vw" alt={img.alt} className="enter-reveal absolute inset-0 h-full w-full object-cover" style={{ objectPosition: img.pos }} {...{ fetchpriority: 'high' }} />
              {img.ref && <p className="img-caption">{t.common.referenceImage}</p>}
            </>
          ) : <div className="absolute inset-0"><Media plate={ind.plate} ratio="h-full w-full" /></div>}
        </div>
      </section>

      {/* necesidades habituales */}
      <section className="border-t border-line py-24 md:py-28" aria-labelledby="necesidades">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="necesidades" className="text-h2">{T.needs}</h2>
            <p className="mt-5 text-small text-muted">{t.industries.disclaimer}</p>
          </div>
          <div className="grid gap-12 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            <div>
              <p className="text-small font-medium text-ink">{T.challenges}</p>
              <ul className="mt-4 border-t border-ink/80">
                {ind.challenges.map((x) => <li key={x} className="border-b border-line py-4 text-body text-ink">{x}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-small font-medium text-ink">{T.areas}</p>
              <ul className="mt-4 border-t border-ink/80">
                {ind.areas.map((x) => <li key={x} className="border-b border-line py-4 text-body">{x}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* soluciones aplicables */}
      <section className="bg-mist py-24 md:py-28" aria-labelledby="soluciones-sector">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="soluciones-sector" className="text-h2 lg:col-span-6">{T.solutions}</h2>
            <p className="max-w-measure text-body lg:col-span-5 lg:col-start-8 lg:self-end">{T.solutionsLede}</p>
          </div>
          <ul className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug} className="bg-white">
                <Link to={`/soluciones/${s.slug}`} className="group flex h-full flex-col p-6">
                  <Tag>{s.code}</Tag>
                  <span className="mt-2 flex items-start justify-between gap-4 font-display text-[1.2rem] font-medium leading-snug text-ink transition-colors group-hover:text-corp">
                    {s.name}
                    <ArrowRight aria-hidden className="arrow-nudge mt-1 h-4 w-4 shrink-0 text-faint group-hover:text-corp" strokeWidth={1.75} />
                  </span>
                  <span className="mt-2 text-small text-body">{s.short}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* consideraciones técnicas */}
      <section className="bg-navy py-24 text-white md:py-28" aria-labelledby="consideraciones">
        <div className="container grid gap-12 lg:grid-cols-12">
          <h2 id="consideraciones" className="text-h2 !text-white lg:col-span-4">{T.considerations}</h2>
          <ol className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:col-span-8">
            {ind.considerations.map((x, i) => (
              <Reveal as="li" key={x.title} delay={i * 0.05} className="border-t border-white/20 pt-6">
                <span className="font-mono text-[0.75rem] text-white/55">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 text-h4 !text-white">{x.title}</h3>
                <p className="mt-2 text-small text-white/70">{x.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* cómo implementamos */}
      <section className="py-24 md:py-28">
        <div className="container">
          <h2 className="text-h2">{T.process}</h2>
          <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {ind.process.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.05} className="border-t border-ink/80 pt-6">
                <span className="font-display font-medium text-corp tabular">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-h4">{p.title}</h3>
                <p className="mt-2 text-small text-body">{p.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* preguntas frecuentes */}
      <section className="border-t border-line py-24 md:py-28">
        <div className="container grid gap-12 lg:grid-cols-12">
          <h2 className="text-h2 lg:col-span-4">{T.faq}</h2>
          <div className="border-t border-ink/80 lg:col-span-7 lg:col-start-6">
            {ind.faq.map((f) => (
              <details key={f.q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-[1.15rem] font-medium text-ink hover:text-corp [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Plus aria-hidden className="h-5 w-5 shrink-0 text-corp group-open:hidden" strokeWidth={1.5} />
                  <Minus aria-hidden className="hidden h-5 w-5 shrink-0 text-corp group-open:block" strokeWidth={1.5} />
                </summary>
                <p className="max-w-measure pb-7 text-body">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* asesoría */}
      <section id="asesoria" className="bg-mist py-24 md:py-28">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-h2">{T.adviceTitle(ind.name)}</h2>
            <p className="mt-5 text-body">{T.adviceLede}</p>
          </div>
          <div className="lg:col-span-8">
            <Suspense fallback={<div className="min-h-[640px]" aria-busy="true" />}>
              <QuoteWizard key={ind.id} initialSite={ind.site} context={ind.name} contextValue={baseIndustry(ind.id)?.name} origin={`industria:${ind.id}`} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* otros sectores */}
      <nav aria-label={T.others} className="py-20">
        <div className="container">
          <h2 className="text-h3">{T.others}</h2>
          <ul className="mt-8 grid gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((o) => (
              <li key={o.id}>
                <Link to={`/industrias/${o.id}`} className="group flex items-start justify-between gap-3 font-display text-[1.1rem] font-medium text-ink transition-colors hover:text-corp">
                  {o.name}
                  <ArrowRight aria-hidden className="arrow-nudge mt-1 h-4 w-4 shrink-0 text-faint group-hover:text-corp" strokeWidth={1.75} />
                </Link>
                <p className="mt-1 text-small text-muted">{o.lede}</p>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  )
}
