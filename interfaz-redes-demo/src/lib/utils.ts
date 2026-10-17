import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { COMPANY } from '../data/company'

export const cn = (...c: (string | number | false | null | undefined)[]) => c.filter((x) => typeof x === 'string' && x).join(' ')

export const waLink = (text: string) => `https://wa.me/${COMPANY.whatsappIntl}?text=${encodeURIComponent(text)}`
export const mailLink = (subject: string, body: string) =>
  `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

export const WA_GENERAL = waLink('Hola, quiero hablar con un especialista de Interfaz Redes sobre un proyecto de infraestructura.')

/** Nombre a mitad de frase: baja sólo la inicial y respeta siglas («CCTV y videovigilancia», «WiFi empresarial»). */
export const lowerFirst = (name: string) => (/[A-Z].*[A-Z]/.test(name.split(' ')[0]) ? name : name.charAt(0).toLowerCase() + name.slice(1))

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Lleva la vista arriba al cambiar de ruta (o a la sección indicada por ?s=) y pasa ahí el foco del teclado. */
export function useScrollToTop() {
  const { pathname, search, key } = useLocation()
  const target = new URLSearchParams(search).get('s')
  const firstRender = useRef(true)
  useEffect(() => {
    const initial = firstRender.current
    firstRender.current = false
    if (target) {
      const t = window.setTimeout(() => scrollToId(target), 60)
      return () => window.clearTimeout(t)
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
    // Al navegar, el foco va al contenido para que el teclado y los lectores de pantalla empiecen por la página nueva.
    if (!initial) document.getElementById('contenido')?.focus({ preventScroll: true })
    // `key` cambia con cada clic: un enlace ?s= a la sección actual vuelve a desplazarse.
  }, [pathname, target, target ? key : null])
}

/** Desplaza hasta la sección y le pasa el foco del teclado (sin animación si el usuario pidió reducir el movimiento). */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  if (!el.hasAttribute('tabindex')) {
    el.setAttribute('tabindex', '-1')
    el.classList.add('outline-none')
  }
  el.focus({ preventScroll: true })
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
