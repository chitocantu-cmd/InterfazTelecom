import { ArrowLeft, ArrowRight, FileText } from 'lucide-react'
import { Suspense, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Breadcrumbs, PageHero } from '../components/layout/PageHero'
import { Button, Chip, Tag } from '../components/ui'
import { useResourceBody } from '../content/recursos/bodies'
import { RESOURCE_CATEGORIES, publishedResources, resourceBySlug, showDrafts, visibleResources, type Resource, type ResourceCategory } from '../content/recursos'
import { resourceSeo } from '../data/seo'
import { useI18n } from '../i18n'
import { Link, Navigate } from '../i18n/Link'
import { Markdown } from '../lib/markdown'
import { useSeo } from '../lib/seo'

/** Borradores visibles en desarrollo y en vistas previas (VITE_BORRADORES=1); nunca en producción. */
const DRAFTS = showDrafts(import.meta.env)

const fmtDate = (iso: string, lang: string) => new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`))

function StatusBadge({ r }: { r: Resource }) {
  const { t } = useI18n()
  if (r.status === 'publicado') return null
  return <span className="bg-[#FEF3C7] px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-[#92400E]">{r.status === 'borrador' ? t.resources.draft : t.resources.review}</span>
}

/** Índice del centro técnico: categorías, tipos de contenido y artículos publicados (borradores sólo en vista previa). */
export function Resources() {
  const { t, c, meta } = useI18n()
  const T = t.resources
  const list = visibleResources(DRAFTS)
  useSeo(t.seo.resources, { noindex: publishedResources().length === 0 })
  const [cat, setCat] = useState<ResourceCategory | 'todas'>('todas')
  const shown = list.filter((r) => cat === 'todas' || r.category === cat)
  const withTables = c.services.filter((s) => s.specTable)

  return (
    <>
      <PageHero crumbs={[{ label: T.title }]} title={T.title} lede={T.lede} />
      <section className="pb-28">
        <div className="container">
          {/* Filtros sólo con artículos visibles y sólo las categorías que tienen alguno (nada de chips en cero). */}
          {list.length > 0 && (
            <div className="flex flex-wrap gap-2 border-y border-line py-6" role="group" aria-label={T.categoriesLabel}>
              <Chip active={cat === 'todas'} onClick={() => setCat('todas')} controls="lista-recursos" count={list.length}>{T.all}</Chip>
              {RESOURCE_CATEGORIES.map((k) => [k, list.filter((r) => r.category === k).length] as const).filter(([, n]) => n > 0).map(([k, n]) => (
                <Chip key={k} active={cat === k} onClick={() => setCat(k)} controls="lista-recursos" count={n}>{T.categories[k]}</Chip>
              ))}
            </div>
          )}
          <div id="lista-recursos" className={list.length > 0 ? 'mt-12' : 'border-t border-line pt-12'}>
            {shown.length === 0 ? (
              <div className="grid gap-10 bg-mist p-8 md:p-12 lg:grid-cols-12">
                <p className="text-lead text-body lg:col-span-7">{T.empty}</p>
                <div className="lg:col-span-4 lg:col-start-9">
                  <p className="text-small font-medium text-ink">{T.emptyLinks}</p>
                  <ul className="mt-3 space-y-2">
                    {withTables.map((s) => <li key={s.slug}><Link to={`/soluciones/${s.slug}`} className="text-small text-corp link-line">{s.specTable!.title}</Link></li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <ul className="grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
                {shown.map((r) => (
                  <li key={r.slug} className="bg-white">
                    <Link to={`/recursos/${r.slug}`} className="group flex h-full flex-col p-6 md:p-7">
                      <span className="flex flex-wrap items-center gap-2"><Tag>{T.types[r.type]}</Tag><span className="text-label text-muted">· {T.categories[r.category]}</span><StatusBadge r={r} /></span>
                      <span className="mt-4 font-display text-[1.25rem] font-semibold leading-snug text-ink transition-colors group-hover:text-corp">{r.title}</span>
                      <span className="mt-3 flex-1 text-small text-body">{r.summary}</span>
                      <span className="mt-6 flex items-center justify-between text-label text-muted">{T.readingTime(r.readingMinutes)}<ArrowRight aria-hidden className="arrow-nudge h-4 w-4 text-faint group-hover:text-corp" strokeWidth={1.75} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {meta.prefix && T.onlySpanish && <p className="mt-6 text-small text-muted">{T.onlySpanish}</p>}
          </div>
        </div>
      </section>
    </>
  )
}

function ArticleBody({ slug }: { slug: string }) {
  const body = useResourceBody(slug)
  return <div lang="es-MX"><Markdown source={body} /></div>
}

/** Artículo del centro técnico. Los no publicados sólo existen en desarrollo y vistas previas, con aviso y noindex. */
export function Article() {
  const { slug } = useParams()
  const { t, c, meta } = useI18n()
  const T = t.resources
  const base = resourceBySlug(slug)
  const r = base && (DRAFTS || base.status === 'publicado') ? base : undefined
  useSeo(r ? resourceSeo(r) : t.seo.resources, { noindex: !r || r.status !== 'publicado' })
  if (!r) return <><Navigate to="/recursos" replace /><div className="min-h-[100svh]" /></>

  return (
    <>
      <section className="bg-white">
        <div className="container pb-12 pt-10 md:pt-12">
          <Breadcrumbs items={[{ to: '/recursos', label: T.title }, { label: r.title }]} />
          {r.status !== 'publicado' && <p role="note" className="mt-8 border-l-2 border-[#B45309] bg-[#FFFBEB] px-4 py-3 text-small text-[#92400E]">{T.draftBanner}</p>}
          <div className="mt-12 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8" lang="es-MX">
              <p className="flex flex-wrap items-center gap-2"><Tag>{T.types[r.type]}</Tag><span className="text-label text-muted">· {T.categories[r.category]}</span><StatusBadge r={r} /></p>
              <h1 className="mt-4 text-h1">{r.title}</h1>
              <p className="mt-6 max-w-measure text-lead text-body">{r.summary}</p>
            </div>
            <div className="space-y-1 self-end text-small text-muted lg:col-span-3 lg:col-start-10">
              <p>{T.readingTime(r.readingMinutes)}</p>
              <p>{T.updated(fmtDate(r.updated, meta.htmlLang))}</p>
              {r.reviewedBy && <p>{T.reviewedBy(r.reviewedBy)}</p>}
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-line py-16 md:py-20">
        <div className="container grid gap-14 lg:grid-cols-12">
          <article className="min-w-0 lg:col-span-7">
            {meta.prefix && T.onlySpanish && <p className="mb-8 text-small text-muted">{T.onlySpanish}</p>}
            <Suspense fallback={<div className="min-h-[60svh]" aria-busy="true" />}><ArticleBody slug={r.slug} /></Suspense>
          </article>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-36">
              <p className="text-small font-medium text-ink">{T.relatedServices}</p>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {r.services.map((slug) => {
                  const s = c.serviceBySlug(slug)
                  return s ? <li key={slug}><Link to={`/soluciones/${slug}`} className="group flex items-center gap-3 py-3 text-small text-ink hover:text-corp"><FileText aria-hidden className="h-4 w-4 text-corp" strokeWidth={1.6} /><span className="flex-1">{s.name}</span><ArrowRight aria-hidden className="arrow-nudge h-3.5 w-3.5 text-faint" /></Link></li> : null
                })}
              </ul>
              <div className="mt-8 bg-navy p-6 text-white">
                <p className="font-display text-[1.15rem] font-semibold">{T.ctaTitle}</p>
                <p className="mt-2 text-small text-white/70">{T.ctaText}</p>
                <Button to="/contacto" variant="light" className="mt-5" track={`recurso-${r.slug}`}>{t.common.requestQuote}</Button>
              </div>
              <Link to="/recursos" className="mt-8 inline-flex items-center gap-2 text-small font-medium text-corp"><ArrowLeft aria-hidden className="h-4 w-4" /><span className="link-line">{T.back}</span></Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
