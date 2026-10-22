// Selector de idioma: muestra el nombre de cada idioma (no banderas), conserva la página actual y recuerda la
// preferencia. Los enlaces son direcciones reales (/en/…), así que también funcionan sin JavaScript y se pueden
// compartir. Además, una sugerencia discreta ofrece el idioma del navegador cuando no coincide con el de la página.
import { Check, ChevronDown, Globe, X } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadLocale, useI18n } from '../../i18n'
import { LOCALE_META, LOCALE_STORAGE_KEY, LOCALES, localize, splitLocale, type Locale } from '../../i18n/config'
import { track } from '../../lib/analytics'
import { cn, useHydrated } from '../../lib/utils'

/** Cambia de idioma conservando la página, la consulta y el ancla; descarga el idioma antes de navegar. */
function useSwitchLocale() {
  const { locale } = useI18n()
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const { path } = splitLocale(pathname)
  // La consulta y el ancla se agregan al terminar de hidratar: el HTML prerenderizado no las conoce.
  const hydrated = useHydrated()
  const hrefFor = (l: Locale) => localize(path, l) + (hydrated ? search + hash : '')
  const go = (l: Locale, e?: MouseEvent) => {
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return // abrir en otra pestaña: lo hace el navegador
    e?.preventDefault()
    try { localStorage.setItem(LOCALE_STORAGE_KEY, l) } catch { /* almacenamiento bloqueado: sólo no se recuerda */ }
    if (l === locale) return
    track('language_change', { de: locale, a: l })
    loadLocale(l)
      .then(() => navigate(hrefFor(l)))
      .catch(() => { window.location.href = hrefFor(l) })
  }
  return { locale, hrefFor, go }
}

export function LanguageSelector({ variant = 'header' }: { variant?: 'header' | 'menu' }) {
  const { t } = useI18n()
  const { locale, hrefFor, go } = useSwitchLocale()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); button.current?.focus() } }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  if (variant === 'menu') {
    return (
      <nav aria-label={t.lang.label}>
        <p className="text-small text-muted">{t.lang.label}</p>
        <ul className="mt-2 grid grid-cols-2 gap-2">
          {LOCALES.map((l) => (
            <li key={l}>
              <a
                href={hrefFor(l)}
                hrefLang={LOCALE_META[l].htmlLang}
                lang={LOCALE_META[l].htmlLang}
                aria-current={l === locale ? 'true' : undefined}
                onClick={(e) => go(l, e)}
                className={cn('flex min-h-[44px] items-center justify-between rounded-[2px] border px-3.5 text-[0.98rem] transition-colors', l === locale ? 'border-corp bg-corp text-white' : 'border-line text-ink hover:border-corp')}
              >
                {LOCALE_META[l].label}
                <span className={cn('mono-tag', l === locale ? 'text-white/70' : 'text-muted')}>{LOCALE_META[l].short}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <div ref={wrap} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="selector-idioma"
        aria-label={`${t.lang.change}: ${LOCALE_META[locale].label}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
            requestAnimationFrame(() => wrap.current?.querySelector<HTMLAnchorElement>('#selector-idioma a')?.focus())
          }
        }}
        className="flex h-11 items-center gap-1.5 rounded-[2px] px-2.5 text-[0.92rem] text-body transition-colors hover:text-ink"
      >
        <Globe aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.6} />
        <span className="font-medium">{LOCALE_META[locale].short}</span>
        <ChevronDown aria-hidden className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')} strokeWidth={1.75} />
      </button>
      <div
        id="selector-idioma"
        hidden={!open}
        className="absolute right-0 top-full mt-2 w-56 border border-line bg-white py-1.5 shadow-[0_18px_36px_-18px_rgba(8,29,54,0.35)]"
      >
        <p className="px-4 pb-1.5 pt-1 text-label text-muted">{t.lang.label}</p>
        <ul>
          {LOCALES.map((l) => (
            <li key={l}>
              <a
                href={hrefFor(l)}
                hrefLang={LOCALE_META[l].htmlLang}
                lang={LOCALE_META[l].htmlLang}
                aria-current={l === locale ? 'true' : undefined}
                onClick={(e) => { setOpen(false); go(l, e) }}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
                  e.preventDefault()
                  const items = [...(wrap.current?.querySelectorAll<HTMLAnchorElement>('#selector-idioma a') ?? [])]
                  const i = items.indexOf(e.currentTarget)
                  items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus()
                }}
                className={cn('flex items-center justify-between px-4 py-2.5 text-[0.95rem] transition-colors hover:bg-mist focus-visible:bg-mist', l === locale ? 'font-medium text-ink' : 'text-body')}
              >
                <span className="flex items-center gap-2.5">
                  <Check aria-hidden className={cn('h-4 w-4 text-corp', l !== locale && 'invisible')} strokeWidth={2} />
                  {LOCALE_META[l].label}
                </span>
                <span className="mono-tag text-muted">{LOCALE_META[l].short}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Idioma que sugiere el navegador entre los del sitio (o la preferencia guardada). */
function preferredLocale(): Locale | null {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (saved && (LOCALES as readonly string[]).includes(saved)) return saved as Locale
  } catch { /* sin almacenamiento */ }
  for (const lang of navigator.languages ?? [navigator.language]) {
    const l = lang.toLowerCase()
    if (l.startsWith('es')) return 'es'
    if (l.startsWith('en')) return 'en'
    if (l.startsWith('ko')) return 'ko'
    if (l.startsWith('zh')) return 'zh-CN'
  }
  return null
}

const DISMISSED = 'idioma-sugerencia-cerrada'

/**
 * Si la página está en un idioma distinto al preferido, ofrece cambiar (una vez: al cerrarla no vuelve a salir).
 * No redirige por su cuenta: un enlace compartido abre siempre en el idioma del enlace.
 */
export function LanguageSuggestion() {
  const hydrated = useHydrated()
  const { locale, hrefFor, go } = useSwitchLocale()
  const [target, setTarget] = useState<Locale | null>(null)
  useEffect(() => {
    if (!hydrated) return
    try { if (localStorage.getItem(DISMISSED)) return } catch { return }
    const pref = preferredLocale()
    setTarget(pref && pref !== locale ? pref : null)
  }, [hydrated, locale])
  if (!target) return null
  const dismiss = () => {
    try { localStorage.setItem(DISMISSED, '1') } catch { /* sin almacenamiento */ }
    setTarget(null)
  }
  const meta = LOCALE_META[target]
  return (
    <div role="region" aria-label={meta.label} lang={meta.htmlLang} className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-sm sm:border sm:shadow-[0_18px_36px_-18px_rgba(8,29,54,0.35)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <Globe aria-hidden className="h-4 w-4 shrink-0 text-corp" strokeWidth={1.75} />
        <a href={hrefFor(target)} hrefLang={meta.htmlLang} onClick={(e) => { dismiss(); go(target, e) }} className="flex-1 text-[0.92rem] font-medium text-ink link-line">{meta.switchPrompt}</a>
        <button type="button" onClick={dismiss} aria-label={meta.dismissLabel} className="grid h-9 w-9 shrink-0 place-items-center text-muted hover:text-ink"><X aria-hidden className="h-4 w-4" /></button>
      </div>
    </div>
  )
}
