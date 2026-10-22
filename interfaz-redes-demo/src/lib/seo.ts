import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { COMPANY } from '../data/company'
import { fullTitle, type Seo } from '../data/seo'
import { INDEXED_LOCALES, LOCALE_META, localize, splitLocale, type Locale } from '../i18n/config'

export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) || COMPANY.site).replace(/\/$/, '')

/**
 * Versiones de una página en otros idiomas (hreflang). Sólo entre idiomas indexados y si hay al menos dos; la
 * versión x-default es la española. `base` es la ruta sin prefijo de idioma.
 */
export function alternates(site: string, base: string): { lang: string; href: string }[] {
  if (INDEXED_LOCALES.length < 2) return []
  const url = (l: Locale) => site + (localize(base, l) === '/' ? '/' : localize(base, l))
  return [...INDEXED_LOCALES.map((l) => ({ lang: LOCALE_META[l].htmlLang, href: url(l) })), { lang: 'x-default', href: url('es') }]
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Título, descripción, canonical, hreflang y Open Graph por página (textos en los diccionarios y en src/data/seo.ts).
 * `noindex` (404, casos demostrativos, borradores): pide no indexarla y no declara canonical ni hreflang. Las páginas
 * de un idioma cuya traducción no se ha revisado tampoco se indexan (LOCALE_META.reviewed). El prerender escribe lo
 * mismo en el HTML; esto lo mantiene al navegar dentro del sitio.
 */
export function useSeo({ title, description }: Seo, { noindex = false }: { noindex?: boolean } = {}) {
  const { pathname } = useLocation()
  useEffect(() => {
    const { locale, path: base } = splitLocale(pathname)
    const hide = noindex || !LOCALE_META[locale].reviewed
    if (hide) setMeta('meta[name="robots"]', 'name', 'robots', 'noindex')
    else document.head.querySelector('meta[name="robots"]')?.remove()
    const full = fullTitle(title)
    document.title = full
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', full)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', LOCALE_META[locale].ogLocale)
    const url = SITE_URL + (pathname === '/' ? '/' : pathname)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => l.remove())
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (hide) {
      link?.remove()
      return
    }
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url
    for (const alt of alternates(SITE_URL, base)) {
      const l = document.createElement('link')
      l.rel = 'alternate'
      l.hreflang = alt.lang
      l.href = alt.href
      document.head.appendChild(l)
    }
  }, [title, description, pathname, noindex])
}
