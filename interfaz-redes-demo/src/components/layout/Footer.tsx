import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { COMPANY } from '../../data/company'
import { CATEGORIES, servicesOf } from '../../data/solutions'
import { copyText } from '../../lib/utils'
import { Logo } from './Logo'

export function CopyValue({ value, label, dark, href }: { value: string; label: string; dark?: boolean; href?: string }) {
  const [ok, setOk] = useState(false)
  return (
    <span className="inline-flex items-center gap-2">
      {href ? <a href={href} className={dark ? 'hover:text-white' : 'hover:text-corp'}>{value}</a> : <span className="select-all">{value}</span>}
      <button
        type="button"
        aria-label={`Copiar ${label}`}
        onClick={async () => { if (await copyText(value)) { setOk(true); window.setTimeout(() => setOk(false), 1600) } }}
        className={dark ? 'text-white/40 hover:text-white' : 'text-faint hover:text-corp'}
      >
        {ok ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <span aria-live="polite" className="sr-only">{ok ? 'Copiado' : ''}</span>
    </span>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container pb-24 pt-16 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Logo size="lg" />
            <p className="mt-4 font-display text-[1.05rem] font-semibold text-ink">Interfaz Redes y Telecomunicaciones</p>
            <p className="mt-2 max-w-sm text-small text-body">
              Ingeniería, instalación y mantenimiento de redes, telecomunicaciones y seguridad electrónica para empresas e industria.
            </p>
            <dl className="mt-8 space-y-4 text-small">
              <div><dt className="text-muted">WhatsApp y teléfono</dt><dd className="mt-0.5 font-medium text-ink"><CopyValue value={COMPANY.whatsappDisplay} label="teléfono" href={`tel:${COMPANY.phoneIntl}`} /></dd></div>
              <div><dt className="text-muted">Correo</dt><dd className="mt-0.5 break-all font-medium text-ink"><CopyValue value={COMPANY.email} label="correo" href={`mailto:${COMPANY.email}`} /></dd></div>
              <div><dt className="text-muted">Oficina</dt><dd className="mt-0.5 text-ink">{COMPANY.address}</dd><dd className="text-muted">{COMPANY.hours}</dd></div>
            </dl>
          </div>
          <nav aria-label="Soluciones" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-9 lg:grid-cols-5">
            {CATEGORIES.map((cat) => (
              <div key={cat.id}>
                <Link to={`/soluciones?s=${cat.id}`} className="font-display text-[0.98rem] font-semibold leading-snug text-ink hover:text-corp">{cat.name}</Link>
                <ul className="mt-4 space-y-2.5 text-small">
                  {servicesOf(cat.id).map((s) => <li key={s.slug}><Link to={`/soluciones/${s.slug}`} className="text-body hover:text-corp">{s.name}</Link></li>)}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-6 text-label text-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {COMPANY.name} · Registro REPSE ante la STPS</p>
          <nav aria-label="Empresa" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/industrias" className="hover:text-ink">Industrias</Link>
            <Link to="/proyectos" className="hover:text-ink">Proyectos</Link>
            <Link to="/nosotros" className="hover:text-ink">Nosotros</Link>
            <Link to="/contacto" className="hover:text-ink">Contacto</Link>
            <Link to="/aviso-de-privacidad" className="hover:text-ink">Aviso de privacidad</Link>
          </nav>
        </div>
        <p className="mt-4 text-label text-muted">Las imágenes marcadas como referencia son visualizaciones y los casos de proyecto son demostrativos; no corresponden a proyectos realizados.</p>
      </div>
    </footer>
  )
}
