// Páginas por municipio (SEO local). Hoy todas son BORRADORES: se ven sólo en desarrollo y en vistas previas
// (VITE_BORRADORES=1), siempre con noindex, fuera del sitemap y sin enlaces desde el sitio. Una página municipal se
// publica únicamente cuando tiene evidencia propia: cobertura confirmada por la empresa, al menos un proyecto
// autorizado en la zona, fotografías reales y datos de contexto verificados (lista `missing` de cada una). Nunca se
// crean páginas que sólo cambian el nombre del municipio. Criterios completos: SEO_LOCAL_NUEVO_LEON.md (documento
// interno). Sólo en español: la prioridad comercial es Monterrey y Nuevo León.

export type ZoneStatus = 'borrador' | 'publicado'

export interface Zone {
  slug: string
  /** Nombre oficial del municipio. */
  name: string
  status: ZoneStatus
  /** Título visible (h1). */
  title: string
  seo: { title: string; description: string }
  intro: string
  /** Contexto empresarial del municipio. Cada dato debe verificarse antes de publicar. */
  context: string[]
  /** Necesidades de infraestructura frecuentes en ese tipo de instalaciones. */
  needs: { title: string; text: string }[]
  /** Servicios relacionados (slugs de src/data/solutions.ts). */
  services: string[]
  /** Sectores relacionados (ids de industrias). */
  industries: string[]
  faq: { q: string; a: string }[]
  /** Lo que falta para poder publicarla (se muestra en el aviso de borrador). */
  missing: string[]
}

/** Requisitos comunes a todas las páginas municipales. */
const BASE_MISSING = [
  'Confirmación de la empresa: se atiende este municipio (visitas de levantamiento, tiempos de traslado y condiciones).',
  'Al menos un proyecto autorizado en el municipio: tipo de instalación, alcance y fotografías reales (sin datos del cliente si no los autoriza).',
  'Fotografías reales de trabajos en la zona.',
  'Revisión de los datos de contexto del municipio por una persona del equipo.',
  'Evidencia de demanda: impresiones en Search Console de búsquedas con el municipio.',
]

