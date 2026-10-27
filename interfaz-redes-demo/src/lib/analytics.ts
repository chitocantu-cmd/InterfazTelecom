// Medición comercial. Los eventos van a window.dataLayer (formato de Google Tag Manager) y, si VITE_GA_ID tiene
// valor, a Google Analytics 4. Sin VITE_GA_ID no se descarga ningún script de terceros.
// Regla: ningún evento lleva datos personales (nombre, correo, teléfono, empresa ni texto escrito por el usuario);
// sólo ids de servicio, escenario, idioma, página y estado. La lista completa está en ARQUITECTURA_INTERFAZ.md.
import { useEffect } from 'react'
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
  /**
   * Cotización recibida y registrada: sólo cuando el servidor la acepta y le asigna folio (una vez por folio). El folio
   * permite cruzar el contacto con lo que pasó después en ventas. `servicio`: el servicio desde el que se pidió (si
   * hubo uno); `origen`: dónde estaba el cotizador; `municipio`: el reconocido en «Ubicación» (src/data/municipios.ts).
   */
  generate_lead: { method: 'formulario'; folio: string; tipos: string; servicio: string; origen: string; municipio: string; idioma: string; explorador: boolean }
  /**
   * El visitante abrió WhatsApp o su correo con la solicitud ya escrita (envío manual). No es una cotización recibida:
   * no se sabe si la envió.
   */
  quote_handoff: { method: 'whatsapp' | 'email'; tipos: string; origen: string }
  /** El servidor rechazó o no pudo entregar la solicitud. */
  quote_error: { codigo: string }
  /** Visita a la página de un servicio. */
  service_view: { servicio: string }
  /** Uso del explorador de soluciones. */
  explorer_step: { paso: number; escenario: string }
  explorer_complete: { escenario: string; servicios: number }
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
/**
 * Prepara GA4 y registra la página de entrada con su URL y título de este momento. El script de Google (≈175 KB) se
 * descarga después, cuando la página terminó de cargar y el navegador está libre, para que no compita con la imagen
 * principal ni con la hidratación; mientras, los eventos esperan en dataLayer. Los cambios de página siguientes los
 * registra la medición mejorada de GA4 (ver usePageViews).
 */
function load() {
  if (loaded || !GA_ID || typeof window === 'undefined') return
  loaded = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer!.push(arguments) } // eslint-disable-line prefer-rest-params
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
  const landing = window.location.href
  window.gtag('event', 'page_view', { page_location: landing, page_title: document.title })
  const add = () => {
    // Si ya cambió de página, ese cambio pasó antes de que GA4 escuchara el historial: se registra aquí.
    if (window.location.href !== landing) window.gtag?.('event', 'page_view', { page_location: window.location.href, page_title: document.title })
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(s)
  }
  // Safari no tiene requestIdleCallback.
  const idle = () => (typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(add, { timeout: 2000 }) : window.setTimeout(add, 600))
  if (document.readyState === 'complete') idle()
  else window.addEventListener('load', idle, { once: true })
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

/**
 * Prepara GA4 al abrir el sitio. Páginas vistas: la de entrada, en load(); cada cambio de ruta, la medición mejorada
 * de GA4 («cambios de página según el historial del navegador», activa por defecto), que toma la URL y el título ya
 * actualizados. Mandarlas también desde aquí las duplicaba y llevaban el título de la página anterior. De los cambios
 * de página anteriores a que llegue el script de Google (primeros segundos) sólo se registra el último.
 */
export function usePageViews() {
  useEffect(() => { load() }, [])
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
