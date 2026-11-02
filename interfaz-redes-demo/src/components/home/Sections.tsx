import { ArrowRight } from 'lucide-react'
import { useRef, useState, type CSSProperties } from 'react'
import { COMPANY } from '../../data/company'
import { familiesOf, type Project } from '../../data/content'
import { explorerQuery } from '../../data/explorer'
import { IMG, type ImgKey } from '../../data/media'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { cn, waLink } from '../../lib/utils'
import { useConvergence } from '../../motion/convergence'
import { SplitWords, useMagnetic, useReveal } from '../../motion/primitives'
import { Button, SectionHead, Tag, TextLink } from '../ui'

/* ---------- Capacidad + razones ---------- */
export function Intro() {
  const { t } = useI18n()
  return (
    <section className="py-sec md:py-32" aria-labelledby="intro-title">
      <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <h2 id="intro-title" className="font-display text-[clamp(1.7rem,1.2rem+1.9vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.02em] text-ink">{t.intro.title}</h2>
          <p className="mt-6 max-w-measure text-body md:mt-8">{t.intro.text}</p>
          <TextLink to="/nosotros" className="mt-6 max-md:min-h-[44px] md:mt-8">{t.intro.link}</TextLink>
        </div>
        <dl className="lg:col-span-4 lg:col-start-9">
          {t.intro.reasons.map((r) => (
            <div key={r.title} className="border-t border-line py-5 first:border-t-0 first:pt-0 lg:first:pt-2">
              <dt className="font-display text-h4 font-semibold text-ink">{r.title}</dt>
              <dd className="mt-1 text-small text-body">{r.text}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="container mt-12 md:mt-20">
        {/* Teléfono: tabla de dos columnas (dato y qué significa), sin tres cifras gigantes una tras otra. */}
        <dl className="grid border-t border-ink/80 sm:grid-cols-3 sm:gap-y-8 sm:pt-8">
          {t.intro.stats.map((s) => (
            <div key={s.value} className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-4 border-b border-line py-4 sm:block sm:border-0 sm:py-0 sm:pr-10">
              <dt className="font-display text-[1.55rem] font-medium leading-none tracking-[-0.03em] text-corp sm:text-[2.6rem]">{s.value}</dt>
              <dd className="max-w-[16rem] text-small text-body sm:mt-3">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ---------- Equipo en campo (fotografía real) ---------- */
export function FieldGallery({ items, lede, className }: { items: ImgKey[]; lede: string; className?: string }) {
  const { t } = useI18n()
  const captions = t.field.captions as Record<string, string>
  return (
    <section className={cn('pb-sec md:pb-32', className)} aria-labelledby="campo-title">
      <div className="container">
        <SectionHead id="campo-title" title={t.field.title} lede={lede} />
        <ul className="m-rail mt-9 grid grid-cols-2 gap-x-4 gap-y-8 [--card:72%] md:mt-12 md:gap-x-6 lg:grid-cols-4">
          {items.map((img, i) => (
            <li key={img} className={cn(i % 2 === 1 && 'lg:mt-14')}>
              <figure className="group">
                <div className="m-cv aspect-[3/4] overflow-hidden bg-mist">
                  <img src={IMG[img].src} srcSet={IMG[img].srcSet} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 72vw" alt={IMG[img].alt} loading="lazy" decoding="async" className="img-zoom h-full w-full object-cover" style={{ objectPosition: IMG[img].pos }} />
                </div>
                <figcaption className="mt-3 text-small text-body">{captions[img]}</figcaption>
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
  const { t, c } = useI18n()
  const fam = familiesOf(p).slice(0, 2).map((f) => t.projects.families[f])
  return <p className={cn('text-label text-muted', className)}>{[c.industryById(p.industry)?.name, ...fam].filter(Boolean).join(' · ')}</p>
}

export function FeaturedProjects() {
  const { t, c } = useI18n()
  const root = useReveal<HTMLElement>()
  return (
    <section ref={root} className="py-sec md:py-32" aria-labelledby="proyectos-title">
      <div className="container">
        <SectionHead id="proyectos-title" title={t.featured.title} lede={t.featured.lede} />
        {/* Índice editorial: cada tipo de proyecto con su imagen fija, en una retícula asimétrica (7/5, 5/7). Al pasar
            el mouse la imagen se acerca apenas dentro de su marco y el título cambia de color; nada flota encima.
            Teléfono: el primero a gran formato y los demás como índice con miniatura, para leer los seis de un vistazo. */}
        <ol className="mt-9 grid gap-x-8 md:mt-14 md:grid-cols-2 md:gap-y-14 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-20">
          {c.projects.map((p, i) => {
            const img = p.img ? IMG[p.img] : null
            const wide = i % 4 === 0 || i % 4 === 3
            return (
              <li key={p.slug} data-reveal="rise" style={{ '--rd': `${(i % 2) * 90}ms` } as CSSProperties} className={wide ? 'lg:col-span-7' : 'lg:col-span-5'}>
                <Link to={`/proyectos/${p.slug}`} className={cn('group block', i > 0 && 'max-md:grid max-md:grid-cols-[6.5rem_minmax(0,1fr)] max-md:items-center max-md:gap-4 max-md:border-b max-md:border-line max-md:py-4', i === 0 && 'max-md:mb-3')}>
                  <div className={cn('relative aspect-[16/10] overflow-hidden bg-mist lg:aspect-auto lg:h-[clamp(15rem,23vw,22rem)]', i === 0 ? 'max-md:aspect-[4/3]' : 'max-md:aspect-square')}>
                    {img && <img src={img.src} srcSet={img.srcSet} sizes={wide ? '(min-width: 1024px) 56vw, (min-width: 768px) 50vw, 100vw' : '(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw'} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]" style={{ objectPosition: img.pos }} />}
                  </div>
                  <div className={cn('mt-5 grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 border-t border-line pt-4 max-md:grid-cols-[minmax(0,1fr)_auto] max-md:border-0 max-md:pt-0', i > 0 ? 'max-md:mt-0' : 'max-md:mt-4')}>
                    <span className="font-mono text-[0.72rem] text-faint max-md:hidden">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className={cn('font-display text-[clamp(1.25rem,1.05rem+0.7vw,1.7rem)] font-medium leading-[1.15] tracking-[-0.018em] text-ink transition-colors group-hover:text-corp', i === 0 ? 'max-md:text-[1.5rem]' : 'max-md:text-[1.12rem] max-md:leading-[1.2]')}>{p.title}</h3>
                      <ProjectMeta p={p} className="mt-1.5 md:mt-2" />
                    </div>
                    <ArrowRight aria-hidden className={cn('arrow-nudge h-5 w-5 self-center text-faint transition-colors group-hover:text-corp', i > 0 && 'max-md:hidden')} strokeWidth={1.5} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
        <div className="mt-8 md:mt-14"><TextLink to="/proyectos" className="max-md:min-h-[44px]">{t.featured.all}</TextLink></div>
      </div>
    </section>
  )
}

/* ---------- Explorador de soluciones (acceso desde la portada, sección azul marino) ---------- */
export function ExplorerTeaser() {
  const { t, c } = useI18n()
  return (
    <section className="bg-navy py-sec text-white md:py-32" aria-labelledby="explorador-title">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Tag dark className="max-md:hidden">{t.nav.explorer}</Tag>
            <h2 id="explorador-title" className="text-h2 !text-white md:mt-4">{t.explorerTeaser.title}</h2>
            <p className="mt-6 max-w-measure text-white/70">{t.explorerTeaser.lede}</p>
            <div className="mt-7 md:mt-9"><Button to="/explorador" variant="light" arrow className="max-md:w-full">{t.explorerTeaser.cta}</Button></div>
            <p className="mt-4 text-small text-white/55">{t.explorerTeaser.note}</p>
          </div>
          {/* Teléfono: los escenarios se deslizan; la lista completa medía casi 1 000 px. */}
          <ul className="m-rail grid gap-px self-start border border-white/10 bg-white/10 [--card:15rem] [--rail-gap:0.625rem] max-md:border-0 max-md:bg-transparent sm:grid-cols-2 lg:col-span-7 lg:col-start-6 lg:grid-cols-3">
            {c.explorer.scenarios.map((s, i) => (
              <li key={s.id} className="bg-navy max-md:border max-md:border-white/15">
                <Link to={`/explorador?${explorerQuery({ scenario: s.id, extras: [] })}`} className="group flex h-full flex-col p-5 transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.04]">
                  <span className="mono-tag text-white/55 max-md:hidden">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex items-start md:mt-2 justify-between gap-3 font-display text-[1.05rem] font-medium leading-snug text-white">
                    {s.label}
                    <ArrowRight aria-hidden className="arrow-nudge mt-1 h-4 w-4 shrink-0 text-white/40 group-hover:text-lumen" strokeWidth={1.75} />
                  </span>
                  <span className="mt-1 text-small text-white/55">{s.hint}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------- Industrias: paneles que se expanden ---------- */
export function IndustriesIndex() {
  const { t, c } = useI18n()
  const [active, setActive] = useState(0)
  const timer = useRef<number>()
  const root = useReveal<HTMLElement>()
  const hover = (i: number, pointer: string) => {
    if (pointer !== 'mouse') return
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setActive(i), 160)
  }
  return (
    <section ref={root} className="py-sec md:py-32" aria-labelledby="industrias-title">
      <div className="container">
        <SectionHead id="industrias-title" title={t.industriesIndex.title} lede={t.industriesIndex.lede} />
        {/* Teléfono: una banda fotográfica por sector, que lleva directo a su página. Sin acordeón: los cinco se ven. */}
        <ul className="-mx-[var(--gutter)] mt-9 grid gap-1 md:hidden">
          {c.industries.map((ind) => {
            const img = ind.img ? IMG[ind.img] : null
            return (
              <li key={ind.id}>
                <Link to={`/industrias/${ind.id}`} className="group relative flex h-[13.5rem] items-end overflow-hidden bg-night text-white">
                  {img && <img src={img.src} srcSet={img.srcSet} sizes="100vw" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: img.pos }} />}
                  <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgb(5_13_24/0.92)_0%,rgb(5_13_24/0.55)_46%,transparent_80%)]" />
                  <span className="relative flex w-full items-end justify-between gap-4 px-[var(--gutter)] pb-5">
                    <span className="min-w-0">
                      <span className="block font-display text-[1.45rem] font-semibold leading-[1.12] tracking-[-0.018em]">{ind.name}</span>
                      <span className="mt-1.5 line-clamp-2 block text-small text-white/80">{ind.lede}</span>
                    </span>
                    <ArrowRight aria-hidden className="mb-1 h-5 w-5 shrink-0 text-lumen" strokeWidth={1.75} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <ul className="ind-panels mt-12 max-md:hidden" onPointerLeave={() => window.clearTimeout(timer.current)}>
          {c.industries.map((ind, i) => {
            const on = i === active
            const img = ind.img ? IMG[ind.img] : null
            return (
              <li key={ind.id} className={cn('ind-panel', on && 'is-active')} onPointerEnter={(e) => hover(i, e.pointerType)}>
                {img && <img src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 55vw, 100vw" alt={img.alt} loading="lazy" decoding="async" className="ind-img" style={{ objectPosition: img.pos }} />}
                <span aria-hidden className="ind-shade" />
                <button type="button" aria-expanded={on} aria-controls={`ind-${ind.id}`} onClick={() => { window.clearTimeout(timer.current); setActive(i) }} className="ind-tab">
                  <span className="font-mono text-[0.72rem] text-lumen">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ind-label">{ind.name}</span>
                </button>
                <div id={`ind-${ind.id}`} className="ind-body" {...(on ? {} : { inert: '' })}>
                  <h3 className="text-h2 !text-white">{ind.name}</h3>
                  <p className="mt-3 max-w-[32rem] text-white/75">{ind.lede}</p>
                  <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-lumen">{t.industriesIndex.needs}</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-3 sm:gap-4">
                    {ind.challenges.map((x) => <li key={x} className="border-t border-white/20 pt-2 text-small text-white/85">{x}</li>)}
                  </ul>
                  <Link to={`/industrias/${ind.id}`} className="group mt-7 inline-flex items-center gap-2 font-medium text-white">
                    <span className="link-line">{t.industriesIndex.open(ind.name)}</span>
                    <ArrowRight aria-hidden className="arrow-nudge h-4 w-4 text-lumen" strokeWidth={1.75} />
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
        <TextLink to="/industrias" className="mt-7 max-md:min-h-[44px] md:mt-10">{t.industriesIndex.all}</TextLink>
      </div>
    </section>
  )
}

/* ---------- Proceso ---------- */
export function ProcessLine({ tone = 'mist' }: { tone?: 'mist' | 'white' }) {
  const { t, c } = useI18n()
  return (
    <section className={cn('py-sec md:py-32', tone === 'mist' ? 'bg-mist' : 'bg-white')} aria-labelledby="proceso-title">
      <div className="container">
        <SectionHead id="proceso-title" title={t.process.title} lede={t.process.lede} />
                {/* Teléfono: etapas plegables con su número y línea continua; abierta la primera. */}
        <ol className="mt-9 border-b border-ink/15 md:hidden">
          {c.process.map((p, i) => (
            <li key={p.n} className="border-t border-ink/15">
              <details name="proceso" open={i === 0} className="group">
                <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-4 py-3">
                  <span className="w-7 shrink-0 font-display text-[1.02rem] font-medium text-corp tabular">{p.n}</span>
                  <h3 className="flex-1 font-display text-[1.14rem] font-semibold leading-snug">{p.title}</h3>
                  <span aria-hidden className="m-sign" />
                </summary>
                <div className="pb-5 pl-11">
                  <p className="text-small text-body">{p.detail}</p>
                  <p className="mt-3 text-label text-muted">{t.process.deliverable}: {p.output.join(', ')}</p>
                </div>
              </details>
            </li>
          ))}
        </ol>
        <ol className="mt-16 grid gap-x-12 gap-y-12 max-md:hidden sm:grid-cols-2 lg:grid-cols-3">
          {c.process.map((p) => (
            <li key={p.n} className="border-t border-ink/80 pt-6">
              <span className="font-display text-[1.05rem] font-medium text-corp tabular">{p.n}</span>
              <h3 className="mt-3 text-h4">{p.title}</h3>
              <p className="mt-2 text-small text-body">{p.detail}</p>
              <p className="mt-4 text-label text-muted">{t.process.deliverable}: {p.output.join(', ')}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- Escena final: conexiones que convergen en el llamado a la acción ---------- */
export function FinalCTA() {
  const { t } = useI18n()
  const canvas = useRef<HTMLCanvasElement>(null)
  useConvergence(canvas)
  const root = useReveal<HTMLElement>()
  const magnetic = useMagnetic<HTMLSpanElement>()
  return (
    <section ref={root} className="relative isolate overflow-hidden bg-night text-white" aria-labelledby="cta-title">
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(38%_42%_at_50%_50%,rgb(23_105_200/0.22),transparent_75%)]" />
      <div className="container relative flex flex-col items-center justify-center py-20 text-center md:min-h-[min(820px,88vh)] md:py-28">
        <p data-reveal="rise" className="flex items-center gap-3 max-md:hidden font-mono text-[0.72rem] uppercase tracking-[0.12em] text-lumen">
          <span aria-hidden className="h-px w-8 bg-lumen" />{t.finalCta.eyebrow}<span aria-hidden className="h-px w-8 bg-lumen" />
        </p>
        <h2 id="cta-title" data-reveal="words" className="max-w-[13ch] text-mega !font-semibold !text-white md:mt-7"><SplitWords text={t.finalCta.title} mode="view" /></h2>
        <p data-reveal="rise" className="mt-5 max-w-[36rem] text-white/70 md:mt-7 md:text-lead">{t.finalCta.lede}</p>
        <div data-reveal="rise" className="mt-8 flex flex-wrap justify-center gap-3 max-md:w-full md:mt-10">
          <span ref={magnetic} className="inline-block max-md:w-full"><Button to="/contacto" track="cta-final" arrow variant="light" className="max-md:w-full">{t.common.requestQuote}</Button></span>
          <Button href={waLink(t.wa.survey)} variant="outlineLight" className="max-md:w-full">WhatsApp {COMPANY.whatsappDisplay}</Button>
        </div>
        <dl data-reveal="rise" className="mt-12 grid gap-x-12 gap-y-4 border-t border-white/15 pt-7 text-small max-md:w-full sm:grid-cols-3 sm:text-left md:mt-16 md:pt-8">
          <div><dt className="text-white/50">{t.footer.phone}</dt><dd className="mt-1"><a href={`tel:${COMPANY.phoneIntl}`} className="inline-flex min-h-[24px] items-center text-white hover:text-lumen max-md:min-h-[44px]">{COMPANY.whatsappDisplay}</a></dd></div>
          <div><dt className="text-white/50">{t.footer.email}</dt><dd className="mt-1 break-all"><a href={`mailto:${COMPANY.email}`} className="inline-flex min-h-[24px] items-center text-white hover:text-lumen max-md:min-h-[44px]">{COMPANY.email}</a></dd></div>
          <div><dt className="text-white/50">{t.finalCta.hours}</dt><dd className="mt-1 text-white/85">{t.company.hours}</dd></div>
        </dl>
      </div>
    </section>
  )
}
