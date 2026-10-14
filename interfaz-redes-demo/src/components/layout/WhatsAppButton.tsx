import { MessageCircle } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { WA_GENERAL } from '../../lib/utils'

/**
 * Acceso fijo a WhatsApp en la esquina inferior derecha. No aparece en Contacto, y se oculta
 * mientras un cotizador está en pantalla (el cotizador marca <html data-cotizador> y ya tiene
 * su propio envío por WhatsApp), para no tapar sus botones.
 */
export function WhatsAppButton() {
  const { pathname } = useLocation()
  if (pathname === '/contacto') return null
  return (
    <a
      href={WA_GENERAL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hablar por WhatsApp con un especialista"
      className="fixed z-40 inline-flex items-center gap-2 rounded-full bg-[#15803D] p-4 text-white shadow-[0_6px_20px_rgba(8,29,54,0.28)] transition-[opacity,transform,background-color] duration-200 hover:bg-[#0F6B32] sm:px-5 sm:py-3.5 [html[data-cotizador]_&]:pointer-events-none [html[data-cotizador]_&]:translate-y-3 [html[data-cotizador]_&]:opacity-0"
      style={{ right: 'max(1rem, env(safe-area-inset-right))', bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <MessageCircle aria-hidden className="h-6 w-6 sm:h-5 sm:w-5" strokeWidth={2} />
      <span className="hidden text-[0.95rem] font-medium sm:inline">WhatsApp</span>
    </a>
  )
}
