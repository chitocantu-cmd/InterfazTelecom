import { useSyncExternalStore } from 'react'

/**
 * Nivel de experiencia según el equipo y las preferencias de quien visita:
 * - full: escritorio con mouse y equipo con capacidad → escena 3D, recorrido fijado al desplazamiento, parallax.
 * - lite: teléfonos, tabletas, equipos modestos o ahorro de datos → fotografías y animaciones ligeras en CSS.
 * - reduced: «reducir movimiento» activado → sin parallax, sin cámara ni desplazamientos; transiciones discretas.
 *
 * Para revisar cada nivel: ?experiencia=full | lite | reduced en la dirección.
 */
export type Tier = 'full' | 'lite' | 'reduced'

const QUERIES = ['(prefers-reduced-motion: reduce)', '(min-width: 1024px)', '(pointer: fine)']

function override(): Tier | null {
  const v = new URLSearchParams(window.location.search).get('experiencia')
  return v === 'full' || v === 'lite' || v === 'reduced' ? v : null
}

export function detectTier(): Tier {
  const forced = override()
  if (forced) return forced
  const [reduce, wide, fine] = QUERIES.map((q) => window.matchMedia(q).matches)
  if (reduce) return 'reduced'
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 8
  if (wide && fine && cores >= 4 && memory >= 4 && !nav.connection?.saveData) return 'full'
  return 'lite'
}

let webgl: boolean | undefined
/** ¿El navegador puede dibujar WebGL? (Se revisa una vez; sin WebGL, las escenas 3D quedan en su versión fotográfica.) */
export function hasWebGL(): boolean {
  if (webgl !== undefined) return webgl
  try {
    const c = document.createElement('canvas')
    webgl = Boolean(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    webgl = false
  }
  return webgl
}

function subscribe(onChange: () => void) {
  const lists = QUERIES.map((q) => window.matchMedia(q))
  lists.forEach((l) => l.addEventListener('change', onChange))
  return () => lists.forEach((l) => l.removeEventListener('change', onChange))
}

/**
 * Nivel de experiencia actual. `null` en el prerender y mientras React hidrata (el HTML no depende del equipo);
 * después, el nivel real, y cambia si el usuario activa «reducir movimiento» o la ventana cruza los 1024 px.
 */
export function useExperience(): Tier | null {
  return useSyncExternalStore(subscribe, detectTier, () => null)
}
