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
    <section className="py-24 md:py-32" aria-labelledby="intro-title">
      <div className="container grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 id="intro-title" className="font-display text-[clamp(1.7rem,1.2rem+1.9vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.02em] text-ink">{t.intro.title}</h2>
          <p className="mt-8 max-w-measure text-body">{t.intro.text}</p>
          <TextLink to="/nosotros" className="mt-8">{t.intro.link}</TextLink>
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
      <div className="container mt-20">
        <dl className="grid gap-y-8 border-t border-ink/80 pt-8 sm:grid-cols-3">
          {t.intro.stats.map((s) => (
            <div key={s.value} className="sm:pr-10">
              <dt className="font-display text-[2.6rem] font-medium leading-none tracking-[-0.03em] text-corp">{s.value}</dt>
              <dd className="mt-3 max-w-[16rem] text-small text-body">{s.label}</dd>
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
    <section className={cn('pb-24 md:pb-32', className)} aria-labelledby="campo-title">
      <div className="container">
        <SectionHead id="campo-title" title={t.field.title} lede={lede} />
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
          {items.map((img, i) => (
            <li key={img} className={cn(i % 2 === 1 && 'lg:mt-14')}>
              <figure className="group">
                <div className="aspect-[3/4] overflow-hidden bg-mist">
                  <img src={IMG[img].src} srcSet={IMG[img].srcSet} sizes="(min-width: 1024px) 25vw, 50vw" alt={IMG[img].alt} loading="lazy" decoding="async" className="img-zoom h-full w-full object-cover" style={{ objectPosition: IMG[img].pos }} />
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
    <section ref={root} className="py-24 md:py-32" aria-labelledby="proyectos-title">
      <div className="container">
        <SectionHead id="proyectos-title" title={t.featured.title} lede={t.featured.lede} />
        {/* Índice editorial: cada tipo de proyecto con su imagen fija, en una retícula asimétrica (7/5, 5/7). Al pasar
            el mouse la imagen se acerca apenas dentro de su marco y el título cambia de color; nada flota encima. */}
        <ol className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-20">
          {c.projects.map((p, i) => {
            const img = p.img ? IMG[p.img] : null
            const wide = i % 4 === 0 || i % 4 === 3
            return (
              <li key={p.slug} data-reveal="rise" style={{ '--rd': `${(i % 2) * 90}ms` } as CSSProperties} className={wide ? 'lg:col-span-7' : 'lg:col-span-5'}>
                <Link to={`/proyectos/${p.slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-mist lg:aspect-auto lg:h-[clamp(15rem,23vw,22rem)]">
                    {img && <img src={img.src} srcSet={img.srcSet} sizes={wide ? '(min-width: 1024px) 56vw, (min-width: 768px) 50vw, 100vw' : '(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw'} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]" style={{ objectPosition: img.pos }} />}
                  </div>
                  <div className="mt-5 grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 border-t border-line pt-4">
                    <span className="font-mono text-[0.72rem] text-faint">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="font-display text-[clamp(1.25rem,1.05rem+0.7vw,1.7rem)] font-medium leading-[1.15] tracking-[-0.018em] text-ink transition-colors group-hover:text-corp">{p.title}</h3>
                      <ProjectMeta p={p} className="mt-2" />
                    </div>
                    <ArrowRight aria-hidden className="arrow-nudge h-5 w-5 self-center text-faint transition-colors group-hover:text-corp" strokeWidth={1.5} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
        <div className="mt-14"><TextLink to="/proyectos">{t.featured.all}</TextLink></div>
      </div>
    </section>
  )
}

/* ---------- Explorador de soluciones (acceso desde la portada, sección azul marino) ---------- */
export function ExplorerTeaser() {
  const { t, c } = useI18n()
  return (
    <section className="bg-navy py-24 text-white md:py-32" aria-labelledby="explorador-title">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Tag dark>{t.nav.explorer}</Tag>
            <h2 id="explorador-title" className="mt-4 text-h2 !text-white">{t.explorerTeaser.title}</h2>
            <p className="mt-6 max-w-measure text-white/70">{t.explorerTeaser.lede}</p>
            <div className="mt-9"><Button to="/explorador" variant="light" arrow>{t.explorerTeaser.cta}</Button></div>
            <p className="mt-4 text-small text-white/55">{t.explorerTeaser.note}</p>
          </div>
          <ul className="grid gap-px self-start border border-white/10 bg-white/10 sm:grid-cols-2 lg:col-span-7 lg:col-start-6 lg:grid-cols-3">
            {c.explorer.scenarios.map((s, i) => (
              <li key={s.id} className="bg-navy">
                <Link to={`/explorador?${explorerQuery({ scenario: s.id, extras: [] })}`} className="group flex h-full flex-col p-5 transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.04]">
                  <span className="mono-tag text-white/55">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mt-2 flex items-start justify-between gap-3 font-display text-[1.05rem] font-medium leading-snug text-white">
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
    <section ref={root} className="py-24 md:py-32" aria-labelledby="industrias-title">
      <div className="container">
        <SectionHead id="industrias-title" title={t.industriesIndex.title} lede={t.industriesIndex.lede} />
        <ul className="ind-panels mt-12" onPointerLeave={() => window.clearTimeout(timer.current)}>
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
        <TextLink to="/industrias" className="mt-10">{t.industriesIndex.all}</TextLink>
      </div>
    </section>
  )
}

/* ---------- Proceso ---------- */
export function ProcessLine({ tone = 'mist' }: { tone?: 'mist' | 'white' }) {
  const { t, c } = useI18n()
  return (
    <section className={cn('py-24 md:py-32', tone === 'mist' ? 'bg-mist' : 'bg-white')} aria-labelledby="proceso-title">
      <div className="container">
        <SectionHead id="proceso-title" title={t.process.title} lede={t.process.lede} />
        <ol className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="container relative flex min-h-[min(820px,88vh)] flex-col items-center justify-center py-28 text-center">
        <p data-reveal="rise" className="flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-lumen">
          <span aria-hidden className="h-px w-8 bg-lumen" />{t.finalCta.eyebrow}<span aria-hidden className="h-px w-8 bg-lumen" />
        </p>
        <h2 id="cta-title" data-reveal="words" className="mt-7 max-w-[13ch] text-mega !font-semibold !text-white"><SplitWords text={t.finalCta.title} mode="view" /></h2>
        <p data-reveal="rise" className="mt-7 max-w-[36rem] text-lead text-white/70">{t.finalCta.lede}</p>
        <div data-reveal="rise" className="mt-10 flex flex-wrap justify-center gap-3">
          <span ref={magnetic} className="inline-block"><Button to="/contacto" track="cta-final" arrow variant="light">{t.common.requestQuote}</Button></span>
          <Button href={waLink(t.wa.survey)} variant="outlineLight">WhatsApp {COMPANY.whatsappDisplay}</Button>
        </div>
        <dl data-reveal="rise" className="mt-16 grid gap-x-12 gap-y-4 border-t border-white/15 pt-8 text-small sm:grid-cols-3 sm:text-left">
          <div><dt className="text-white/50">{t.footer.phone}</dt><dd className="mt-1"><a href={`tel:${COMPANY.phoneIntl}`} className="inline-flex min-h-[24px] items-center text-white hover:text-lumen">{COMPANY.whatsappDisplay}</a></dd></div>
          <div><dt className="text-white/50">{t.footer.email}</dt><dd className="mt-1 break-all"><a href={`mailto:${COMPANY.email}`} className="inline-flex min-h-[24px] items-center text-white hover:text-lumen">{COMPANY.email}</a></dd></div>
          <div><dt className="text-white/50">{t.finalCta.hours}</dt><dd className="mt-1 text-white/85">{t.company.hours}</dd></div>
        </dl>
      </div>
    </section>
  )
}
