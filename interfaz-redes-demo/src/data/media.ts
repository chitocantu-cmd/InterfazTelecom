import access from '../assets/img/access.webp'
import aisle from '../assets/img/aisle.webp'
import aisleWide from '../assets/img/aisleWide.webp'
import cctv from '../assets/img/cctv.webp'
import fiber from '../assets/img/fiber.webp'
import nave from '../assets/img/nave.webp'
import rack from '../assets/img/rack.webp'
import wifi from '../assets/img/wifi.webp'

// Visualizaciones 3D creadas para el demo. No son fotografías de proyectos de
// Interfaz: se sustituyen por fotografía real antes de publicar.
export const IMG = {
  aisle: { src: aisle, alt: 'Pasillo de site con racks, patch panels y escalerilla portacables', pos: '62% 50%' },
  aisleWide: { src: aisleWide, alt: 'Pasillo frío entre dos filas de racks con canaleta de fibra', pos: '50% 50%' },
  rack: { src: rack, alt: 'Frente de rack con patch panels, organizadores y switches de acceso', pos: '60% 40%' },
  fiber: { src: fiber, alt: 'Charola de empalme con fibras en código de colores y adaptadores LC', pos: '50% 50%' },
  cctv: { src: cctv, alt: 'Cámara bullet en columna vigilando un pasillo de almacén', pos: '35% 45%' },
  access: { src: access, alt: 'Lector de control de acceso junto a puerta de cristal con electroimán', pos: '40% 50%' },
  wifi: { src: wifi, alt: 'Access point en plafón reticular sobre área de trabajo', pos: '55% 35%' },
  nave: { src: nave, alt: 'Nave industrial con charola tipo malla y gabinete de comunicaciones en muro', pos: '62% 55%' },
} as const

export type ImgKey = keyof typeof IMG
