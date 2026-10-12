import access from '../assets/img/access.webp'
import aisle from '../assets/img/aisle.webp'
import aisleWide from '../assets/img/aisleWide.webp'
import escalera from '../assets/img/campo/cableado-escalera.webp'
import equipo from '../assets/img/campo/equipo-interfaz.webp'
import oficina from '../assets/img/campo/instalacion-oficina.webp'
import pasillo from '../assets/img/campo/pasillo-tendido.webp'
import patchPanel from '../assets/img/campo/patch-panel.webp'
import plafon from '../assets/img/campo/plafon-cableado.webp'
import rackOrden from '../assets/img/campo/rack-organizacion.webp'
import rackTecnico from '../assets/img/campo/rack-tecnico.webp'
import site from '../assets/img/campo/site-tecnicos.webp'
import cctv from '../assets/img/cctv.webp'
import fiber from '../assets/img/fiber.webp'
import nave from '../assets/img/nave.webp'
import rack from '../assets/img/rack.webp'
import wifi from '../assets/img/wifi.webp'

// ref: true  → visualización 3D de referencia (muestra la leyenda "Imagen de referencia").
// ref: false → fotografía real del equipo de Interfaz en campo (publicada en interfaz.com.mx).
//              Muestra trabajos del equipo, no un proyecto o cliente en particular.
export const IMG = {
  aisle: { src: aisle, ref: true, alt: 'Pasillo de site con racks, patch panels y escalerilla portacables', pos: '62% 50%' },
  aisleWide: { src: aisleWide, ref: true, alt: 'Pasillo frío entre dos filas de racks con canaleta de fibra', pos: '50% 50%' },
  rack: { src: rack, ref: true, alt: 'Frente de rack con patch panels, organizadores y switches de acceso', pos: '60% 40%' },
  fiber: { src: fiber, ref: true, alt: 'Charola de empalme con fibras en código de colores y adaptadores LC', pos: '50% 50%' },
  cctv: { src: cctv, ref: true, alt: 'Cámara bullet en columna vigilando un pasillo de almacén', pos: '35% 45%' },
  access: { src: access, ref: true, alt: 'Lector de control de acceso junto a puerta de cristal con electroimán', pos: '40% 50%' },
  wifi: { src: wifi, ref: true, alt: 'Access point en plafón reticular sobre área de trabajo', pos: '55% 35%' },
  nave: { src: nave, ref: true, alt: 'Nave industrial con charola tipo malla y gabinete de comunicaciones en muro', pos: '62% 55%' },

  plafon: { src: plafon, ref: false, alt: 'Técnico de Interfaz en escalera pasando cable UTP por el plafón de una sala de juntas', pos: '50% 35%' },
  site: { src: site, ref: false, alt: 'Técnicos de Interfaz trabajando en un cuarto de telecomunicaciones, uno de ellos sobre el plafón', pos: '50% 45%' },
  patchPanel: { src: patchPanel, ref: false, alt: 'Técnico organizando el cableado en el organizador vertical de un rack', pos: '45% 40%' },
  escalera: { src: escalera, ref: false, alt: 'Técnico en escalera tendiendo cableado por el techo de un comedor, con el área delimitada', pos: '50% 35%' },
  oficina: { src: oficina, ref: false, alt: 'Tres técnicos de Interfaz instalando canaleta en la parte alta de un muro', pos: '50% 8%' },
  equipo: { src: equipo, ref: false, alt: 'Técnico de Interfaz conectando equipo activo en un rack de comunicaciones', pos: '50% 40%' },
  rackTecnico: { src: rackTecnico, ref: false, alt: 'Técnicos de Interfaz trabajando en el rack de un cuarto de comunicaciones', pos: '50% 30%' },
  rackOrden: { src: rackOrden, ref: false, alt: 'Técnico peinando el cableado junto al organizador vertical de un rack', pos: '45% 50%' },
  pasillo: { src: pasillo, ref: false, alt: 'Tendido de cable UTP a lo largo del pasillo de unas oficinas', pos: '50% 50%' },
} as const

export type ImgKey = keyof typeof IMG
