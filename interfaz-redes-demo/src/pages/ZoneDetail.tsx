import { ArrowRight, Minus, Plus } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/layout/PageHero'
import { showDrafts } from '../content/recursos'
import { ZONE_TEXT as T, zoneBySlug } from '../content/zonas'
import { useI18n } from '../i18n'
import { Link, Navigate } from '../i18n/Link'
import { useSeo } from '../lib/seo'

const QuoteWizard = lazy(() => import('../components/quote/QuoteWizard').then((m) => ({ default: m.QuoteWizard })))

/** Borradores visibles en desarrollo y en vistas previas (VITE_BORRADORES=1); nunca en producción. */
const DRAFTS = showDrafts(import.meta.env)

/**
 * Página municipal (SEO local). Sólo en español. Mientras sea borrador lleva noindex, no entra al sitemap y muestra
 * lo que falta para publicarla. El cotizador registra la zona como origen de la medición (zona:<slug>), sin agregar
 * texto a la solicitud.
 */
export default function ZoneDetail() {
  const { slug } = useParams()
  const { c, locale, t } = useI18n()
  const base = zoneBySlug(slug)
  const z = base && locale === 'es' && (DRAFTS || base.status === 'publicado') ? base : undefined
  useSeo(z ? z.seo : t.seo.notFound, { noindex: !z || z.status !== 'publicado' })
  if (!z) return <><Navigate to="/" replace /><div className="min-h-[100svh]" /></>
  const services = z.services.map((s) => c.serviceBySlug(s)).filter((s): s is NonNullable<typeof s> => Boolean(s))
  const industries = z.industries.map((id) => c.industryById(id)).filter((i): i is NonNullable<typeof i> => Boolean(i))

  return (
    <>
      <section className="bg-white">
        <div className="container pb-14 pt-10 md:pt-12">
          <Breadcrumbs items={[{ label: z.name }]} />
          {z.status !== 'publicado' && (
            <div role="note" className="mt-8 border-l-2 border-[#B45309] bg-[#FFFBEB] px-4 py-3 text-small text-[#92400E]">
              <p className="font-medium">{T.draftBanner}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">{z.missing.map((m) => <li key={m}>{m}</li>)}</ul>
            </div>
          )}
          <h1 className="mt-12 max-w-[22ch] text-h1">{z.title}</h1>
          <p className="mt-6 max-w-measure text-lead text-body">{z.intro}</p>
        </div>
      </section>

      <section className="border-t border-line py-20 md:py-24">
        <div className="container grid gap-12 lg:grid-cols-12">
          <h2 className="text-h2 lg:col-span-4">{T.context}</h2>
          <div className="max-w-measure space-y-5 text-body lg:col-span-7 lg:col-start-6">{z.context.map((p) => <p key={p}>{p}</p>)}</div>
        </div>
      </section>

      <section className="bg-mist py-20 md:py-24">
        <div className="container">
          <h2 className="text-h2">{T.needs}</h2>
          <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {z.needs.map((n) => (
              <li key={n.title} className="border-t-2 border-ink pt-5">
                <h3 className="text-h4">{n.title}</h3>
                <p className="mt-2 text-small text-body">{n.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-h2">{T.services}</h2>
            {industries.length > 0 && (
              <p className="mt-6 text-small text-body">
                <span className="font-medium text-ink">{T.industries}: </span>
                {industries.map((i, n) => <span key={i.id}>{n > 0 && ' · '}<Link to={`/industrias/${i.id}`} className="text-corp link-line">{i.name}</Link></span>)}
              </p>
            )}
          </div>
          <ul className="divide-y divide-line border-y border-line lg:col-span-7 lg:col-start-6">
            {services.map((s) => (
              <li key={s.slug}>
                <Link to={`/soluciones/${s.slug}`} className="group flex items-start gap-4 py-5">
                  <span className="flex-1">
                    <span className="block font-display text-[1.1rem] font-medium text-ink transition-colors group-hover:text-corp">{s.name}</span>
                    <span className="mt-1 block text-small text-body">{s.short}</span>
                  </span>
                  <ArrowRight aria-hidden className="arrow-nudge mt-1.5 h-4 w-4 shrink-0 text-faint group-hover:text-corp" strokeWidth={1.75} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line py-20 md:py-24">
        <div className="container grid gap-12 lg:grid-cols-12">
          <h2 className="text-h2 lg:col-span-4">{T.faq}</h2>
          <div className="border-t border-ink/80 lg:col-span-7 lg:col-start-6">
            {z.faq.map((f) => (
              <details key={f.q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-[1.1rem] font-medium text-ink hover:text-corp [&::-webkit-details-marker]:hidden">
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

      <section id="cotizar" className="bg-mist py-20 md:py-24">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-h2">{T.quote}</h2>
            <p className="mt-5 text-body">{T.quoteLede(z.name)}</p>
          </div>
          <div className="lg:col-span-8">
            <Suspense fallback={<div className="min-h-[640px]" aria-busy="true" />}>
              <QuoteWizard key={z.slug} origin={`zona:${z.slug}`} />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  )
}
