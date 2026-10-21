import { Clock, Mail, MapPin, MessageCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { CopyValue } from '../components/layout/Footer'
import { Logo } from '../components/layout/Logo'
import { PageHero } from '../components/layout/PageHero'
import { QuoteWizard } from '../components/quote/QuoteWizard'
import { COMPANY } from '../data/company'
import { NEEDS } from '../data/content'
import { isQuoteType } from '../data/quote-types'
import { serviceBySlug } from '../data/solutions'
import { SITES } from '../lib/cotizacion'
import { useHydrated, waLink } from '../lib/utils'
import { useSeo } from '../lib/seo'
import { SEO } from '../data/seo'

const SECTOR_TO_SITE: Record<string, string> = { industria: SITES[0], corporativos: SITES[1], cedis: SITES[2], educacion: SITES[3], comercio: SITES[4] }

const NO_PARAMS = new URLSearchParams()

export default function Contact() {
  useSeo(SEO.contact)
  const [urlParams] = useSearchParams()
  // Lo que llega en la URL (?tipo=, ?servicio=…) se aplica al terminar de hidratar: el HTML prerenderizado no lo
  // conoce. Al aplicarse cambia la `key` del cotizador, que arranca de nuevo con esos datos.
  const params = useHydrated() ? urlParams : NO_PARAMS
  const tipoParam = params.get('tipo')
  const tipo = isQuoteType(tipoParam) ? tipoParam : undefined
  const service = serviceBySlug(params.get('servicio') ?? undefined)
  const need = NEEDS.find((n) => n.id === params.get('necesidad'))
  const site = SECTOR_TO_SITE[params.get('sector') ?? '']

  const rows = [
    {
      icon: MessageCircle, k: 'WhatsApp / teléfono',
      v: <><CopyValue dark value={COMPANY.whatsappDisplay} label="WhatsApp" /><span className="mt-1 block text-small text-white/60">También: <a href={`tel:${COMPANY.phoneAlt.intl}`} className="hover:text-white">{COMPANY.phoneAlt.display}</a></span></>,
      links: [{ href: waLink('Hola, quiero cotizar un proyecto con Interfaz Redes.'), label: 'Abrir WhatsApp' }, { href: `tel:${COMPANY.phoneIntl}`, label: 'Llamar' }],
    },
    {
      icon: Mail, k: 'Correo',
      v: <><CopyValue dark value={COMPANY.email} label="correo" /><span className="mt-1 block text-small text-white/60">También: <a href={`mailto:${COMPANY.emailAlt}`} className="break-all hover:text-white">{COMPANY.emailAlt}</a></span></>,
      links: [{ href: `mailto:${COMPANY.email}`, label: 'Escribir correo' }],
    },
    { icon: MapPin, k: 'Oficina', v: COMPANY.address, links: [{ href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.address)}`, label: 'Ver en mapa' }] },
    { icon: Clock, k: 'Horario', v: COMPANY.hours, links: [] },
  ]

  return (
    <>
      <PageHero crumbs={[{ label: 'Contacto' }]} title="Cotice su proyecto" lede="Cuatro pasos cortos. Al final revisa la solicitud y la envía; también puede mandarla por WhatsApp o correo." />
      <section className="bg-mist py-16 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {/* Entre el título de la página y los pasos del cotizador (h3) no se salta un nivel. */}
            <h2 className="sr-only">Solicitud de cotización</h2>
            <QuoteWizard
              key={`${tipo}-${service?.slug}-${need?.id}-${site}`}
              initialType={tipo ?? service?.quoteType ?? need?.quoteType}
              context={service?.name ?? need?.label}
              initialDescription={need ? `${need.label}. ` : undefined}
              initialSite={site}
            />
          </div>
          <aside className="lg:col-span-4">
            <div className="bg-navy text-white">
              <div className="flex items-center gap-4 border-b border-white/10 p-6">
                <Logo variant="tile" size="sm" className="!h-14" />
                <div>
                <p className="text-small text-white/60">Contacto directo</p>
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
              <p className="font-medium text-ink">Qué sigue después de enviar</p>
              <p className="mt-1.5">Un especialista revisa la solicitud, confirma el alcance y agenda la visita técnica de levantamiento.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
