import type { ImgKey } from './media'

/**
 * Escenas del recorrido «De la conexión a la operación» (portada). Los textos están en los diccionarios
 * (journey.chapters); aquí, la foto de cada capítulo, su encuadre y dónde señala cada anotación.
 *
 * Coordenadas (x, y): fracción del ancho y alto de la foto, medidas sobre la imagen. Las anotaciones van en el mismo
 * orden que journey.chapters[i].callouts. En escritorio el texto ocupa la esquina inferior izquierda: las anotaciones
 * quedan arriba o a la derecha, y por debajo del header (no se ponen en el 12 % superior del encuadre).
 */
export interface Scene {
  img: ImgKey
  /** Proporción ancho / alto del archivo. */
  ratio: number
  /** Encuadre (como object-position). */
  px: number
  py: number
  callouts: { x: number; y: number; side?: 'left' | 'right' }[]
  /** Trazos de red sobre la foto (capítulo 4): listas de puntos en coordenadas de la foto. */
  network?: { paths: [number, number][][]; nodes: [number, number][] }
  /** Servicios que se enlazan desde el capítulo. */
  services: string[]
}

export const SCENES: Scene[] = [
  {
    img: 'rack', ratio: 1.5, px: 0.5, py: 0.45,
    callouts: [{ x: 0.56, y: 0.14 }, { x: 0.6, y: 0.3 }, { x: 0.785, y: 0.44, side: 'left' }, { x: 0.66, y: 0.665 }],
    services: ['cableado-estructurado', 'redes-empresariales', 'racks-y-site', 'certificacion-y-pruebas'],
  },
  {
    img: 'fiber', ratio: 1.5, px: 0.5, py: 0.45,
    callouts: [{ x: 0.745, y: 0.255 }, { x: 0.5, y: 0.37 }, { x: 0.72, y: 0.7 }],
    services: ['fibra-optica', 'certificacion-y-pruebas', 'enlaces-inalambricos'],
  },
  {
    img: 'cctv', ratio: 1.5, px: 0.5, py: 0.35,
    callouts: [{ x: 0.51, y: 0.29 }, { x: 0.295, y: 0.3, side: 'left' }, { x: 0.6, y: 0.66 }],
    services: ['cctv-videovigilancia', 'control-de-acceso', 'deteccion-perimetral'],
  },
  {
    img: 'indCedis', ratio: 1, px: 0.5, py: 0.12,
    callouts: [{ x: 0.648, y: 0.158 }, { x: 0.55, y: 0.52 }],
    network: {
      // Canalización a lo largo de la fachada (pasa por cada cámara) y el poste del domo PTZ.
      paths: [
        [[0.0, 0.352], [0.07, 0.345], [0.26, 0.408], [0.445, 0.474], [0.55, 0.519], [0.8, 0.628], [0.86, 0.648], [0.905, 0.668], [0.945, 0.68], [1, 0.69]],
        [[0.612, 0.83], [0.612, 0.2], [0.632, 0.158]],
      ],
      nodes: [[0.07, 0.345], [0.26, 0.408], [0.445, 0.474], [0.55, 0.519], [0.8, 0.628], [0.86, 0.648], [0.905, 0.668], [0.945, 0.68], [0.648, 0.158]],
    },
    services: ['diseno-e-ingenieria', 'wifi-empresarial', 'calidad-de-energia', 'mantenimiento-y-soporte'],
  },
]
