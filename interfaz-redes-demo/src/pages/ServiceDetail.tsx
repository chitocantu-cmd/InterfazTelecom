import { ArrowRight, FileText, MapPin, Minus, Plus } from 'lucide-react'
import { lazy, Suspense, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/layout/PageHero'
import { Media } from '../components/plates'
import { Button, Reveal, Tag } from '../components/ui'
import { publishedResources } from '../content/recursos'
import { IMG } from '../data/media'
import { serviceSeo } from '../data/seo'
import { serviceBySlug as baseService } from '../data/solutions'
import { useI18n } from '../i18n'
import { Link, Navigate } from '../i18n/Link'
import { track } from '../lib/analytics'
import { cn, scrollToId, waLink } from '../lib/utils'
import { useSeo } from '../lib/seo'
import { SplitWords } from '../motion/primitives'

// El cotizador está al final de la página: se descarga aparte para que el resto se muestre e hidrate antes.
const QuoteWizard = lazy(() => import('../components/quote/QuoteWizard').then((m) => ({ default: m.QuoteWizard })))

export default function ServiceDetail() {
  const { slug } = useParams()
  const { t, c } = useI18n()
  const s = c.serviceBySlug(slug)
  useSeo(s ? serviceSeo(s, t) : t.seo.solutions)
  useEffect(() => { if (s) track('service_view', { servicio: s.slug }) }, [s])
  if (!s) return <><Navigate to="/soluciones" replace /><div className="min-h-[100svh]" /></>
  const T = t.service
  const cat = c.categoryById(s.category)
  const sameName = cat.name === s.name
  const industries = s.industries.map((id) => c.industryById(id)).filter((x): x is NonNullable<typeof x> => Boolean(x))
  // Guías del centro técnico sobre este servicio: sólo las publicadas (los borradores no se enlazan).
  const guides = publishedResources().filter((r) => r.services.includes(s.slug))

  return (
    <>
      {/* encabezado: texto sobre blanco + imagen a sangre */}
      <section className="relative mx-auto flex max-w-frame flex-col overflow-hidden bg-white lg:block">
        <div className="container relative order-1">
          <div className="flex flex-col pb-14 pt-10 lg:min-h-[620px] lg:w-[46%] lg:pb-20">
            {/* Si el servicio se llama igual que su categoría (Fibra óptica), no se repite el nombre. */}
            <Breadcrumbs items={[{ to: '/soluciones', label: t.nav.solutions }, ...(sameName ? [] : [{ to: `/soluciones#${cat.id}`, label: cat.name }]), { label: s.name }]} />
            <div className="mt-14 lg:my-auto lg:pt-10">
              {!sameName && <p className="mb-3 text-small font-medium text-corp">{cat.name}</p>}
              <h1 className="text-h1"><SplitWords text={s.name} delay={60} /></h1>
              <p className="mt-6 max-w-measure text-lead text-body">{s.intro}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button onClick={() => scrollToId('cotizar')} track={`servicio-${s.slug}`}>{T.quoteThis}</Button>
                <Button href={waLink(t.wa.service(s.name))} variant="secondary">{t.common.writeWhatsapp}</Button>
              </div>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-line pt-6">
              {s.keySpecs.map((k) => (
                <div key={k.label}>
                  <dt className="text-label text-muted">{k.label}</dt>
                  <dd className="mt-1 text-small font-medium text-ink">{k.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        {/* Después del texto en el HTML (el lector de pantalla empieza por el título); en pantalla, a la derecha. */}
        <div className="relative order-2 aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[48%]">
          {s.img ? (
            <>
              <img src={IMG[s.img].src} srcSet={IMG[s.img].srcSet} sizes="(min-width: 1024px) 48vw, 100vw" alt={IMG[s.img].alt} className="enter-reveal absolute inset-0 h-full w-full object-cover" style={{ objectPosition: IMG[s.img].pos }} {...{ fetchpriority: 'high' }} />
            </>
          ) : (
            <div className="absolute inset-0"><Media plate={s.plate} ratio="h-full w-full" /></div>
          )}
        </div>
      </section>

      {/* qué resuelve */}
      <section className="border-t border-line py-24 md:py-28" aria-labelledby="resuelve">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Tag>{s.code}</Tag>
            <h2 id="resuelve" className="mt-2 text-h2">{T.problems}</h2>
          </div>
          <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
            {s.problems.map((p, i) => (
              <li key={p} className="flex gap-5 border-t border-line py-6">
                <span className="font-display text-[1.05rem] font-medium text-corp tabular">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-body text-ink">{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* aplicaciones y alcance */}
      <section className="bg-mist py-24 md:py-28">
        <div className="container grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-h2">{T.when}</h2>
            <ul className="mt-8 space-y-4">
              {s.applications.map((a) => <li key={a} className="flex gap-4 text-body"><span aria-hidden className="mt-[0.8em] h-px w-4 shrink-0 bg-corp" />{a}</li>)}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="text-h2">{T.includes}</h2>
            <ul className="mt-8 border-t border-ink/80">
              {s.scope.map((x) => <li key={x} className="border-b border-line py-4 text-body text-ink">{x}</li>)}
            </ul>
            <p className="mt-8 text-small text-body"><span className="font-medium text-ink">{T.deliverables}: </span>{s.deliverables.join(', ')}.</p>
          </div>
        </div>
      </section>

      {/* opciones técnicas */}
      {s.options && (
        <section className="py-24 md:py-28" aria-labelledby="opciones">
          <div className="container">
            <div className="grid gap-6 lg:grid-cols-12">
              <h2 id="opciones" className="text-h2 lg:col-span-6">{T.options}</h2>
              <p className="max-w-measure text-body lg:col-span-5 lg:col-start-8 lg:self-end">{T.optionsLede}</p>
            </div>
            <ul className={cn('mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2', s.options.length > 2 && 'lg:grid-cols-3', s.options.length === 4 && 'lg:grid-cols-4')}>
              {s.options.map((o) => (
                <li key={o.title} className="border-t-2 border-ink pt-5">
                  <h3 className="text-h4">{o.title}</h3>
                  <p className="mt-2 text-small text-body">{o.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* referencia técnica */}
      {s.specTable && (
        <section className={cn('py-24 md:py-28', s.options && 'border-t border-line')}>
          <div className="container grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-h2">{s.specTable.title}</h2>
              {s.specTable.note && <p className="mt-5 text-small text-body">{s.specTable.note}</p>}
            </div>
            <div tabIndex={0} role="region" aria-label={s.specTable.title} className="overflow-x-auto lg:col-span-7 lg:col-start-6">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/80">
                    {s.specTable.columns.map((col) => <th key={col} scope="col" className="pb-3 pr-6 text-small font-medium text-muted">{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {s.specTable.rows.map((r) => (
                    <tr key={r[0]} className="border-b border-line">
                      {r.map((cell, i) => (i === 0
                        ? <th key={i} scope="row" className="py-4 pr-6 align-top font-display text-[1.02rem] font-medium text-ink">{cell}</th>
                        : <td key={i} className="py-4 pr-6 align-top text-small text-body">{cell}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* proceso */}
      <section className="border-t border-line py-24 md:py-28">
        <div className="container">
          <h2 className="text-h2">{T.how}</h2>
          <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {s.process.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.05} className="border-t border-ink/80 pt-6">
                <span className="font-display font-medium text-corp tabular">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-h4">{p.title}</h3>
                <p className="mt-2 text-small text-body">{p.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* industrias */}
      {industries.length > 0 && (
        <section className="bg-navy py-24 text-white md:py-28" aria-labelledby="industrias-servicio">
          <div className="container">
            <div className="grid gap-6 lg:grid-cols-12">
              <h2 id="industrias-servicio" className="text-h2 !text-white lg:col-span-6">{T.industries}</h2>
              <p className="max-w-measure text-white/70 lg:col-span-5 lg:col-start-8 lg:self-end">{T.industriesLede}</p>
            </div>
            <ul className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
              {industries.map((ind) => (
                <li key={ind.id} className="bg-navy">
                  <Link to={`/industrias/${ind.id}`} className="group flex h-full flex-col p-5 transition-colors hover:bg-white/[0.04]">
                    <div className="aspect-[4/3] overflow-hidden"><Media img={ind.img} plate={ind.plate} ratio="h-full w-full" zoom sizes="(min-width: 1024px) 20vw, 50vw" /></div>
                    <span className="mt-4 flex items-start justify-between gap-3 font-display text-[1.05rem] font-medium leading-snug text-white">
                      {ind.name}
                      <ArrowRight aria-hidden className="arrow-nudge mt-1 h-4 w-4 shrink-0 text-white/40 group-hover:text-lumen" strokeWidth={1.75} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* preguntas + marcas */}
      <section className="py-24 md:py-28">
        <div className="container grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-h2">{T.faq}</h2>
            <div className="mt-10 border-t border-ink/80">
              {s.faq.map((f) => (
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
          {s.brands && (
            <div className="lg:col-span-4 lg:col-start-9">
              <h2 className="text-h3">{T.brands}</h2>
              <p className="mt-6 font-display text-[1.25rem] font-medium leading-relaxed text-ink">{s.brands.join(' · ')}</p>
              <p className="mt-5 text-label text-muted">{T.brandsNote}</p>
            </div>
          )}
        </div>
      </section>

      {/* cotización contextual */}
      <section id="cotizar" className="bg-mist py-24 md:py-28">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-h2">{T.proposal}</h2>
            <p className="mt-5 text-body">{T.proposalLede(s.name)}</p>
            <p className="mt-6 flex gap-2.5 border-t border-line pt-5 text-small text-body">
              <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-corp" strokeWidth={1.75} />
              <span><span className="font-medium text-ink">{t.contact.coverage}:</span> {t.company.areaServed}.</span>
            </p>
          </div>
          <div className="lg:col-span-8">
            <Suspense fallback={<div className="min-h-[640px]" aria-busy="true" />}>
              <QuoteWizard key={s.slug} initialTypes={[s.quoteType]} context={s.name} contextValue={baseService(s.slug)?.name} origin={`servicio:${s.slug}`} service={s.slug} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* guías técnicas relacionadas */}
      {guides.length > 0 && (
        <section className="pt-24" aria-labelledby="guias-servicio">
          <div className="container grid gap-8 lg:grid-cols-12">
            <h2 id="guias-servicio" className="text-h3 lg:col-span-4">{T.guides}</h2>
            <ul className="divide-y divide-line border-y border-line lg:col-span-8">
              {guides.map((r) => (
                <li key={r.slug}>
                  <Link to={`/recursos/${r.slug}`} className="group flex items-start gap-4 py-5">
                    <FileText aria-hidden className="mt-1 h-4 w-4 shrink-0 text-corp" strokeWidth={1.6} />
                    <span className="flex-1">
                      <span className="block font-display text-[1.1rem] font-medium text-ink transition-colors group-hover:text-corp">{r.title}</span>
                      <span className="mt-1 block text-small text-body">{r.summary}</span>
                    </span>
                    <ArrowRight aria-hidden className="arrow-nudge mt-1.5 h-4 w-4 shrink-0 text-faint group-hover:text-corp" strokeWidth={1.75} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* complementarios */}
      <section className="py-24">
        <div className="container">
          <h2 className="text-h3">{T.related}</h2>
          <ul className="mt-10 grid gap-10 md:grid-cols-3">
            {s.related.map((r) => {
              const rs = c.serviceBySlug(r)
              if (!rs) return null
              return (
                <li key={r}>
                  <Link to={`/soluciones/${r}`} className="group block">
                    <div className="overflow-hidden"><Media img={rs.img} plate={rs.plate} ratio="aspect-[3/2]" zoom sizes="(min-width: 768px) 33vw, 100vw" /></div>
                    <span className="mt-5 block font-display text-[1.2rem] font-medium text-ink transition-colors group-hover:text-corp">{rs.name}</span>
                    <span className="mt-1 block text-small text-body">{rs.short}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}
