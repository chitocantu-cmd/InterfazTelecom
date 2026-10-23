import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { COMPANY } from '../../data/company'
import { familiesOf, type Project } from '../../data/content'
import { explorerQuery } from '../../data/explorer'
import { IMG, type ImgKey } from '../../data/media'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { cn, waLink } from '../../lib/utils'
import { Media } from '../plates'
import { Button, Reveal, SectionHead, Tag, TextLink } from '../ui'

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
  return <p className={cn('text-label text-muted', className)}>{[c.industryById(p.industry)?.name, ...fam, p.status === 'demostrativo' ? t.common.demoCase : null].filter(Boolean).join(' · ')}</p>
}

export function FeaturedProjects() {
  const { t, c } = useI18n()
  const [a, b, d] = [c.projects[0], c.projects[2], c.projects[3]]
  return (
    <section className="py-24 md:py-32" aria-labelledby="proyectos-title">
      <div className="container">
        <SectionHead id="proyectos-title" title={t.featured.title} lede={t.featured.lede} />
        <Reveal className="mt-14">
          <Link to={`/proyectos/${a.slug}`} className="group grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="overflow-hidden lg:col-span-8"><Media img={a.img} plate={a.plate} ratio="aspect-[16/10]" zoom pos="74% 50%" sizes="(min-width: 1024px) 66vw, 100vw" /></div>
            <div className="lg:col-span-4 lg:pb-2">
              <ProjectMeta p={a} />
              <h3 className="mt-3 text-h2 transition-colors group-hover:text-corp">{a.title}</h3>
              <p className="mt-4 text-body">{a.summary}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-small font-medium text-corp"><span className="link-line">{t.common.viewCase}</span><ArrowRight aria-hidden className="arrow-nudge h-4 w-4" strokeWidth={1.75} /></span>
            </div>
          </Link>
        </Reveal>
        <div className="mt-20 grid gap-16 md:grid-cols-2 md:gap-10">
          {[b, d].map((p, i) => (
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
        <div className="mt-16"><TextLink to="/proyectos">{t.featured.all}</TextLink></div>
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

/* ---------- Industrias ---------- */
export function IndustriesIndex() {
  const { t, c } = useI18n()
  const [hover, setHover] = useState(c.industries[0].id)
  const ind = c.industryById(hover) ?? c.industries[0]
  return (
    <section className="py-24 md:py-32" aria-labelledby="industrias-title">
      <div className="container grid gap-14 lg:grid-cols-12">
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-36">
            <Media img={ind.img} plate={ind.plate} ratio="aspect-[4/5] max-h-[620px] w-full" sizes="40vw" />
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <h2 id="industrias-title" className="text-h2">{t.industriesIndex.title}</h2>
          <p className="mt-4 max-w-measure text-body">{t.industriesIndex.lede}</p>
          <ul className="mt-10 border-t border-line">
            {c.industries.map((it) => (
              <li key={it.id} className="border-b border-line">
                <Link to={`/industrias/${it.id}`} onMouseEnter={() => setHover(it.id)} onFocus={() => setHover(it.id)} className="group flex items-start justify-between gap-6 py-6">
                  <span>
                    <span className={cn('block font-display text-[1.55rem] font-medium tracking-[-0.015em] transition-colors', hover === it.id ? 'text-corp' : 'text-ink')}>{it.name}</span>
                    <span className="mt-1.5 block text-small text-muted">{it.lede}</span>
                  </span>
                  <ArrowRight aria-hidden className={cn('arrow-nudge mt-2 h-5 w-5 shrink-0 transition-colors', hover === it.id ? 'text-corp' : 'text-faint')} strokeWidth={1.5} />
                </Link>
              </li>
            ))}
          </ul>
          <TextLink to="/industrias" className="mt-8">{t.industriesIndex.all}</TextLink>
        </div>
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

/* ---------- Llamado final ---------- */
export function FinalCTA() {
  const { t } = useI18n()
  return (
    <section className="relative bg-white" aria-labelledby="cta-title">
      <div className="relative mx-auto h-[420px] max-w-frame overflow-hidden md:h-[560px]">
        <img src={IMG.aisleWide.src} srcSet={IMG.aisleWide.srcSet} sizes="(min-width: 1600px) 1600px, 100vw" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 42%' }} />
      </div>
      <div className="container relative -mt-40 pb-24 md:-mt-48 md:pb-32">
        <div className="max-w-3xl bg-white px-0 pt-10 md:px-14 md:pt-14">
          <h2 id="cta-title" className="text-h1">{t.finalCta.title}</h2>
          <p className="mt-6 max-w-measure text-lead text-body">{t.finalCta.lede}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button to="/contacto" track="cta-final" arrow>{t.common.requestQuote}</Button>
            <Button href={waLink(t.wa.survey)} variant="secondary">WhatsApp {COMPANY.whatsappDisplay}</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
