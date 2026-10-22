import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { splitLocale } from '../../i18n/config'
import { cn, waLink } from '../../lib/utils'

/**
 * Acceso fijo a WhatsApp, sólo en escritorio (en teléfonos y tabletas el header ya trae «Cotizar» y el menú trae
 * WhatsApp, así nada flotante tapa el contenido). Aparece al pasar la primera pantalla y se oculta al llegar al footer
 * (que ya tiene los datos de contacto) y mientras un cotizador o el explorador están en pantalla (<html data-cotizador>).
 * No aparece en Contacto.
 */
export function WhatsAppButton() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const { path } = splitLocale(pathname)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const footer = document.querySelector('footer')
    let nearFooter = false
    const update = () => setShown(window.scrollY > window.innerHeight * 0.75 && !nearFooter)
    const io = footer && typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([e]) => { nearFooter = e.isIntersecting; update() })
      : null
    if (footer) io?.observe(footer)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => { window.removeEventListener('scroll', update); io?.disconnect() }
  }, [pathname])
  if (path === '/contacto') return null
  return (
    <a
      href={waLink(t.wa.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.common.writeWhatsapp}
      aria-hidden={!shown || undefined}
      tabIndex={shown ? undefined : -1}
      className={cn(
        'fixed z-40 hidden items-center gap-2 rounded-full bg-[#15803D] px-5 py-3.5 text-white shadow-[0_6px_20px_rgba(8,29,54,0.28)] transition-[opacity,transform,background-color,visibility] duration-200 hover:bg-[#0F6B32] lg:inline-flex [html[data-cotizador]_&]:pointer-events-none [html[data-cotizador]_&]:invisible [html[data-cotizador]_&]:translate-y-3 [html[data-cotizador]_&]:opacity-0',
        !shown && 'pointer-events-none invisible translate-y-3 opacity-0',
      )}
      style={{ right: 'max(1.25rem, env(safe-area-inset-right))', bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
    >
      <MessageCircle aria-hidden className="h-5 w-5" strokeWidth={2} />
      <span className="text-[0.95rem] font-medium">{t.common.whatsapp}</span>
    </a>
  )
}
