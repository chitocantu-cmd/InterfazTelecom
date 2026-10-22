import { ArrowRight } from 'lucide-react'
import { QUOTE_FOR } from '../components/home/Explorer'
import { FinalCTA } from '../components/home/Sections'
import { Topology } from '../components/home/Topology'
import { PageHero } from '../components/layout/PageHero'
import { Media } from '../components/plates'
import { Reveal, Tag } from '../components/ui'
import { useI18n } from '../i18n'
import { Link } from '../i18n/Link'
import { cn } from '../lib/utils'
import { useSeo } from '../lib/seo'

export default function Solutions() {
  const { t, c } = useI18n()
  useSeo(t.seo.solutions)
  return (
    <>
      <PageHero crumbs={[{ label: t.nav.solutions }]} title={t.solutions.title} lede={t.solutions.lede(c.services.length)} img="aisleWide" pos="50% 40%">
        <nav aria-label={t.solutions.nav} className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
          {c.categories.map((cat) => (
            <Link key={cat.id} to={`/soluciones#${cat.id}`} className="text-[0.98rem] text-body transition-colors hover:text-corp">{cat.name}</Link>
          ))}
        </nav>
      </PageHero>

      {/* Cada frente es destino de /soluciones#<id>: recibe el foco del teclado sin contorno (preparado desde el HTML,
          para no modificar la sección mientras React toma el HTML prerenderizado). */}
      {c.categories.map((cat, i) => (
        <section key={cat.id} id={cat.id} tabIndex={-1} className={cn('py-24 outline-none md:py-28', i % 2 === 1 && 'bg-mist')} aria-labelledby={`h-${cat.id}`}>
          <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className={cn('lg:col-span-5', i % 2 === 1 && 'lg:order-2 lg:col-start-8')}>
              <div className="lg:sticky lg:top-36">
                <Tag>{cat.code}</Tag>
                <h2 id={`h-${cat.id}`} className="mt-2 text-h2">{cat.name}</h2>
                <p className="mt-5 max-w-measure text-body">{cat.technical}</p>
                <Media img={cat.img} plate={cat.plate} className="mt-10" ratio="aspect-[4/3]" />
                <Link to={`/contacto?tipo=${QUOTE_FOR[cat.id]}`} data-track-cta={`soluciones-${cat.id}`} className="group mt-6 inline-flex items-center gap-2 text-small font-medium text-corp"><span className="link-line">{cat.cta}</span><ArrowRight aria-hidden className="arrow-nudge h-4 w-4" strokeWidth={1.75} /></Link>
              </div>
            </div>
            <ul className={cn('border-t border-ink/80 lg:col-span-6', i % 2 === 1 ? 'lg:order-1' : 'lg:col-start-7')}>
              {c.servicesOf(cat.id).map((s, j) => (
                <Reveal as="li" key={s.slug} delay={j * 0.04} className="border-b border-line">
                  <Link to={`/soluciones/${s.slug}`} className="group block py-8">
                    <div className="flex items-start justify-between gap-6">
                      <h3 className="text-h3 transition-colors group-hover:text-corp">{s.name}</h3>
                      <ArrowRight aria-hidden className="arrow-nudge mt-1.5 h-5 w-5 shrink-0 text-faint group-hover:text-corp" strokeWidth={1.5} />
                    </div>
                    <p className="mt-2 max-w-measure text-body">{s.short}</p>
                    <p className="mt-4 text-small text-muted">{s.keySpecs.map((k) => `${k.label}: ${k.value}`).join('   ·   ')}</p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ))}
      <Topology />
      <FinalCTA />
    </>
  )
}
