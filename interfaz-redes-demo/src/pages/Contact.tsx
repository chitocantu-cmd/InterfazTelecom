import { Clock, Globe, Mail, MapPin, MessageCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { CopyValue } from '../components/layout/Footer'
import { Logo } from '../components/layout/Logo'
import { PageHero } from '../components/layout/PageHero'
import { QuoteWizard } from '../components/quote/QuoteWizard'
import { COMPANY } from '../data/company'
import { NEEDS } from '../data/content'
import { PLACES, readExplorer, recommend } from '../data/explorer'
import { isQuoteType } from '../data/quote-types'
import { serviceBySlug as baseService } from '../data/solutions'
import { i18nFor, useI18n } from '../i18n'
import { summaryLines } from '../lib/explorer'
import { useHydrated, waLink } from '../lib/utils'
import { useSeo } from '../lib/seo'

const NO_PARAMS = new URLSearchParams()

export default function Contact() {
  const i18n = useI18n()
  const { t, c } = i18n
  const T = t.contact
  useSeo(t.seo.contact)
  const [urlParams] = useSearchParams()
  // Lo que llega en la URL (?tipo=, ?servicio=, ?escenario=…) se aplica al terminar de hidratar: el HTML
  // prerenderizado no lo conoce. Al aplicarse cambia la `key` del cotizador, que arranca de nuevo con esos datos.
  const params = useHydrated() ? urlParams : NO_PARAMS
  const tipoParam = params.get('tipo')
  const tipo = isQuoteType(tipoParam) ? tipoParam : undefined
  const service = c.serviceBySlug(params.get('servicio') ?? undefined)
  const needBase = NEEDS.find((n) => n.id === params.get('necesidad'))
  const need = needBase && c.needs.find((n) => n.id === needBase.id)
  const industry = c.industryById(params.get('sector') ?? undefined)
  // Explorador de soluciones: el resumen se muestra en el idioma de la página y viaja en español.
  const explorer = readExplorer(params)
  const rec = recommend(explorer, { scenarios: c.explorer.scenarios, rules: c.explorer.rules })
  const lines = rec ? summaryLines(explorer, i18n) : null
  const summary = rec && lines ? { lines, value: summaryLines(explorer, i18nFor('es'))!.join('\n') } : undefined
  const scenario = c.explorer.scenarios.find((s) => s.id === explorer.scenario)

  const initialTypes = rec?.quoteTypes ?? (tipo ? [tipo] : service ? [service.quoteType] : need ? [need.quoteType] : undefined)
  const initialSite = PLACES.find((p) => p.id === explorer.place)?.site ?? industry?.site
  const context = scenario ? `${t.nav.explorer}: ${scenario.label}` : service?.name ?? need?.label ?? industry?.name
  const contextValue = scenario
    ? `Explorador: ${i18nFor('es').c.explorer.scenarios.find((s) => s.id === scenario.id)!.label}`
    : service ? baseService(service.slug)?.name : need ? needBase?.label : industry ? i18nFor('es').c.industryById(industry.id)?.name : undefined

  const rows = [
    {
      icon: MessageCircle, k: T.phone,
      v: <><CopyValue dark value={COMPANY.whatsappDisplay} label={T.phone} /><span className="mt-1 block text-small text-white/60">{T.also} <a href={`tel:${COMPANY.phoneAlt.intl}`} className="hover:text-white">{COMPANY.phoneAlt.display}</a></span></>,
      links: [{ href: waLink(t.wa.quote), label: T.openWhatsapp }, { href: `tel:${COMPANY.phoneIntl}`, label: T.call }],
    },
    {
      icon: Mail, k: T.email,
      v: <><CopyValue dark value={COMPANY.email} label={T.email} /><span className="mt-1 block text-small text-white/60">{T.also} <a href={`mailto:${COMPANY.emailAlt}`} className="break-all hover:text-white">{COMPANY.emailAlt}</a></span></>,
      links: [{ href: `mailto:${COMPANY.email}`, label: T.writeEmail }],
    },
    { icon: MapPin, k: T.office, v: COMPANY.address, links: [{ href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.address)}`, label: T.map }] },
    { icon: Clock, k: T.hours, v: t.company.hours, links: [] },
    { icon: Globe, k: T.coverage, v: t.company.areaServed, links: [] },
  ]

  return (
    <>
      <PageHero crumbs={[{ label: t.nav.contact }]} title={T.title} lede={T.lede} />
      <section className="bg-mist py-16 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {/* Entre el título de la página y los pasos del cotizador (h3) no se salta un nivel. */}
            <h2 className="sr-only">{T.formHeading}</h2>
            <QuoteWizard
              key={`${tipo}-${service?.slug}-${need?.id}-${industry?.id}-${params.toString()}`}
              initialTypes={initialTypes}
              context={context}
              contextValue={contextValue}
              initialDescription={need ? `${need.label}. ` : undefined}
              initialSite={initialSite}
              summary={summary}
              origin={summary ? 'explorador' : 'contacto'}
            />
          </div>
          <aside className="lg:col-span-4">
            <div className="bg-navy text-white">
              <div className="flex items-center gap-4 border-b border-white/10 p-6">
                <Logo variant="tile" size="sm" className="!h-14" />
                <div>
                  <p className="text-small text-white/60">{T.direct}</p>
                  <p className="mt-1 font-display text-[1.1rem] font-medium leading-snug">{COMPANY.name}</p>
                </div>
              </div>
              <ul className="divide-y divide-white/10 text-[0.94rem]">
                {rows.map(({ icon: Icon, k, v, links }) => (
                  <li key={k} className="flex gap-3 p-6">
                    <Icon aria-hidden className="mt-1 h-4 w-4 shrink-0 text-white/50" strokeWidth={1.75} />
                    <div className="min-w-0">
                      <p className="text-small text-white/55">{k}</p>
                      <p className="mt-1 break-words text-white/90">{v}</p>
                      {links.length > 0 && (
                        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                          {links.map((l) => {
                            const ext = l.href.startsWith('http')
                            return <a key={l.label} href={l.href} target={ext ? '_blank' : undefined} rel={ext ? 'noopener noreferrer' : undefined} className="inline-flex items-center gap-1 text-small font-medium text-white link-line">{l.label}</a>
                          })}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 bg-white p-6 text-small text-body">
              <p className="font-medium text-ink">{T.nextTitle}</p>
              <p className="mt-1.5">{T.nextText}</p>
            </div>
            {T.languagesText && (
              <div className="mt-6 bg-white p-6 text-small text-body">
                <p className="font-medium text-ink">{T.languagesTitle}</p>
                <p className="mt-1.5">{T.languagesText}</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  )
}
