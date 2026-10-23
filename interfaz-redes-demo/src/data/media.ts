// Todas las imágenes de src/assets/img. Las versiones <nombre>-400.webp, -640.webp y -1024.webp
// (tools/variantes.py) entran al srcset para que el navegador descargue la que le alcanza.
const FILES = import.meta.glob<string>('../assets/img/**/*.webp', { eager: true, import: 'default' })
const VARIANTS = [400, 640, 1024]

/** Imagen original (de `width` px de ancho) con su srcset de versiones reducidas, si existen. */
function pic(name: string, width: number) {
  const file = (w?: number) => FILES[`../assets/img/${name}${w ? `-${w}` : ''}.webp`]
  const src = file()
  if (!src) throw new Error(`No existe src/assets/img/${name}.webp`)
  const set = VARIANTS.filter((w) => w < width && file(w)).map((w) => `${file(w)} ${w}w`)
  return { src, srcSet: set.length ? [...set, `${src} ${width}w`].join(', ') : undefined }
}

// ref: true  → visualización 3D de referencia (muestra la leyenda "Imagen de referencia").
// ref: false → fotografía real del equipo de Interfaz en campo (publicada en interfaz.com.mx).
//              Muestra trabajos del equipo, no un proyecto o cliente en particular.
export const IMG = {
  aisle: { ...pic('aisle', 1536), ref: true, alt: 'Pasillo de site con racks, patch panels y escalerilla portacables', pos: '60% 50%' },
  aisleWide: { ...pic('aisleWide', 1536), ref: true, alt: 'Pasillo frío entre dos filas de racks con canaleta de fibra', pos: '50% 50%' },
  rack: { ...pic('rack', 1536), ref: true, alt: 'Frente de rack con patch panels, organizadores y switches de acceso', pos: '50% 45%' },
  fiber: { ...pic('fiber', 1536), ref: true, alt: 'Charola de empalme con fibras en código de colores y adaptadores LC', pos: '50% 40%' },
  cctv: { ...pic('cctv', 1536), ref: true, alt: 'Cámara bullet en columna vigilando un pasillo de almacén', pos: '35% 40%' },
  access: { ...pic('access', 1536), ref: true, alt: 'Lector de control de acceso junto a puerta de cristal con electroimán', pos: '40% 50%' },
  wifi: { ...pic('wifi', 1536), ref: true, alt: 'Access point en plafón reticular sobre área de trabajo', pos: '50% 30%' },
  nave: { ...pic('nave', 1536), ref: true, alt: 'Nave industrial con charola tipo malla y gabinete de comunicaciones en muro', pos: '25% 55%' },

  // Industrias (cuadradas: 4:5 en Inicio, 4:3 en /industrias)
  indIndustria: { ...pic('indIndustria', 1254), ref: true, alt: 'Gabinete industrial abierto en una columna de planta, con switch en riel DIN y cableado Ethernet', pos: '50% 45%' },
  indCorporativos: { ...pic('indCorporativos', 1254), ref: true, alt: 'Sala de juntas con caja de conectividad en la mesa y access point en el plafón', pos: '50% 60%' },
  indCedis: { ...pic('indCedis', 1254), ref: true, alt: 'Andenes de carga de un centro de distribución con cámaras sobre las puertas y domo PTZ en poste', pos: '55% 50%' },
  indEducacion: { ...pic('indEducacion', 1254), ref: true, alt: 'Aula con access point al centro del plafón, proyector y pizarrón', pos: '50% 40%' },
  indComercio: { ...pic('indComercio', 1254), ref: true, alt: 'Cajas de una tienda con terminales punto de venta, cámaras domo y access point en el techo', pos: '50% 60%' },

  // Proyectos (3:2: franja panorámica en el detalle, 16:10, 4:3 y 3:2 en tarjetas)
  proyNave: { ...pic('proyNave', 1536), ref: true, alt: 'Nave de manufactura vista desde un mezanine, con charola portacables elevada y racks de distribución', pos: '20% 50%' },
  proyCorporativo: { ...pic('proyCorporativo', 1536), ref: true, alt: 'Parte trasera de dos racks con cableado Cat6A nuevo bajando peinado desde la escalerilla', pos: '50% 35%' },
  proyCedis: { ...pic('proyCedis', 1536), ref: true, alt: 'Sala de monitoreo con muro de video, escritorio de operador y rack de grabación', pos: '50% 25%' },
  proyFibra: { ...pic('proyFibra', 1536), ref: true, alt: 'Registro abierto con ductos y reserva de cable de fibra en un parque industrial', pos: '50% 75%' },
  proySite: { ...pic('proySite', 1536), ref: true, alt: 'Cuarto de telecomunicaciones ordenado con racks, escalerilla y barra de tierra', pos: '50% 35%' },
  proyCampus: { ...pic('proyCampus', 1536), ref: true, alt: 'Andador cubierto entre edificios de un campus escolar con access points exteriores', pos: '55% 35%' },

  plafon: { ...pic('campo/plafon-cableado', 1200), ref: false, alt: 'Técnico de Interfaz en escalera pasando cable UTP por el plafón de una sala de juntas', pos: '50% 35%' },
  site: { ...pic('campo/site-tecnicos', 1200), ref: false, alt: 'Técnicos de Interfaz trabajando en un cuarto de telecomunicaciones, uno de ellos sobre el plafón', pos: '50% 45%' },
  patchPanel: { ...pic('campo/patch-panel', 787), ref: false, alt: 'Técnico organizando el cableado en el organizador vertical de un rack', pos: '45% 40%' },
  escalera: { ...pic('campo/cableado-escalera', 899), ref: false, alt: 'Técnico en escalera tendiendo cableado por el techo de un comedor, con el área delimitada', pos: '50% 35%' },
  oficina: { ...pic('campo/instalacion-oficina', 1600), ref: false, alt: 'Tres técnicos de Interfaz instalando canaleta en la parte alta de un muro', pos: '50% 8%' },
  equipo: { ...pic('campo/equipo-interfaz', 563), ref: false, alt: 'Técnico de Interfaz conectando equipo activo en un rack de comunicaciones', pos: '50% 40%' },
  rackTecnico: { ...pic('campo/rack-tecnico', 562), ref: false, alt: 'Técnicos de Interfaz trabajando en el rack de un cuarto de comunicaciones', pos: '50% 30%' },
  rackOrden: { ...pic('campo/rack-organizacion', 562), ref: false, alt: 'Técnico peinando el cableado junto al organizador vertical de un rack', pos: '45% 50%' },
  pasillo: { ...pic('campo/pasillo-tendido', 900), ref: false, alt: 'Tendido de cable UTP a lo largo del pasillo de unas oficinas', pos: '50% 50%' },
} as const

export type ImgKey = keyof typeof IMG
