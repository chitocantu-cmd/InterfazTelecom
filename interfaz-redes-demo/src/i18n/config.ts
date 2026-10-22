// Idiomas del sitio. El español es el principal y vive en la raíz (/soluciones), para conservar las direcciones que
// ya están indexadas y los enlaces de campañas; los demás llevan prefijo (/en/soluciones, /ko/…, /zh-CN/…).
// Lo usan la app, el prerender (un HTML por idioma y ruta) y la función del servidor (acuse en el idioma del cliente).

export const LOCALES = ['es', 'en', 'ko', 'zh-CN'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'es'

export interface LocaleMeta {
  /** Nombre del idioma en ese idioma (selector). */
  label: string
  /** Abreviatura del selector. */
  short: string
  /** Atributo lang del documento y hreflang. */
  htmlLang: string
  /** og:locale */
  ogLocale: string
  /** Prefijo de las rutas ('' para el español). */
  prefix: string
  /**
   * Traducción revisada por una persona con dominio del idioma y del tema. Mientras sea `false`, las páginas de ese
   * idioma se publican con noindex, fuera del sitemap y de hreflang, y muestran el aviso de traducción en revisión.
   */
  reviewed: boolean
  /** Sugerencia de cambio de idioma, escrita en ese idioma (LanguageSuggestion). */
  switchPrompt: string
  dismissLabel: string
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  es: { label: 'Español', short: 'ES', htmlLang: 'es-MX', ogLocale: 'es_MX', prefix: '', reviewed: true, switchPrompt: 'Ver esta página en español', dismissLabel: 'Cerrar' },
  en: { label: 'English', short: 'EN', htmlLang: 'en', ogLocale: 'en_US', prefix: '/en', reviewed: false, switchPrompt: 'View this page in English', dismissLabel: 'Close' },
  ko: { label: '한국어', short: 'KO', htmlLang: 'ko', ogLocale: 'ko_KR', prefix: '/ko', reviewed: false, switchPrompt: '이 페이지를 한국어로 보기', dismissLabel: '닫기' },
  'zh-CN': { label: '简体中文', short: '中文', htmlLang: 'zh-CN', ogLocale: 'zh_CN', prefix: '/zh-CN', reviewed: false, switchPrompt: '以简体中文查看此页面', dismissLabel: '关闭' },
}

export const isLocale = (v: unknown): v is Locale => typeof v === 'string' && (LOCALES as readonly string[]).includes(v)

/** Separa el idioma de una ruta: '/en/soluciones' → { locale: 'en', path: '/soluciones' }; '/ko' → { 'ko', '/' }. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  for (const locale of LOCALES) {
    const { prefix } = LOCALE_META[locale]
    if (!prefix) continue
    if (pathname === prefix || pathname === `${prefix}/`) return { locale, path: '/' }
    if (pathname.startsWith(`${prefix}/`)) return { locale, path: pathname.slice(prefix.length) }
  }
  return { locale: DEFAULT_LOCALE, path: pathname || '/' }
}

/**
 * Dirección de una ruta en el idioma indicado. Acepta ?consulta y #ancla:
 * ('/soluciones#fibra', 'en') → '/en/soluciones#fibra'; ('/', 'ko') → '/ko'; ('/?a=1', 'en') → '/en?a=1'.
 */
export function localize(to: string, locale: Locale): string {
  const { prefix } = LOCALE_META[locale]
  if (!prefix || !to.startsWith('/')) return to
  if (to === '/') return prefix
  if (to.startsWith('/?') || to.startsWith('/#')) return prefix + to.slice(1)
  return prefix + to
}

/** Idiomas que se indexan (y entran a hreflang y al sitemap). */
export const INDEXED_LOCALES = LOCALES.filter((l) => LOCALE_META[l].reviewed)

/** Idioma preferido guardado en el navegador (selector de idioma). */
export const LOCALE_STORAGE_KEY = 'idioma'