export const ZONES: Zone[] = [
  {
    slug: 'apodaca',
    name: 'Apodaca',
    status: 'borrador',
    title: 'Redes, fibra óptica y videovigilancia para empresas en Apodaca',
    seo: {
      title: 'Redes, fibra óptica y CCTV para empresas en Apodaca, N.L.',
      description: 'Infraestructura de red, fibra óptica, WiFi industrial y videovigilancia para naves industriales y centros de distribución en Apodaca, Nuevo León.',
    },
    intro: 'Diseño, instalación y documentación de infraestructura de red y seguridad electrónica para naves industriales, centros de distribución y oficinas en Apodaca, desde nuestra oficina en Monterrey.',
    context: [
      'Apodaca concentra parques industriales, naves logísticas y operaciones ligadas al Aeropuerto Internacional de Monterrey, que se ubica en el municipio.',
      'En este tipo de instalaciones la red cubre áreas grandes: oficinas, piso de producción o almacén, casetas de acceso y patios, con distancias que superan lo que permite el cableado de cobre.',
    ],
    needs: [
      { title: 'Enlaces entre edificios y casetas', text: 'Fibra óptica o enlaces inalámbricos para unir oficinas, naves y casetas de vigilancia separadas por patios y estacionamientos.' },
      { title: 'WiFi en almacén', text: 'Diseño de puntos de acceso para naves con racks de almacenamiento altos, donde la señal se comporta distinto que en una oficina.' },
      { title: 'Videovigilancia de accesos y andenes', text: 'Cámaras para accesos, andenes y perímetro, con almacenamiento calculado para los días de retención que pida la operación.' },
      { title: 'Arranque de naves nuevas', text: 'Cableado, site y conectividad listos para la fecha de arranque, coordinados con la constructora y el resto de las instalaciones.' },
    ],
    services: ['fibra-optica', 'enlaces-inalambricos', 'wifi-empresarial', 'cctv-videovigilancia', 'cableado-estructurado', 'control-de-acceso'],
    industries: ['industria', 'cedis'],
    faq: [
      { q: '¿Qué conviene para unir la nave con una caseta a varios cientos de metros?', a: 'Si hay canalización o se puede construir, fibra óptica: no la afectan la distancia de un patio industrial ni la interferencia eléctrica. Si no la hay y existe línea de vista, un enlace inalámbrico punto a punto. Se decide en el levantamiento, con la distancia real y la ruta disponible.' },
      { q: '¿El WiFi de oficina sirve para el almacén?', a: 'Pocas veces. Los racks, la altura y el producto almacenado cambian la cobertura; además, las terminales de escaneo necesitan movilidad entre puntos de acceso sin cortes. Conviene un diseño de cobertura para la nave.' },
    ],
    missing: BASE_MISSING,
  },
  {
    slug: 'general-escobedo',
    name: 'General Escobedo',
    status: 'borrador',
    title: 'Infraestructura de red y seguridad para empresas en Escobedo',
    seo: {
      title: 'Redes, control de acceso y CCTV para empresas en Escobedo, N.L.',
      description: 'Redes empresariales, control de acceso, asistencia, energía de respaldo y videovigilancia para plantas, naves y oficinas en General Escobedo, Nuevo León.',
    },
    intro: 'Redes, control de acceso, videovigilancia y respaldo de energía para plantas, naves y oficinas en General Escobedo, con ingeniería y documentación de cada instalación.',
    context: [
      'General Escobedo, al norte del área metropolitana de Monterrey, combina parques industriales y naves logísticas con zonas comerciales y habitacionales.',
      'Las instalaciones que crecen por etapas necesitan una red que se pueda ampliar sin rehacer lo que ya funciona.',
    ],
    needs: [
      { title: 'Ampliaciones de nave', text: 'Red y canalizaciones pensadas para crecer: espacio en racks, fibra con hilos de reserva y puertos disponibles para la siguiente etapa.' },
      { title: 'Acceso de personal y contratistas', text: 'Control de acceso y de asistencia por turnos, con registros que recursos humanos y seguridad puedan consultar.' },
      { title: 'Producción y oficinas separadas', text: 'Segmentación de la red para que los equipos de planta, las cámaras y las oficinas no compartan el mismo tráfico.' },
      { title: 'Respaldo de energía', text: 'Respaldo para el site, las cámaras y el control de acceso, para que un corte de energía no deje la planta sin red ni registro.' },
    ],
    services: ['redes-empresariales', 'control-de-acceso', 'control-de-asistencia', 'calidad-de-energia', 'cableado-estructurado', 'cctv-videovigilancia'],
    industries: ['industria', 'cedis', 'comercio'],
    faq: [
      { q: '¿Cómo se prepara la red para una ampliación futura?', a: 'Se dimensiona desde el diseño: espacio libre en racks, hilos de fibra de reserva, canalización con capacidad y switches con puertos disponibles. Así la siguiente etapa se conecta sin detener la operación.' },
      { q: '¿El control de acceso puede registrar la asistencia?', a: 'Sí, si los equipos y el software se eligen para ambas funciones. Se define en el levantamiento, según turnos, número de personas y puntos de acceso.' },
    ],
    missing: BASE_MISSING,
  },
  {
    slug: 'santa-catarina',
    name: 'Santa Catarina',
    status: 'borrador',
    title: 'Mantenimiento y modernización de redes y CCTV para empresas en Santa Catarina',
    seo: {
      title: 'Redes, certificación y CCTV para empresas en Santa Catarina, N.L.',
      description: 'Levantamiento, certificación, mantenimiento y modernización de redes, site y videovigilancia para plantas e instalaciones industriales en Santa Catarina, N.L.',
    },
    intro: 'Levantamiento, certificación, mantenimiento y modernización de redes, site y videovigilancia para plantas e instalaciones industriales en Santa Catarina.',
    context: [
      'Santa Catarina, al poniente del área metropolitana de Monterrey, tiene una base industrial a lo largo del corredor hacia Saltillo.',
      'En plantas con años de operación es común que la red y el CCTV hayan crecido por etapas, con equipos y cableados de distintas épocas y sin documentación al día.',
    ],
    needs: [
      { title: 'Ordenar y documentar lo que existe', text: 'Levantamiento, etiquetado y diagramas de la red actual, para saber qué hay antes de invertir en algo nuevo.' },
      { title: 'Migrar CCTV analógico a IP', text: 'Sustitución por etapas, aprovechando canalizaciones existentes cuando están en buen estado.' },
      { title: 'Certificar el cableado existente', text: 'Pruebas para saber qué tramos cumplen con la categoría y cuáles conviene reemplazar.' },
      { title: 'Mantenimiento programado', text: 'Revisión periódica de site, racks, energía y cámaras, con reportes para el área de mantenimiento.' },
    ],
    services: ['mantenimiento-y-soporte', 'certificacion-y-pruebas', 'cctv-videovigilancia', 'cableado-estructurado', 'racks-y-site', 'diseno-e-ingenieria'],
    industries: ['industria'],
    faq: [
      { q: '¿Se puede reutilizar el cableado de una planta con varios años?', a: 'A veces. Una certificación indica qué tramos cumplen con su categoría; los que no, o los que no soportan la velocidad que se necesita, se reemplazan. Reutilizar sin probar es la causa más común de fallas intermitentes.' },
      { q: '¿Hay que cambiar todas las cámaras al pasar a IP?', a: 'No necesariamente al mismo tiempo. Hay formas de convivir por etapas; la decisión depende del estado de las cámaras, del cableado y de lo que se necesite ver y grabar.' },
    ],
    missing: BASE_MISSING,
  },
]

export const visibleZones = (drafts: boolean) => ZONES.filter((z) => drafts || z.status === 'publicado')
export const zoneBySlug = (slug?: string) => ZONES.find((z) => z.slug === slug)

/** Textos de la página (sólo en español). */
export const ZONE_TEXT = {
  draftBanner: 'Borrador de página municipal: no se publica ni se indexa hasta reunir lo siguiente.',
  context: 'La zona',
  needs: 'Necesidades frecuentes',
  services: 'Servicios que intervienen',
  industries: 'Sectores',
  faq: 'Preguntas frecuentes',
  quote: 'Solicite una propuesta',
  quoteLede: (name: string) => `Cuéntenos qué necesita su instalación en ${name}: ubicación, alcance aproximado y datos de contacto.`,
}
