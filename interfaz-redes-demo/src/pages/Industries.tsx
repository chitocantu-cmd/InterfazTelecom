import { ArrowRight } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { FinalCTA } from '../components/home/Sections'
import { PageHero } from '../components/layout/PageHero'
import { Media } from '../components/plates'
import { Reveal } from '../components/ui'
import { useI18n } from '../i18n'
import { Link, Navigate } from '../i18n/Link'
import { cn, useHydrated } from '../lib/utils'
import { useSeo } from '../lib/seo'

const MATRIX = ['cableado-estructurado', 'fibra-optica', 'redes-empresariales', 'wifi-empresarial', 'racks-y-site', 'cctv-videovigilancia', 'control-de-acceso']

export default function Industries() {
  const { t, c } = useI18n()
  useSeo(t.seo.industries)
  const [params] = useSearchParams()
  // Enlaces anteriores (?sector=cedis) llevan a la página del sector; se resuelve al terminar de hidratar.
  const legacy = useHydrated() ? c.industryById(params.get('sector') ?? undefined) : undefined
  if (legacy) return <Navigate to={`/industrias/${legacy.id}`} replace />

  return (
    <>
      <PageHero crumbs={[{ label: t.nav.industries }]} title={t.industries.title} lede={t.industries.lede} />

      <section className="pb-24 md:pb-28">
        <div className="container">
          <ul className="border-t border-ink/80">
            {c.industries.map((ind, i) => (
              <Reveal as="li" key={ind.id} className="border-b border-line">
                <Link to={`/industrias/${ind.id}`} className="group grid gap-6 py-10 md:grid-cols-12 md:items-center md:gap-10">
                  <span className="font-mono text-[0.75rem] text-muted md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                  <div className="overflow-hidden md:col-span-4"><Media img={ind.img} plate={ind.plate} ratio="aspect-[16/10]" zoom sizes="(min-width: 768px) 33vw, 100vw" /></div>
                  <div className="md:col-span-6 md:col-start-7">
                    <h2 className="font-display text-[clamp(1.5rem,1.2rem+1vw,2.1rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink transition-colors group-hover:text-corp">{ind.name}</h2>
                    <p className="mt-3 max-w-measure text-body">{ind.lede}</p>
                    <p className="mt-4 text-small text-muted">{ind.areas.join(' · ')}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-small font-medium text-corp"><span className="link-line">{t.industries.seeSector}</span><ArrowRight aria-hidden className="arrow-nudge h-4 w-4" strokeWidth={1.75} /></span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-mist py-24 md:py-28">
        <div className="container">
          <h2 className="max-w-2xl text-h2">{t.industries.matrixTitle}</h2>
          <div className="mt-12 overflow-x-auto bg-white" tabIndex={0} role="region" aria-label={t.industries.matrixTitle}>
            <table className="w-full min-w-[820px] border-collapse text-[0.9rem]">
              <thead>
                <tr className="border-b border-ink/80">
                  <th scope="col" className="px-5 py-4 text-left text-small font-medium text-muted">{t.industries.matrixSector}</th>
                  {MATRIX.map((slug) => (
                    <th key={slug} scope="col" className="px-3 py-4 text-center align-bottom">
                      <Link to={`/soluciones/${slug}`} className="block text-small font-medium leading-tight text-ink hover:text-corp">{c.serviceBySlug(slug)!.name}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.industries.map((it) => (
                  <tr key={it.id} className="border-b border-line last:border-0">
                    <th scope="row" className="px-5 py-4 text-left">
                      <Link to={`/industrias/${it.id}`} className="font-display font-medium text-ink hover:text-corp">{it.name}</Link>
                    </th>
                    {MATRIX.map((slug) => (
                      <td key={slug} className="px-3 py-4 text-center">
                        {it.services.includes(slug)
                          ? <span className="inline-block h-2.5 w-2.5 rounded-full bg-corp" role="img" aria-label={t.industries.frequent} />
                          : <span className={cn('inline-block h-px w-3 bg-line align-middle')} role="img" aria-label={t.industries.byProject} />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-label text-muted">{t.industries.matrixLegend}</p>
        </div>
      </section>
      <FinalCTA />
    </>
  )
}
