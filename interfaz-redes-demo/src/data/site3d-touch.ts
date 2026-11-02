import { ORBIT_FRAMES, ORBIT_HOME, ORBIT_PARTS } from './site3d-orbit'

/**
 * Giro táctil del site (RackTouch.tsx): los cuadros de la órbita y los acercamientos, renderizados de la escena real
 * con tools/site3d-orbit.mjs. Este módulo se descarga aparte, sólo cuando el visitante se acerca a la sección.
 */
const FILES = import.meta.glob<string>('../assets/site3d-touch/*.webp', { eager: true, import: 'default' })
const file = (name: string) => FILES[`../assets/site3d-touch/${name}.webp`]

export const SITE3D_TOUCH = {
  frames: ORBIT_FRAMES.map((_, i) => file(`f${String(i).padStart(2, '0')}`)),
  /** anchors[cuadro][pieza] = [x, y] en fracción del escenario, en el orden de ORBIT_PARTS. */
  anchors: ORBIT_FRAMES,
  home: ORBIT_HOME,
  close: Object.fromEntries(ORBIT_PARTS.map((p) => [p, file(p)])) as Record<(typeof ORBIT_PARTS)[number], string>,
}

export type Site3dTouch = typeof SITE3D_TOUCH
