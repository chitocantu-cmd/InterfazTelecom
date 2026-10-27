// Centro de conocimiento técnico: índice de artículos. El texto de cada uno está en un archivo Markdown de esta carpeta
// (<slug>.md). Flujo editorial: borrador → revision → publicado. Sólo «publicado» aparece en producción, se indexa y
// entra al sitemap; borradores y artículos en revisión se ven únicamente en desarrollo (npm run dev) y en builds con
// VITE_BORRADORES=1 (vistas previas), siempre con noindex. Para publicar: revisión técnica de una persona del equipo,
// `status: 'publicado'`, `reviewedBy` y `updated`. Guía completa en ARQUITECTURA_INTERFAZ.md («Centro técnico»).

export type ResourceCategory = 'cableado' | 'fibra' | 'redes' | 'cctv' | 'seguridad' | 'infraestructura' | 'mantenimiento' | 'guias'
export type ResourceType = 'guia' | 'checklist' | 'comparativa' | 'faq' | 'recomendaciones' | 'buenas-practicas' | 'glosario' | 'caso'
export type EditorialStatus = 'borrador' | 'revision' | 'publicado'

export const RESOURCE_CATEGORIES: ResourceCategory[] = ['cableado', 'fibra', 'redes', 'cctv', 'seguridad', 'infraestructura', 'mantenimiento', 'guias']

export interface Resource {
  slug: string
  title: string
  /** Una o dos frases: aparecen en el índice y como descripción para buscadores (120 a 160 caracteres). */
  summary: string
  category: ResourceCategory
  type: ResourceType
  status: EditorialStatus
  /** Fecha de la última revisión de contenido (AAAA-MM-DD). */
  updated: string
  readingMinutes: number
  /** Quién hizo la revisión técnica (obligatorio para publicar). */
  reviewedBy?: string
  /** Servicios relacionados (slugs de src/data/solutions.ts). */
  services: string[]
}

export const RESOURCES: Resource[] = [
  {
    slug: 'cat6-vs-cat6a',
    title: 'Cat6 vs Cat6A: diferencias y aplicaciones empresariales',
    summary: 'Ancho de banda, distancia a 10 Gb/s, PoE, diámetro y costo: qué cambia entre Cat6 y Cat6A y cómo decidir qué categoría especificar en un proyecto.',
    category: 'cableado',
    type: 'comparativa',
    status: 'borrador',
    updated: '2026-10-22',
    readingMinutes: 6,
    services: ['cableado-estructurado', 'certificacion-y-pruebas'],
  },
  {
    slug: 'disenar-site-telecomunicaciones',
    title: 'Qué considerar al diseñar un SITE de telecomunicaciones',
    summary: 'Ubicación, espacio, energía, clima, tierras, canalización y documentación: los puntos que definen un cuarto de telecomunicaciones que se pueda operar y crecer.',
    category: 'infraestructura',
    type: 'guia',
    status: 'borrador',
    updated: '2026-10-22',
    readingMinutes: 7,
    services: ['racks-y-site', 'calidad-de-energia', 'diseno-e-ingenieria'],
  },
  {
    slug: 'fibra-monomodo-multimodo',
    title: 'Fibra monomodo y multimodo: cómo seleccionar una solución',
    summary: 'Distancia, velocidad, ópticas y costo total: criterios para elegir entre fibra multimodo OM3/OM4 y monomodo OS2 en backbone y enlaces entre edificios.',
    category: 'fibra',
    type: 'comparativa',
    status: 'borrador',
    updated: '2026-10-22',
    readingMinutes: 6,
    services: ['fibra-optica', 'certificacion-y-pruebas'],
  },
  {
    slug: 'cctv-planta-industrial',
    title: 'Qué revisar antes de instalar CCTV en una planta industrial',
    summary: 'Objetivos por zona, iluminación, montaje, red PoE, grabación, retención y operación: lo que se revisa antes de un proyecto de videovigilancia en planta.',
    category: 'cctv',
    type: 'checklist',
    status: 'borrador',
    updated: '2026-10-22',
    readingMinutes: 6,
    services: ['cctv-videovigilancia', 'redes-empresariales', 'fibra-optica'],
  },
  {
    slug: 'checklist-red-corporativa',
    title: 'Checklist para una nueva infraestructura de red corporativa',
    summary: 'Desde el layout y el cuarto de telecomunicaciones hasta WiFi, segmentación, energía y documentación: lo que conviene resolver antes de ocupar una oficina nueva.',
    category: 'guias',
    type: 'checklist',
    status: 'borrador',
    updated: '2026-10-22',
    readingMinutes: 7,
    services: ['cableado-estructurado', 'redes-empresariales', 'wifi-empresarial', 'racks-y-site'],
  },
  {
    slug: 'errores-cableado-estructurado',
    title: 'Errores comunes en instalaciones de cableado estructurado',
    summary: 'Distancias, categorías mezcladas, destrenzado, ocupación de charolas, tierras, etiquetado y certificación: los diez errores más frecuentes y cómo evitarlos.',
    category: 'cableado',
    type: 'recomendaciones',
    status: 'borrador',
    updated: '2026-10-27',
    readingMinutes: 7,
    services: ['cableado-estructurado', 'certificacion-y-pruebas', 'racks-y-site'],
  },
  {
    slug: 'fibra-entre-edificios',
    title: 'Fibra óptica entre edificios: cuándo conviene y qué considerar',
    summary: 'Distancia, tierras, tipo de fibra, ruta subterránea o aérea, hilos de reserva, empalmes y pruebas: qué decidir para unir edificios, casetas y naves con fibra.',
    category: 'fibra',
    type: 'guia',
    status: 'borrador',
    updated: '2026-10-27',
    readingMinutes: 7,
    services: ['fibra-optica', 'enlaces-inalambricos', 'certificacion-y-pruebas'],
  },
  {
    slug: 'conectividad-nave-industrial-nueva',
    title: 'Cómo planear la conectividad de una nave industrial nueva',
    summary: 'Qué conectar, dónde ubicar el site, canalizaciones en obra gris, backbone, WiFi para almacén, CCTV, energía y acometida: la red de una nave nueva paso a paso.',
    category: 'guias',
    type: 'guia',
    status: 'borrador',
    updated: '2026-10-27',
    readingMinutes: 7,
    services: ['diseno-e-ingenieria', 'cableado-estructurado', 'fibra-optica', 'wifi-empresarial', 'racks-y-site'],
  },
]

/** ¿Se muestran borradores y artículos en revisión? En desarrollo y en builds con VITE_BORRADORES=1. */
export const showDrafts = (env: { DEV?: boolean; VITE_BORRADORES?: string }) => Boolean(env.DEV) || env.VITE_BORRADORES === '1'

/** Artículos visibles en este build. */
export const visibleResources = (drafts: boolean) => RESOURCES.filter((r) => drafts || r.status === 'publicado')
export const publishedResources = () => RESOURCES.filter((r) => r.status === 'publicado')
export const resourceBySlug = (slug?: string) => RESOURCES.find((r) => r.slug === slug)
