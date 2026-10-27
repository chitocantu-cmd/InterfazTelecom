import { FieldGallery, FinalCTA, ProcessLine } from '../components/home/Sections'
import { PageHero } from '../components/layout/PageHero'
import { Media } from '../components/plates'
import { BRANDS_NETWORK, BRANDS_SECURITY, COMPANY } from '../data/company'
import { useT } from '../i18n'
import { useSeo } from '../lib/seo'

// Información tomada de interfazredes.com y de la división Redes y TI en interfaz.com.mx.
export default function About() {
  const t = useT()
  const T = t.about
  useSeo(t.seo.about)
  return (
    <>
      <PageHero crumbs={[{ label: t.nav.about }]} title={T.title} lede={T.lede} img="oficina" />

      <section className="py-24 md:py-32">
        <div className="container grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="font-display text-[clamp(1.6rem,1.2rem+1.6vw,2.4rem)] font-medium leading-[1.2] tracking-[-0.02em] text-ink">{T.mission}</h2>
            <div className="mt-8 max-w-measure space-y-5 text-body">
              {T.paragraphs.map((p) => <p key={p}>{p}</p>)}
              {/* El grupo (interfaz.com.mx) es el sitio general; éste, el especializado en redes. */}
              <p>
                {T.division}{' '}
                <a href={COMPANY.parent.url} target="_blank" rel="noopener noreferrer" className="font-medium text-corp link-line">{T.divisionLink}</a>
              </p>
            </div>
            <dl className="mt-14 grid gap-8 border-t border-ink/80 pt-8 sm:grid-cols-3">
              {T.stats.map((s) => (
                <div key={s.value}><dt className="font-display text-[2.2rem] font-medium leading-none tracking-[-0.03em] text-corp">{s.value}</dt><dd className="mt-3 text-small text-body">{s.label}</dd></div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-5 lg:col-start-8"><Media img="equipo" plate="rack" ratio="aspect-[4/5]" /></div>
        </div>
      </section>

      <FieldGallery lede={t.field.aboutLede} items={['site', 'escalera', 'rackOrden', 'plafon']} />

      <section className="bg-mist py-24 md:py-28">
        <div className="container grid gap-14 lg:grid-cols-12">
          <h2 className="text-h2 lg:col-span-4">{T.principlesTitle}</h2>
          <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {T.principles.map((p) => (
              <div key={p.title} className="border-t border-ink/80 pt-6">
                <dt className="text-h4 font-display font-semibold text-ink">{p.title}</dt>
                <dd className="mt-2 text-small text-body">{p.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-24 md:py-28">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-h2">{T.brandsTitle}</h2>
            <p className="mt-5 text-small text-muted">{T.brandsNote}</p>
          </div>
          <div className="space-y-10 lg:col-span-7 lg:col-start-6">
            {([[T.brandsNetwork, BRANDS_NETWORK], [T.brandsSecurity, BRANDS_SECURITY]] as const).map(([title, list]) => (
              <div key={title} className="border-t border-line pt-6">
                <p className="text-small text-muted">{title}</p>
                <p className="mt-3 font-display text-[clamp(1.25rem,1.1rem+0.6vw,1.6rem)] font-medium leading-relaxed tracking-[-0.01em] text-ink">{list.join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dónde trabajamos: la misma dirección, horario y cobertura que en Contacto y en los datos estructurados. */}
      <section className="border-t border-line py-24 md:py-28" aria-labelledby="donde-trabajamos">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="donde-trabajamos" className="text-h2">{T.whereTitle}</h2>
            <p className="mt-5 max-w-measure text-body">{T.whereText}</p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <dl className="grid gap-x-10 gap-y-8 border-t border-ink/80 pt-6 sm:grid-cols-3">
              <div>
                <dt className="text-small text-muted">{t.contact.office}</dt>
                <dd className="mt-2 text-body text-ink">{COMPANY.address}</dd>
                <dd className="mt-2"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.address)}`} target="_blank" rel="noopener noreferrer" className="text-small font-medium text-corp link-line">{t.contact.map}</a></dd>
              </div>
              <div>
                <dt className="text-small text-muted">{t.contact.hours}</dt>
                <dd className="mt-2 text-body text-ink">{t.company.hours}</dd>
              </div>
              <div>
                <dt className="text-small text-muted">{t.contact.coverage}</dt>
                <dd className="mt-2 text-body text-ink">{t.company.areaServed}</dd>
              </div>
            </dl>
            <p className="mt-8 text-small text-body">{T.whereOutside}</p>
          </div>
        </div>
      </section>

      <ProcessLine />
      <FinalCTA />
    </>
  )
}
