import { Minus, Plus } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/layout/PageHero'
import { Media } from '../components/plates'
import { Button, Reveal } from '../components/ui'
import { BRANDS_NETWORK, BRANDS_SECURITY } from '../data/company'
import { PROCESS } from '../data/content'
import { IMG } from '../data/media'
import { categoryById, serviceBySlug } from '../data/solutions'
import { cn, lowerFirst, scrollToId, waLink } from '../lib/utils'
import { useSeo } from '../lib/seo'
import { serviceSeo, SEO } from '../data/seo'

// El cotizador está al final de la página: se descarga aparte para que el resto se muestre e hidrate antes.
const QuoteWizard = lazy(() => import('../components/quote/QuoteWizard').then((m) => ({ default: m.QuoteWizard })))

export default function ServiceDetail() {
  const { slug } = useParams()
  const s = serviceBySlug(slug)
  useSeo(s ? serviceSeo(s) : SEO.solutions)
  if (!s) return <><Navigate to="/soluciones" replace /><div className="min-h-[100svh]" /></>
  const cat = categoryById(s.category)
  const sameName = cat.name === s.name
  const steps = s.process ?? PROCESS.slice(0, 4).map((p) => ({ title: p.title, text: p.short }))
  const brands = s.category === 'seguridad' ? BRANDS_SECURITY : ['infraestructura', 'fibra', 'conectividad'].includes(s.category) ? BRANDS_NETWORK : null

  return (
    <>
      {/* encabezado: texto sobre blanco + imagen a sangre */}
      <section className="relative mx-auto flex max-w-frame flex-col overflow-hidden bg-white lg:block">
        <div className="relative order-2 aspect-[4/3] w-full sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[48%]">
          {s.img ? (
            <>
              <img src={IMG[s.img].src} srcSet={IMG[s.img].srcSet} sizes="(min-width: 1024px) 48vw, 100vw" alt={IMG[s.img].alt} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: IMG[s.img].pos }} {...{ fetchpriority: 'high' }} />
              {IMG[s.img].ref && <p className="img-caption">Imagen de referencia</p>}
            </>
          ) : (
            <div className="absolute inset-0"><Media plate={s.plate} ratio="h-full w-full" /></div>
          )}
        </div>
        <div className="container relative order-1">
          <div className="flex flex-col pb-14 pt-10 lg:min-h-[620px] lg:w-[46%] lg:pb-20">
            {/* Si el servicio se llama igual que su categoría (Fibra óptica), no se repite el nombre. */}
            <Breadcrumbs items={[{ to: '/soluciones', label: 'Soluciones' }, ...(sameName ? [] : [{ to: `/soluciones#${cat.id}`, label: cat.name }]), { label: s.name }]} />
            <div className="mt-14 lg:my-auto lg:pt-10">
              {!sameName && <p className="mb-3 text-small font-medium text-corp">{cat.name}</p>}
              <h1 className="text-h1">{s.name}</h1>
              <p className="mt-6 max-w-measure text-lead text-body">{s.intro}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button onClick={() => scrollToId('cotizar')}>Cotizar este servicio</Button>
                <Button href={waLink(`Hola, me interesa ${s.name} con Interfaz Redes. ¿Podemos agendar un levantamiento?`)} variant="secondary">Escribir por WhatsApp</Button>
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
      </section>

      {/* aplicaciones y alcance */}
      <section className="bg-mist py-24 md:py-28">
        <div className="container grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-h2">Cuándo se necesita</h2>
            <ul className="mt-8 space-y-4">
              {s.applications.map((a) => <li key={a} className="flex gap-4 text-body"><span aria-hidden className="mt-[0.8em] h-px w-4 shrink-0 bg-corp" />{a}</li>)}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="text-h2">Qué incluye</h2>
            <ul className="mt-8 border-t border-ink/80">
              {s.scope.map((x) => <li key={x} className="border-b border-line py-4 text-body text-ink">{x}</li>)}
            </ul>
            <p className="mt-8 text-small text-body"><span className="font-medium text-ink">Entregables: </span>{s.deliverables.join(', ')}.</p>
          </div>
        </div>
      </section>

      {/* referencia técnica */}
      {s.specTable && (
        <section className="py-24 md:py-28">
          <div className="container grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-h2">{s.specTable.title}</h2>
              {s.specTable.note && <p className="mt-5 text-small text-body">{s.specTable.note}</p>}
            </div>
            <div tabIndex={0} role="region" aria-label={s.specTable.title} className="overflow-x-auto lg:col-span-7 lg:col-start-6">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/80">
                    {s.specTable.columns.map((c) => <th key={c} scope="col" className="pb-3 pr-6 text-small font-medium text-muted">{c}</th>)}
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
      <section className={cn('py-24 md:py-28', s.specTable && 'border-t border-line')}>
        <div className="container">
          <h2 className="text-h2">Cómo se ejecuta</h2>
          <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.05} className="border-t border-ink/80 pt-6">
                <span className="font-display font-medium text-corp tabular">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-h4">{p.title}</h3>
                <p className="mt-2 text-small text-body">{p.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* preguntas + marcas */}
      {(s.faq || brands) && (
        <section className="border-t border-line py-24 md:py-28">
          <div className="container grid gap-16 lg:grid-cols-12">
            {s.faq && (
              <div className="lg:col-span-7">
                <h2 className="text-h2">Preguntas frecuentes</h2>
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
            )}
            {brands && (
              <div className={s.faq ? 'lg:col-span-4 lg:col-start-9' : 'lg:col-span-12'}>
                <h2 className="text-h3">Marcas que integramos</h2>
                <p className="mt-6 font-display text-[1.25rem] font-medium leading-relaxed text-ink">{brands.join(' · ')}</p>
                <p className="mt-5 text-label text-muted">Marcas de equipo que se integran en proyectos. No representa alianza, certificación ni distribución oficial.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* cotización contextual */}
      <section id="cotizar" className="bg-mist py-24 md:py-28">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-h2">Solicite una propuesta</h2>
            <p className="mt-5 text-body">La solicitud ya incluye {lowerFirst(s.name)}. Agregue la ubicación, el alcance aproximado y sus datos de contacto.</p>
          </div>
          <div className="lg:col-span-8"><Suspense fallback={<div className="min-h-[640px]" aria-busy="true" />}><QuoteWizard key={s.slug} initialType={s.quoteType} context={s.name} /></Suspense></div>
        </div>
      </section>

      {/* relacionados */}
      <section className="py-24">
        <div className="container">
          <h2 className="text-h3">Servicios relacionados</h2>
          <ul className="mt-10 grid gap-10 md:grid-cols-3">
            {s.related.map((r) => {
              const rs = serviceBySlug(r)
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
