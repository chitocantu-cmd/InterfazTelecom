import { IMG } from './media'

/**
 * Vistas fijas de la escena 3D del site (vista general y cada componente enfocado), renderizadas (1320 × 825) desde
 * la misma escena con tools/site3d-stills.mjs. Se usan donde no corre el 3D: teléfono, equipos sin WebGL y «reducir
 * movimiento». Si falta alguna, se usa la fotografía del rack.
 */
const FILES = import.meta.glob<string>('../assets/img/site3d/*.webp', { eager: true, import: 'default' })

type Still = { src: string; srcSet?: string }
const still = (name: string): Still => {
  const file = (w?: number) => FILES[`../assets/img/site3d/${name}${w ? `-${w}` : ''}.webp`]
  const src = file()
  if (!src) return { src: IMG.rack.src, srcSet: IMG.rack.srcSet }
  const set = [400, 640, 1024].filter((w) => file(w)).map((w) => `${file(w)} ${w}w`)
  return { src, srcSet: set.length ? [...set, `${src} 1320w`].join(', ') : undefined }
}

export const SITE3D_STILLS: Record<'overview' | 'tray' | 'fiber' | 'patch' | 'organizer' | 'switch' | 'nvr' | 'ups', Still> = {
  overview: still('overview'),
  tray: still('tray'),
  fiber: still('fiber'),
  patch: still('patch'),
  organizer: still('organizer'),
  switch: still('switch'),
  nvr: still('nvr'),
  ups: still('ups'),
}
