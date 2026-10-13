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
import indCedis from '../assets/img/indCedis.webp'
import indComercio from '../assets/img/indComercio.webp'
import indCorporativos from '../assets/img/indCorporativos.webp'
import indEducacion from '../assets/img/indEducacion.webp'
import indIndustria from '../assets/img/indIndustria.webp'
import nave from '../assets/img/nave.webp'
import proyCampus from '../assets/img/proyCampus.webp'
import proyCedis from '../assets/img/proyCedis.webp'
import proyCorporativo from '../assets/img/proyCorporativo.webp'
import proyFibra from '../assets/img/proyFibra.webp'
import proyNave from '../assets/img/proyNave.webp'
import proySite from '../assets/img/proySite.webp'
import rack from '../assets/img/rack.webp'
import wifi from '../assets/img/wifi.webp'

// ref: true  → visualización 3D de referencia (muestra la leyenda "Imagen de referencia").
// ref: false → fotografía real del equipo de Interfaz en campo (publicada en interfaz.com.mx).
//              Muestra trabajos del equipo, no un proyecto o cliente en particular.
export const IMG = {
  aisle: { src: aisle, ref: true, alt: 'Pasillo de site con racks, patch panels y escalerilla portacables', pos: '60% 50%' },
  aisleWide: { src: aisleWide, ref: true, alt: 'Pasillo frío entre dos filas de racks con canaleta de fibra', pos: '50% 50%' },
  rack: { src: rack, ref: true, alt: 'Frente de rack con patch panels, organizadores y switches de acceso', pos: '50% 45%' },
  fiber: { src: fiber, ref: true, alt: 'Charola de empalme con fibras en código de colores y adaptadores LC', pos: '50% 40%' },
  cctv: { src: cctv, ref: true, alt: 'Cámara bullet en columna vigilando un pasillo de almacén', pos: '35% 40%' },
  access: { src: access, ref: true, alt: 'Lector de control de acceso junto a puerta de cristal con electroimán', pos: '40% 50%' },
  wifi: { src: wifi, ref: true, alt: 'Access point en plafón reticular sobre área de trabajo', pos: '50% 30%' },
  nave: { src: nave, ref: true, alt: 'Nave industrial con charola tipo malla y gabinete de comunicaciones en muro', pos: '25% 55%' },

  // Industrias (cuadradas: 4:5 en Inicio, 4:3 en /industrias)
  indIndustria: { src: indIndustria, ref: true, alt: 'Gabinete industrial abierto en una columna de planta, con switch en riel DIN y cableado Ethernet', pos: '50% 45%' },
  indCorporativos: { src: indCorporativos, ref: true, alt: 'Sala de juntas con caja de conectividad en la mesa y access point en el plafón', pos: '50% 60%' },
  indCedis: { src: indCedis, ref: true, alt: 'Andenes de carga de un centro de distribución con cámaras sobre las puertas y domo PTZ en poste', pos: '55% 50%' },
  indEducacion: { src: indEducacion, ref: true, alt: 'Aula con access point al centro del plafón, proyector y pizarrón', pos: '50% 40%' },
  indComercio: { src: indComercio, ref: true, alt: 'Cajas de una tienda con terminales punto de venta, cámaras domo y access point en el techo', pos: '50% 60%' },

  // Proyectos (3:2: franja panorámica en el detalle, 16:10, 4:3 y 3:2 en tarjetas)
  proyNave: { src: proyNave, ref: true, alt: 'Nave de manufactura vista desde un mezanine, con charola portacables elevada y racks de distribución', pos: '20% 50%' },
  proyCorporativo: { src: proyCorporativo, ref: true, alt: 'Parte trasera de dos racks con cableado Cat6A nuevo bajando peinado desde la escalerilla', pos: '50% 35%' },
  proyCedis: { src: proyCedis, ref: true, alt: 'Sala de monitoreo con muro de video, escritorio de operador y rack de grabación', pos: '50% 25%' },
  proyFibra: { src: proyFibra, ref: true, alt: 'Registro abierto con ductos y reserva de cable de fibra en un parque industrial', pos: '50% 75%' },
  proySite: { src: proySite, ref: true, alt: 'Cuarto de telecomunicaciones ordenado con racks, escalerilla y barra de tierra', pos: '50% 35%' },
  proyCampus: { src: proyCampus, ref: true, alt: 'Andador cubierto entre edificios de un campus escolar con access points exteriores', pos: '55% 35%' },

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
