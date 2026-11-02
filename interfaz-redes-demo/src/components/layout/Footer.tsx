import { Check, Copy, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { publishedResources } from '../../content/recursos'
import { COMPANY } from '../../data/company'
import { useI18n } from '../../i18n'
import { LOCALE_META, LOCALES, localize, splitLocale } from '../../i18n/config'
import { Link } from '../../i18n/Link'
import { copyText, waLink } from '../../lib/utils'
import { Logo } from './Logo'

export function CopyValue({ value, label, dark, href }: { value: string; label: string; dark?: boolean; href?: string }) {
  const { t } = useI18n()
  const [ok, setOk] = useState(false)
  return (
    <span className="inline-flex items-center gap-2 max-md:max-w-full">
      {/* Blancos táctiles de al menos 24 × 24 px (WCAG 2.2, 2.5.8): enlace y botón quedan uno junto al otro. */}
      {href ? <a href={href} className={`inline-flex min-h-[24px] items-center ${dark ? 'hover:text-white' : 'hover:text-corp'}`}>{value}</a> : <span className="select-all max-md:min-w-0 max-md:break-all">{value}</span>}
      <button
        type="button"
        aria-label={t.common.copy(label)}
        onClick={async () => { if (await copyText(value)) { setOk(true); window.setTimeout(() => setOk(false), 1600) } }}
        className={`-my-1 grid h-6 w-6 shrink-0 place-items-center max-md:-my-2.5 max-md:-ml-2.5 max-md:h-11 max-md:w-11 ${dark ? 'text-white/40 hover:text-white' : 'text-faint hover:text-corp'}`}
      >
        {ok ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <span aria-live="polite" className="sr-only">{ok ? t.common.copied : ''}</span>
    </span>
  )
}

export function Footer() {
  const { t, c, locale, meta } = useI18n()
  const { path } = splitLocale(useLocation().pathname)
  return (
    <footer className="border-t border-line bg-white">
      <div className="container pb-9 pt-14 md:pb-24 md:pt-20">
        {/* Teléfono: jerarquía propia. Identidad, acciones directas, servicios plegados por frente y enlaces. */}
        <div className="md:hidden">
          <div className="flex items-center gap-3">
            <Logo size="sm" className="!h-[60px]" />
            <p className="font-display text-[1.05rem] font-semibold leading-tight text-ink">{COMPANY.name}</p>
          </div>
          <p className="mt-4 text-small text-body">{t.footer.tagline}</p>
          <ul className="mt-7 divide-y divide-line border-y border-line text-[0.98rem] text-ink">
            <li><a href={waLink(t.wa.general)} target="_blank" rel="noopener noreferrer" className="flex min-h-[54px] items-center gap-3 font-medium"><MessageCircle aria-hidden className="h-[18px] w-[18px] text-corp" strokeWidth={1.75} />WhatsApp<span className="ml-auto font-normal text-muted">{COMPANY.whatsappDisplay}</span></a></li>
            <li><a href={`tel:${COMPANY.phoneAlt.intl}`} className="flex min-h-[54px] items-center gap-3 font-medium"><Phone aria-hidden className="h-[18px] w-[18px] text-corp" strokeWidth={1.75} />{t.contact.call}<span className="ml-auto font-normal text-muted">{COMPANY.phoneAlt.display}</span></a></li>
            <li><a href={`mailto:${COMPANY.email}`} className="flex min-h-[54px] items-center gap-3 font-medium"><Mail aria-hidden className="h-[18px] w-[18px] shrink-0 text-corp" strokeWidth={1.75} /><span className="min-w-0 break-all font-normal text-ink">{COMPANY.email}</span></a></li>
            <li><Link to="/" className="flex min-h-[54px] items-center gap-3 font-normal"><Globe aria-hidden className="h-[18px] w-[18px] text-corp" strokeWidth={1.75} />{new URL(COMPANY.site).hostname}</Link></li>
            <li className="flex gap-3 py-3.5 text-small text-body"><MapPin aria-hidden className="mt-0.5 h-[18px] w-[18px] shrink-0 text-corp" strokeWidth={1.75} /><span>{COMPANY.address}<span className="mt-0.5 block text-muted">{t.company.hours}</span></span></li>
          </ul>
          <nav aria-label={t.footer.solutionsNav} className="mt-8">
            {c.categories.map((cat) => (
              <details key={cat.id} name="footer" className="border-b border-line">
                <summary className="flex min-h-[54px] cursor-pointer list-none items-center justify-between gap-4 font-display text-[1.02rem] font-semibold text-ink">{cat.name}<span aria-hidden className="m-sign" /></summary>
                <ul className="pb-3">
                  {c.servicesOf(cat.id).map((s) => <li key={s.slug}><Link to={`/soluciones/${s.slug}`} className="m-tap text-[0.98rem] text-body">{s.name}</Link></li>)}
                </ul>
              </details>
            ))}
          </nav>
        </div>
        <div className="grid gap-12 max-md:hidden lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Logo size="lg" />
            <p className="mt-4 font-display text-[1.05rem] font-semibold text-ink">{COMPANY.name}</p>
            <p className="mt-2 max-w-sm text-small text-body">{t.footer.tagline}</p>
            <dl className="mt-8 space-y-4 text-small">
              <div><dt className="text-muted">{t.footer.phone}</dt><dd className="mt-0.5 font-medium text-ink"><CopyValue value={COMPANY.whatsappDisplay} label={t.footer.phone} href={`tel:${COMPANY.phoneIntl}`} /></dd><dd className="text-muted"><a href={`tel:${COMPANY.phoneAlt.intl}`} className="inline-flex min-h-[24px] items-center hover:text-corp">{COMPANY.phoneAlt.display}</a></dd></div>
              <div><dt className="text-muted">{t.footer.email}</dt><dd className="mt-0.5 break-all font-medium text-ink"><CopyValue value={COMPANY.email} label={t.footer.email} href={`mailto:${COMPANY.email}`} /></dd><dd className="break-all text-muted"><a href={`mailto:${COMPANY.emailAlt}`} className="inline-flex min-h-[24px] items-center hover:text-corp">{COMPANY.emailAlt}</a></dd></div>
              <div><dt className="text-muted">{t.footer.office}</dt><dd className="mt-0.5 text-ink">{COMPANY.address}</dd><dd className="text-muted">{t.company.hours}</dd></div>
            </dl>
          </div>
          <nav aria-label={t.footer.solutionsNav} className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-9 lg:grid-cols-5">
            {c.categories.map((cat) => (
              <div key={cat.id}>
                <Link to={`/soluciones#${cat.id}`} className="font-display text-[0.98rem] font-semibold leading-snug text-ink hover:text-corp">{cat.name}</Link>
                <ul className="mt-4 space-y-2.5 text-small">
                  {c.servicesOf(cat.id).map((s) => <li key={s.slug}><Link to={`/soluciones/${s.slug}`} className="text-body hover:text-corp">{s.name}</Link></li>)}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-7 grid gap-5 text-label text-muted md:mt-16 md:grid-cols-[1fr_auto] md:items-center md:gap-6 md:border-t md:border-line md:pt-6">
          <nav aria-label={t.footer.companyNav} className="grid grid-cols-2 gap-x-6 max-md:text-[0.95rem] max-md:[&>a]:flex max-md:[&>a]:min-h-[44px] max-md:[&>a]:items-center md:flex md:flex-wrap md:gap-y-2">
            <Link to="/industrias" className="hover:text-ink">{t.nav.industries}</Link>
            <Link to="/proyectos" className="hover:text-ink">{t.nav.projects}</Link>
            <Link to="/explorador" className="hover:text-ink">{t.nav.explorer}</Link>
            {publishedResources().length > 0 && <Link to="/recursos" className="hover:text-ink">{t.nav.resources}</Link>}
            <Link to="/nosotros" className="hover:text-ink">{t.nav.about}</Link>
            <Link to="/contacto" className="hover:text-ink">{t.nav.contact}</Link>
            <Link to="/aviso-de-privacidad" className="hover:text-ink">{t.footer.privacy}</Link>
          </nav>
          <nav aria-label={t.footer.languages}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 max-md:justify-between max-md:gap-x-3 max-md:border-y max-md:border-line max-md:text-[0.95rem] max-md:[&_a]:flex max-md:[&_a]:min-h-[48px] max-md:[&_a]:items-center">
              {LOCALES.map((l) => (
                <li key={l}>
                  <a href={localize(path, l)} hrefLang={LOCALE_META[l].htmlLang} lang={LOCALE_META[l].htmlLang} aria-current={l === locale ? 'true' : undefined} className={l === locale ? 'font-medium text-ink' : 'hover:text-ink'}>{LOCALE_META[l].label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-5 text-label text-muted md:mt-6">{t.footer.rights(new Date().getFullYear(), COMPANY.name)}</p>
        {!meta.reviewed && <p className="mt-2 text-label text-muted">{t.common.translationReview}</p>}
      </div>
    </footer>
  )
}
