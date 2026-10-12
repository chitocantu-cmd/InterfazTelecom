import { FinalCTA, ProcessLine } from '../components/home/Sections'
import { PageHero } from '../components/layout/PageHero'
import { Media } from '../components/plates'
import { BRANDS_NETWORK, BRANDS_SECURITY, COMPANY } from '../data/company'
import { useSeo } from '../lib/seo'

const PRINCIPLES = [
  ['Ingeniería antes que equipo', 'Una inversión en tecnología basada en buena ingeniería y proyección no se convierte en gasto. Por eso el diseño va antes de la cotización.'],
  ['Un solo responsable', 'Cableado, redes, site, seguridad y soporte con el mismo equipo responsable del resultado.'],
  ['Antes, durante y después', 'Acompañamos el proyecto desde el levantamiento hasta el soporte continuo.'],
  ['Sólo lo que podemos respaldar', 'Publicamos capacidades con experiencia real y cumplimiento verificable.'],
]

export default function About() {
  useSeo('Nosotros', 'Interfaz Redes y Telecomunicaciones: más de 15 años desarrollando proyectos de redes, fibra óptica y seguridad electrónica desde Monterrey. Registro REPSE.')
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Nosotros' }]}
        title="Ingeniería de redes y telecomunicaciones desde Monterrey"
        lede="Interfaz Redes y Telecomunicaciones desarrolla proyectos de redes, voz y datos, fibra óptica, enlaces y seguridad electrónica para empresas e industria."
        img="nave"
        pos="60% 50%"
      />

      <section className="py-24 md:py-32">
        <div className="container grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="font-display text-[clamp(1.6rem,1.2rem+1.6vw,2.4rem)] font-medium leading-[1.2] tracking-[-0.02em] text-ink">
              Desde el primer día, la misión ha sido ampliar las soluciones disponibles y mejorar la experiencia de cada cliente.
            </h2>
            <div className="mt-8 max-w-measure space-y-5 text-body">
              <p>Hoy el equipo integra redes, voz y datos, tendido y fusión de fibra óptica, enlaces punto a punto y multipunto, videovigilancia y control de acceso.</p>
              <p>Ingenieros, arquitectos y técnicos desarrollan diseños, ingeniería y proyectos ejecutivos para que cada instalación responda a la operación del cliente.</p>
            </div>
            <dl className="mt-14 grid gap-8 border-t border-ink/80 pt-8 sm:grid-cols-3">
              {[[COMPANY.years, 'años en desarrollo de proyectos'], ['REPSE', 'registro ante la STPS'], ['Monterrey', 'Av. 8 Norte, Col. Industrial']].map(([v, d]) => (
                <div key={v}><dt className="font-display text-[2.2rem] font-medium leading-none tracking-[-0.03em] text-corp">{v}</dt><dd className="mt-3 text-small text-body">{d}</dd></div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-5 lg:col-start-8"><Media img="rack" plate="rack" ratio="aspect-[4/5]" /></div>
        </div>
      </section>

      <section className="bg-mist py-24 md:py-28">
        <div className="container grid gap-14 lg:grid-cols-12">
          <h2 className="text-h2 lg:col-span-4">Criterios de trabajo</h2>
          <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {PRINCIPLES.map(([t, d]) => (
              <div key={t} className="border-t border-ink/80 pt-6">
                <dt className="text-h4 font-display font-semibold text-ink">{t}</dt>
                <dd className="mt-2 text-small text-body">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-24 md:py-28">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-h2">Equipo que integramos</h2>
            <p className="mt-5 text-small text-muted">Marcas de equipo que se manejan en proyectos. No representa alianza, certificación ni distribución oficial.</p>
          </div>
          <div className="space-y-10 lg:col-span-7 lg:col-start-6">
            {([['Redes e infraestructura', BRANDS_NETWORK], ['Seguridad electrónica', BRANDS_SECURITY]] as const).map(([t, list]) => (
              <div key={t} className="border-t border-line pt-6">
                <p className="text-small text-muted">{t}</p>
                <p className="mt-3 font-display text-[clamp(1.25rem,1.1rem+0.6vw,1.6rem)] font-medium leading-relaxed tracking-[-0.01em] text-ink">{list.join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProcessLine />

      <section className="border-t border-line py-12">
        <div className="container">
          <p className="max-w-prose text-small text-muted">Información tomada de interfazredes.com y de la división Redes y TI en interfaz.com.mx. Pendiente de revisión final por Interfaz antes de publicar.</p>
        </div>
      </section>
      <FinalCTA />
    </>
  )
}
