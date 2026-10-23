/**
 * Tokens de movimiento de Interfaz 3.0. Una sola fuente para Motion (arreglos cubic-bezier) y GSAP (nombres de curva);
 * index.css repite los mismos valores como variables (--ease-*, --dur-*) para las animaciones en CSS.
 * Ver MOTION_DESIGN_SYSTEM.md.
 */

/** Duraciones en segundos. */
export const DURATION = {
  /** Respuesta a una acción: hover, foco, presionar. */
  micro: 0.16,
  /** Cambios de estado de un componente: abrir, cambiar de pestaña. */
  base: 0.24,
  /** Entradas de contenido: titulares, imágenes, bloques de texto. */
  editorial: 0.7,
  /** Escenas: apertura del hero, cambios de capítulo, máscaras grandes. */
  cinematic: 1.2,
} as const

/** Curvas (cubic-bezier) para Motion y CSS. */
export const EASE = {
  /** Salida suave: microinteracciones y estados. */
  out: [0.2, 0.7, 0.2, 1],
  /** Salida enfática (easeOutExpo): entradas editoriales y cinematográficas. */
  emph: [0.16, 1, 0.3, 1],
  /** Entrada y salida: desplazamientos de cámara y cambios de escena. */
  inOut: [0.65, 0, 0.35, 1],
} as const

/** Las mismas curvas con los nombres de GSAP (sin plugins): expo.out = easeOutExpo, power2.inOut = easeInOutCubic. */
export const GSAP_EASE = { out: 'power3.out', emph: 'expo.out', inOut: 'power2.inOut', scrub: 'none' } as const

/** Escalonado entre elementos, en segundos. */
export const STAGGER = { words: 0.055, items: 0.08 } as const
