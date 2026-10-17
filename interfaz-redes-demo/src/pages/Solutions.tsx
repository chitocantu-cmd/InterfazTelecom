import { Link } from 'react-router-dom'
import { FinalCTA } from '../components/home/Sections'
import { Topology } from '../components/home/Topology'
import { PageHero } from '../components/layout/PageHero'
import { Media } from '../components/plates'
import { Reveal } from '../components/ui'
import { CATEGORIES, SERVICES, servicesOf } from '../data/solutions'
import { cn } from '../lib/utils'
import { useSeo } from '../lib/seo'
import { SEO } from '../data/seo'

const QUOTE_FOR: Record<string, string> = { infraestructura: 'cableado', fibra: 'fibra', seguridad: 'cctv', conectividad: 'infra', ingenieria: 'otro' }

export default function Solutions() {
  useSeo(SEO.solutions)
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Soluciones' }]}
        title="Soluciones de infraestructura tecnológica"
        lede={`${SERVICES.length} servicios en cinco frentes técnicos, diseñados, instalados y documentados con el mismo criterio de ingeniería.`}
        img="aisleWide"
        pos="50% 40%"
      >
        <nav aria-label="Frentes técnicos" className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/soluciones#${c.id}`} className="text-[0.98rem] text-body transition-colors hover:text-corp">{c.name}</Link>
          ))}
        </nav>
      </PageHero>

      {CATEGORIES.map((cat, i) => (
        <section key={cat.id} id={cat.id} className={cn('py-24 md:py-28', i % 2 === 1 && 'bg-mist')} aria-labelledby={`h-${cat.id}`}>
          <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className={cn('lg:col-span-5', i % 2 === 1 && 'lg:order-2 lg:col-start-8')}>
              <div className="lg:sticky lg:top-36">
                <h2 id={`h-${cat.id}`} className="text-h2">{cat.name}</h2>
                <p className="mt-5 max-w-measure text-body">{cat.technical}</p>
                <Media img={cat.img} plate={cat.plate} className="mt-10" ratio="aspect-[4/3]" />
                <Link to={`/contacto?tipo=${QUOTE_FOR[cat.id]}`} className="mt-6 inline-block text-small font-medium text-corp link-line">{cat.cta}</Link>
              </div>
            </div>
            <ul className={cn('border-t border-ink/80 lg:col-span-6', i % 2 === 1 ? 'lg:order-1' : 'lg:col-start-7')}>
              {servicesOf(cat.id).map((s, j) => (
                <Reveal as="li" key={s.slug} delay={j * 0.04} className="border-b border-line">
                  <Link to={`/soluciones/${s.slug}`} className="group block py-8">
                    <h3 className="text-h3 transition-colors group-hover:text-corp">{s.name}</h3>
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
