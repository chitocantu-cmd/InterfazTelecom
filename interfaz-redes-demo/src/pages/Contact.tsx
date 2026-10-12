import { Clock, Mail, MapPin, MessageCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { CopyValue } from '../components/layout/Footer'
import { Logo } from '../components/layout/Logo'
import { PageHero } from '../components/layout/PageHero'
import { QuoteWizard, SITES } from '../components/quote/QuoteWizard'
import { COMPANY } from '../data/company'
import { NEEDS } from '../data/content'
import { QUOTE_TYPES, serviceBySlug, type QuoteType } from '../data/solutions'
import { waLink } from '../lib/utils'
import { useSeo } from '../lib/seo'

const SECTOR_TO_SITE: Record<string, string> = { industria: SITES[0], corporativos: SITES[1], cedis: SITES[2], educacion: SITES[3], comercio: SITES[4] }

export default function Contact() {
  useSeo('Cotizar proyecto', 'Solicite una cotización de cableado estructurado, fibra óptica, CCTV, control de acceso o infraestructura TI. Respuesta por WhatsApp o correo.')
  const [params] = useSearchParams()
  const tipoParam = params.get('tipo')
  const tipo = QUOTE_TYPES.some((q) => q.id === tipoParam) ? (tipoParam as QuoteType) : undefined
  const service = serviceBySlug(params.get('servicio') ?? undefined)
  const need = NEEDS.find((n) => n.id === params.get('necesidad'))
  const site = SECTOR_TO_SITE[params.get('sector') ?? '']

  const rows = [
    { icon: MessageCircle, k: 'WhatsApp / teléfono', v: <CopyValue dark value={COMPANY.whatsappDisplay} label="WhatsApp" />, link: { href: waLink('Hola, quiero cotizar un proyecto con Interfaz Redes.'), label: 'Abrir WhatsApp' } },
    { icon: Mail, k: 'Correo', v: <CopyValue dark value={COMPANY.email} label="correo" /> },
    { icon: MapPin, k: 'Oficina', v: COMPANY.address, link: { href: 'https://www.google.com/maps/search/?api=1&query=Av.+8+Norte+1750+Col.+Industrial+Monterrey+N.L.', label: 'Ver en mapa' } },
    { icon: Clock, k: 'Horario', v: COMPANY.hours },
  ]

  return (
    <>
      <PageHero crumbs={[{ label: 'Contacto' }]} title="Cotice su proyecto" lede="Cuatro pasos cortos. Al final revisa la solicitud y la envía por WhatsApp o correo con los datos ya escritos." />
      <section className="bg-mist py-16 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
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
                {rows.map(({ icon: Icon, k, v, link }) => (
                  <li key={k} className="flex gap-3 p-6">
                    <Icon aria-hidden className="mt-1 h-4 w-4 shrink-0 text-white/50" strokeWidth={1.75} />
                    <div className="min-w-0">
                      <p className="text-small text-white/55">{k}</p>
                      <p className="mt-1 break-words text-white/90">{v}</p>
                      {link && <a href={link.href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-small font-medium text-white link-line">{link.label}</a>}
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
