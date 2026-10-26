import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { publishedResources } from '../../content/recursos'
import { COMPANY } from '../../data/company'
import { useI18n } from '../../i18n'
import { LOCALE_META, LOCALES, localize, splitLocale } from '../../i18n/config'
import { Link } from '../../i18n/Link'
import { copyText } from '../../lib/utils'
import { Logo } from './Logo'

export function CopyValue({ value, label, dark, href }: { value: string; label: string; dark?: boolean; href?: string }) {
  const { t } = useI18n()
  const [ok, setOk] = useState(false)
  return (
    <span className="inline-flex items-center gap-2">
      {/* Blancos táctiles de al menos 24 × 24 px (WCAG 2.2, 2.5.8): enlace y botón quedan uno junto al otro. */}
      {href ? <a href={href} className={`inline-flex min-h-[24px] items-center ${dark ? 'hover:text-white' : 'hover:text-corp'}`}>{value}</a> : <span className="select-all">{value}</span>}
      <button
        type="button"
        aria-label={t.common.copy(label)}
        onClick={async () => { if (await copyText(value)) { setOk(true); window.setTimeout(() => setOk(false), 1600) } }}
        className={`-my-1 grid h-6 w-6 shrink-0 place-items-center ${dark ? 'text-white/40 hover:text-white' : 'text-faint hover:text-corp'}`}
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
      <div className="container pb-24 pt-16 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
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
        <div className="mt-16 grid gap-6 border-t border-line pt-6 text-label text-muted md:grid-cols-[1fr_auto] md:items-center">
          <nav aria-label={t.footer.companyNav} className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/industrias" className="hover:text-ink">{t.nav.industries}</Link>
            <Link to="/proyectos" className="hover:text-ink">{t.nav.projects}</Link>
            <Link to="/explorador" className="hover:text-ink">{t.nav.explorer}</Link>
            {publishedResources().length > 0 && <Link to="/recursos" className="hover:text-ink">{t.nav.resources}</Link>}
            <Link to="/nosotros" className="hover:text-ink">{t.nav.about}</Link>
            <Link to="/contacto" className="hover:text-ink">{t.nav.contact}</Link>
            <Link to="/aviso-de-privacidad" className="hover:text-ink">{t.footer.privacy}</Link>
          </nav>
          <nav aria-label={t.footer.languages}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LOCALES.map((l) => (
                <li key={l}>
                  <a href={localize(path, l)} hrefLang={LOCALE_META[l].htmlLang} lang={LOCALE_META[l].htmlLang} aria-current={l === locale ? 'true' : undefined} className={l === locale ? 'font-medium text-ink' : 'hover:text-ink'}>{LOCALE_META[l].label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-6 text-label text-muted">{t.footer.rights(new Date().getFullYear(), COMPANY.name)}</p>
        {!meta.reviewed && <p className="mt-2 text-label text-muted">{t.common.translationReview}</p>}
      </div>
    </footer>
  )
}
