// Google Analytics 4 opcional. Sólo se carga si VITE_GA_ID tiene valor.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
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

/** Evento de medición. Sin GA configurado no hace nada. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (!GA_ID) return
  load()
  window.gtag?.('event', event, params)
}

/** Registra page_view en cada cambio de ruta. */
export function usePageViews() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    if (!GA_ID) return
    load()
    window.gtag?.('event', 'page_view', { page_path: pathname + search, page_location: window.location.href, page_title: document.title })
  }, [pathname, search])
}

/** Escucha clics en enlaces de WhatsApp, teléfono y correo en todo el sitio. */
export function useContactClicks() {
  useEffect(() => {
    if (!GA_ID) return
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      if (!a) return
      const href = a.getAttribute('href') || ''
      if (href.startsWith('https://wa.me/')) track('contact_whatsapp', { link_text: a.textContent?.trim().slice(0, 60), page_path: window.location.pathname })
      else if (href.startsWith('mailto:')) track('contact_email', { page_path: window.location.pathname })
      else if (href.startsWith('tel:')) track('contact_phone', { page_path: window.location.pathname })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}
