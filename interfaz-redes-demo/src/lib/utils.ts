import { useReducedMotion as useMotionPreference } from 'motion/react'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { COMPANY } from '../data/company'

export const cn = (...c: (string | number | false | null | undefined)[]) => c.filter((x) => typeof x === 'string' && x).join(' ')

export const waLink = (text: string) => `https://wa.me/${COMPANY.whatsappIntl}?text=${encodeURIComponent(text)}`
export const mailLink = (subject: string, body: string) =>
  `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

export const WA_GENERAL = waLink('Hola, quiero hablar con un especialista de Interfaz Redes sobre un proyecto de infraestructura.')

/** Nombre a mitad de frase: baja sólo la inicial y respeta siglas («CCTV y videovigilancia», «WiFi empresarial»). */
export const lowerFirst = (name: string) => (/[A-Z].*[A-Z]/.test(name.split(' ')[0]) ? name : name.charAt(0).toLowerCase() + name.slice(1))

const subscribeNever = () => () => {}
/**
 * `false` en el prerender y mientras React hidrata ese HTML; `true` después (y en cada página que se abre ya en
 * el navegador). Para lo que depende del navegador (parámetros ?, almacenamiento) y debe coincidir con el HTML
 * prerenderizado en el primer render: al terminar de hidratar, React vuelve a renderizar con `true`.
 */
export const useHydrated = () => useSyncExternalStore(subscribeNever, () => true, () => false)

/**
 * ¿El usuario pidió reducir el movimiento? Mientras se hidrata responde `null` (como en el prerender, que no lo
 * sabe) para que el primer render coincida con el HTML. Las animaciones de desplazamiento ya se omiten para
 * esos usuarios con <MotionConfig reducedMotion="user"> (App.tsx).
 */
export function useReducedMotion() {
  const reduce = useMotionPreference()
  return useHydrated() ? reduce : null
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Lleva la vista arriba al cambiar de ruta (o a la sección indicada por #id; también por ?s=id, el formato de los
 * enlaces anteriores) y pasa ahí el foco del teclado.
 */
export function useScrollToTop() {
  const { pathname, search, hash, key } = useLocation()
  const target = hash.slice(1) || new URLSearchParams(search).get('s')
  // `key` cambia con cada clic: un enlace a la sección en la que ya está vuelve a desplazarse.
  const clickToSection = target ? key : null
  const firstRender = useRef(true)
  useEffect(() => {
    const initial = firstRender.current
    firstRender.current = false
    if (target) {
      // La página puede seguir descargándose (se carga bajo demanda): se espera hasta 3 s a que exista la sección.
      let tries = 0
      let t = 0
      const attempt = () => {
        if (document.getElementById(target)) scrollToId(target)
        else if (++tries < 50) t = window.setTimeout(attempt, 60)
      }
      t = window.setTimeout(attempt, 60)
      return () => window.clearTimeout(t)
    }
    // Al abrir el sitio no se mueve la vista: el HTML ya llegó con el contenido y el usuario pudo haberse desplazado
    // (o el navegador restauró la posición al recargar).
    if (initial) return
    window.scrollTo({ top: 0, behavior: 'auto' })
    // Al navegar, el foco va al contenido para que el teclado y los lectores de pantalla empiecen por la página nueva.
    document.getElementById('contenido')?.focus({ preventScroll: true })
  }, [pathname, target, clickToSection])
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
