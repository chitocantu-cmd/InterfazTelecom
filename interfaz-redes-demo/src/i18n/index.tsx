// Idioma activo y sus textos. El idioma sale de la ruta (/en/…, /ko/…, /zh-CN/…; sin prefijo, español). El español
// viaja en el paquete principal; los demás idiomas se descargan sólo cuando se visitan (loadLocale) y main.tsx los
// carga antes de tomar el HTML prerenderizado, para que el primer render coincida con el del servidor.
import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { LOCALE_META, localize, splitLocale, type Locale, type LocaleMeta } from './config'
import { buildContent, type Content, type ContentTranslation } from './content'
import es, { type Messages } from './messages/es'

/** Lo que exporta cada archivo de src/i18n/locales/. */
export interface LocaleBundle { messages: Messages; content: ContentTranslation }

export interface I18n {
  locale: Locale
  meta: LocaleMeta
  /** Textos de la interfaz. */
  t: Messages
  /** Catálogo (servicios, industrias, proyectos…) en el idioma activo. */
  c: Content
  /** Ruta en el idioma activo: lp('/soluciones') → '/en/soluciones'. */
  lp: (to: string) => string
}

const make = (locale: Locale, messages: Messages, content: Content): I18n => ({ locale, meta: LOCALE_META[locale], t: messages, c: content, lp: (to) => localize(to, locale) })

const loaded: Partial<Record<Locale, I18n>> = { es: make('es', es, buildContent()) }
const pending: Partial<Record<Locale, Promise<void>>> = {}
/** Traducción del catálogo tal como llegó (el prerender revisa que esté completa). */
const translations: Partial<Record<Locale, ContentTranslation>> = {}

const IMPORTERS: Record<Exclude<Locale, 'es'>, () => Promise<{ default: LocaleBundle }>> = {
  en: () => import('./locales/en'),
  ko: () => import('./locales/ko'),
  'zh-CN': () => import('./locales/zh-CN'),
}

/** Descarga los textos de un idioma (una sola vez). */
export function loadLocale(locale: Locale): Promise<void> {
  if (loaded[locale]) return Promise.resolve()
  return (pending[locale] ??= IMPORTERS[locale as Exclude<Locale, 'es'>]()
    .then(({ default: b }) => {
      translations[locale] = b.content
      loaded[locale] = make(locale, b.messages, buildContent(b.content))
    })
    .catch((e) => {
      delete pending[locale]
      throw e
    }))
}

/** Textos de un idioma ya cargado (el prerender los carga todos antes de dibujar). */
export function i18nFor(locale: Locale): I18n {
  const value = loaded[locale]
  if (!value) throw new Error(`Idioma sin cargar: ${locale}`)
  return value
}

/** Traducción del catálogo de un idioma ya cargado (undefined en español, que es la fuente). */
export const translationFor = (locale: Locale) => translations[locale]

const I18nContext = createContext<I18n>(loaded.es!)

/**
 * Da a toda la app el idioma de la ruta. Si ese idioma aún no se descargó (al volver con «Atrás» a una página en
 * otro idioma), suspende hasta tenerlo; el selector de idioma lo descarga antes de navegar.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { locale } = splitLocale(pathname)
  const value = loaded[locale]
  if (!value) throw loadLocale(locale)
  return (
    <I18nContext.Provider value={value}>
      <DocumentLang lang={value.meta.htmlLang} />
      {children}
    </I18nContext.Provider>
  )
}

/** Mantiene <html lang> al cambiar de idioma sin recargar (el prerender ya lo escribe en el HTML). */
function DocumentLang({ lang }: { lang: string }) {
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  return null
}

export const useI18n = () => useContext(I18nContext)
export const useT = () => useContext(I18nContext).t
export const useContent = () => useContext(I18nContext).c

export type { Messages }
