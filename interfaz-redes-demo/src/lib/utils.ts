import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { COMPANY } from '../data/company'

export const cn = (...c: (string | number | false | null | undefined)[]) => c.filter((x) => typeof x === 'string' && x).join(' ')

export const waLink = (text: string) => `https://wa.me/${COMPANY.whatsappIntl}?text=${encodeURIComponent(text)}`
export const mailLink = (subject: string, body: string) =>
  `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

export const WA_GENERAL = waLink('Hola, quiero hablar con un especialista de Interfaz Redes sobre un proyecto de infraestructura.')

/** Lleva la vista arriba al cambiar de ruta (o a la sección indicada por ?s=). */
export function useScrollToTop() {
  const { pathname, search } = useLocation()
  const target = new URLSearchParams(search).get('s')
  useEffect(() => {
    if (target) {
      const t = window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
      return () => window.clearTimeout(t)
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, target])
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
