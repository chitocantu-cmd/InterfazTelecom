// Medición comercial. Los eventos van a window.dataLayer (formato de Google Tag Manager) y, si VITE_GA_ID tiene
// valor, a Google Analytics 4. Sin VITE_GA_ID no se descarga ningún script de terceros.
// Regla: ningún evento lleva datos personales (nombre, correo, teléfono, empresa ni texto escrito por el usuario);
// sólo ids de servicio, escenario, idioma, página y estado. La lista completa está en ARQUITECTURA_INTERFAZ.md.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { splitLocale } from '../i18n/config'

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
}

/** Eventos del sitio y sus parámetros (sin datos personales). */
export interface Events {
  /** Clic en un botón o enlace que lleva al cotizador. `ubicacion`: dónde estaba (hero, header, servicio…). */
  quote_cta: { ubicacion: string }
  /** El usuario empezó a llenar el cotizador (primer cambio). */
  quote_start: { origen: string; tipos: string }
  /** Avanzó de paso en el cotizador. */
  quote_step: { paso: number }
  /** Solicitud enviada: `formulario` (recibida por el servidor), `whatsapp` o `email` (envío manual). */
  generate_lead: { method: 'formulario' | 'whatsapp' | 'email'; need: string; idioma: string; explorador: boolean }
  /** El servidor rechazó o no pudo entregar la solicitud. */
  quote_error: { codigo: string }
  /** Visita a la página de un servicio. */
  service_view: { servicio: string }
  /** Uso del explorador de soluciones. */
  explorer_step: { paso: number; escenario: string }
  explorer_complete: { escenario: string; servicios: number }
  explorer_to_quote: { escenario: string }
  /** Cambio de idioma con el selector. */
  language_change: { de: string; a: string }
  /** Visita a la página de un proyecto. */
  project_view: { proyecto: string; estado: string }
  /** Descarga de un documento autorizado. */
  file_download: { archivo: string }
  contact_whatsapp: { page_path: string }
  contact_email: { page_path: string }
  contact_phone: { page_path: string }
}

let loaded = false
function load() {
  if (loaded || !GA_ID || typeof window === 'undefined') return
  loaded = true
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer!.push(arguments) } // eslint-disable-line prefer-rest-params
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
}

const lang = () => (typeof window === 'undefined' ? 'es' : splitLocale(window.location.pathname).locale)

/** Registra un evento. Sin GA configurado sólo queda en window.dataLayer (para Tag Manager, si se agrega). */
export function track<K extends keyof Events>(event: K, params: Events[K]) {
  if (typeof window === 'undefined') return
  const data = { ...params, idioma_sitio: lang() }
  window.dataLayer = window.dataLayer || []
  if (!GA_ID) {
    window.dataLayer.push({ event, ...data })
    return
  }
  load()
  window.gtag?.('event', event, data)
}

/** Registra page_view en cada cambio de ruta. */
export function usePageViews() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    if (!GA_ID) return
    load()
    window.gtag?.('event', 'page_view', { page_path: pathname + search, page_location: window.location.href, page_title: document.title, idioma_sitio: lang() })
  }, [pathname, search])
}

/**
 * Escucha clics en todo el sitio: enlaces de WhatsApp, teléfono y correo, y cualquier elemento con
 * data-track-cta="<ubicación>" (botones que llevan al cotizador).
 */
export function useContactClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target : null
      const cta = el?.closest<HTMLElement>('[data-track-cta]')
      if (cta) track('quote_cta', { ubicacion: cta.dataset.trackCta ?? '' })
      const a = el?.closest('a')
      if (!a) return
      const href = a.getAttribute('href') || ''
      const page_path = window.location.pathname
      if (href.startsWith('https://wa.me/')) track('contact_whatsapp', { page_path })
      else if (href.startsWith('mailto:')) track('contact_email', { page_path })
      else if (href.startsWith('tel:')) track('contact_phone', { page_path })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}
