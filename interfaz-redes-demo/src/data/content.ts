import type { ImgKey } from './media'
import type { PlateKind, QuoteType } from './solutions'

// ---------- Necesidades (explorador de orientación) ----------
export interface Need {
  id: string
  label: string
  context: string
  services: string[]
  answer: string
  prepare: string[]
  quoteType: QuoteType
}

export const NEEDS: Need[] = [
  {
    id: 'red-nueva',
    label: 'Implementar una red desde cero',
    context: 'Oficina, nave o edificio nuevo',
    services: ['diseno-e-ingenieria', 'cableado-estructurado', 'racks-y-site', 'switching-routing', 'wifi-empresarial'],
    answer: 'Se parte de un levantamiento y un diseño: ubicación del site, trayectorias, cantidad de nodos, equipo activo y cobertura inalámbrica.',
    prepare: ['Planos o croquis del inmueble', 'Número aproximado de usuarios y puestos', 'Fecha prevista de ocupación'],
    quoteType: 'cableado',
  },
  {
    id: 'ampliar',
    label: 'Ampliar la infraestructura existente',
    context: 'Más nodos, áreas o capacidad',
    services: ['cableado-estructurado', 'switching-routing', 'racks-y-site', 'certificacion-y-pruebas'],
    answer: 'Revisamos lo instalado antes de agregar: capacidad del rack, puertos libres, distancias y estado de la documentación.',
    prepare: ['Fotografías del rack o site actual', 'Cantidad de nodos nuevos', 'Áreas que se integran'],
    quoteType: 'infra',
  },
  {
    id: 'edificios',
    label: 'Conectar edificios o naves',
    context: 'Enlace entre construcciones del mismo predio',
    services: ['fibra-optica', 'enlaces-inalambricos', 'switching-routing'],
    answer: 'Normalmente fibra óptica por ducto o vía aérea, con medición OTDR. Si no hay trayectoria posible, se evalúa un enlace inalámbrico punto a punto.',
    prepare: ['Distancia aproximada entre edificios', 'Si existe ducto o registro disponible', 'Fotografías de ambos extremos'],
    quoteType: 'fibra',
  },
  {
    id: 'cctv',
    label: 'Modernizar el sistema de videovigilancia',
    context: 'Migración, ampliación o reemplazo',
    services: ['cctv-videovigilancia', 'switching-routing', 'deteccion-perimetral', 'mantenimiento-y-soporte'],
    answer: 'Se define cobertura por zona, tipo de cámara, grabación y la red PoE que lo soporta. Lo existente se evalúa para reutilizar lo que funcione.',
    prepare: ['Número y tipo de cámaras actuales', 'Áreas que se necesita cubrir', 'Tiempo de grabación que se requiere conservar'],
    quoteType: 'cctv',
  },
  {
    id: 'accesos',
    label: 'Implementar control de accesos',
    context: 'Peatonal, vehicular o áreas restringidas',
    services: ['control-de-acceso', 'cctv-videovigilancia', 'cableado-estructurado'],
    answer: 'Lectores, cerraduras y controladoras por puerta, con permisos por horario y área, y reportes de acceso o asistencia.',
    prepare: ['Número de puertas o accesos', 'Tipo de acceso: peatonal o vehicular', 'Número aproximado de usuarios'],
    quoteType: 'acceso',
  },
  {
    id: 'diagnostico',
    label: 'Solicitar diagnóstico o mantenimiento',
    context: 'Fallas, auditoría o servicio preventivo',
    services: ['mantenimiento-y-soporte', 'certificacion-y-pruebas', 'racks-y-site'],
    answer: 'Una visita de diagnóstico identifica el origen de la falla o el estado general, y se propone mantenimiento preventivo o correctivo.',
    prepare: ['Descripción de la falla o síntoma', 'Sistemas instalados y antigüedad', 'Horarios en que se puede intervenir'],
    quoteType: 'otro',
  },
]

// ---------- Proceso ----------
export const PROCESS = [
  { n: '01', title: 'Levantamiento', short: 'Visita técnica y medición en sitio.', detail: 'Recorremos el sitio con quien conoce la operación: rutas, distancias, áreas críticas, equipo existente y restricciones de obra. El levantamiento es la base de la propuesta.', output: 'Notas de campo · fotografías · medidas' },
  { n: '02', title: 'Diseño e ingeniería', short: 'Topología y selección de tecnología.', detail: 'Definimos topología física y lógica, trayectorias, cantidades y tecnología adecuada al ambiente. Nada se cotiza antes de estar diseñado.', output: 'Planos · diagrama de red · lista de materiales' },
  { n: '03', title: 'Propuesta técnica', short: 'Alcance, tiempos y propuesta claros.', detail: 'Entregamos alcance por partida, tiempos de ejecución y condiciones. Lo que está en la propuesta es lo que se instala.', output: 'Propuesta por partidas · programa' },
  { n: '04', title: 'Instalación', short: 'Tendido, canalización y montaje.', detail: 'Personal técnico especializado ejecuta en campo, coordinado con su equipo de mantenimiento y seguridad para no detener la operación.', output: 'Bitácora de obra' },
  { n: '05', title: 'Configuración y pruebas', short: 'Puesta en marcha y certificación.', detail: 'Configuramos equipo activo, certificamos enlaces de cobre, medimos fibra y verificamos cobertura y grabación.', output: 'Reportes de certificación · trazas OTDR' },
  { n: '06', title: 'Entrega y soporte', short: 'Documentación, capacitación y mantenimiento.', detail: 'Entregamos documentación, capacitamos a su equipo y quedamos disponibles para mantenimiento preventivo y correctivo.', output: 'Memoria técnica · capacitación' },
]

// ---------- Industrias ----------
export interface Industry {
  id: string
  name: string
  lede: string
  areas: string[]
  challenges: string[]
  services: string[]
  plate: PlateKind
  img?: ImgKey
}

export const INDUSTRIES: Industry[] = [
  {
    id: 'industria',
    name: 'Industria y manufactura',
    lede: 'Redes que soportan el piso de producción, el perímetro y la conexión entre naves.',
    areas: ['Áreas de producción', 'Accesos', 'Perímetros', 'Almacenes', 'Estacionamientos'],
    challenges: ['Distancias largas entre naves', 'Ambientes con polvo, vibración e interferencia', 'Ampliaciones sin detener la operación'],
    services: ['fibra-optica', 'cableado-estructurado', 'wifi-empresarial', 'cctv-videovigilancia'],
    plate: 'fiber',
    img: 'indIndustria',
  },
  {
    id: 'corporativos',
    name: 'Corporativos y oficinas',
    lede: 'Infraestructura ordenada para equipos de trabajo, salas y áreas comunes.',
    areas: ['Accesos', 'Oficinas', 'Áreas comunes', 'Recepción', 'Estacionamiento'],
    challenges: ['Alta densidad de usuarios WiFi', 'Remodelaciones y reubicaciones', 'Site saturado o sin documentación'],
    services: ['cableado-estructurado', 'wifi-empresarial', 'control-de-acceso', 'racks-y-site'],
    plate: 'cabling',
    img: 'indCorporativos',
  },
  {
    id: 'cedis',
    name: 'Centros de distribución',
    lede: 'Visibilidad de andenes, patios y almacén; conectividad para terminales en piso.',
    areas: ['Almacenes', 'Patios', 'Andenes', 'Perímetro', 'Accesos'],
    challenges: ['Grandes superficies abiertas', 'Casetas y accesos remotos', 'Cobertura WiFi entre racks de almacenaje'],
    services: ['cctv-videovigilancia', 'wifi-empresarial', 'enlaces-inalambricos', 'deteccion-perimetral'],
    plate: 'cctv',
    img: 'indCedis',
  },
  {
    id: 'educacion',
    name: 'Instituciones educativas',
    lede: 'Campus conectados, aulas con cobertura y accesos controlados.',
    areas: ['Aulas', 'Laboratorios', 'Accesos', 'Áreas comunes', 'Edificios administrativos'],
    challenges: ['Varios edificios en un mismo campus', 'Picos de usuarios simultáneos', 'Control de entradas y salidas'],
    services: ['fibra-optica', 'wifi-empresarial', 'control-de-acceso', 'cctv-videovigilancia'],
    plate: 'wifi',
    img: 'indEducacion',
  },
  {
    id: 'comercio',
    name: 'Comercio y edificios',
    lede: 'Seguridad en piso de venta y red confiable para puntos de venta y oficinas.',
    areas: ['Piso de venta', 'Cajas', 'Almacén', 'Accesos'],
    challenges: ['Operación en horario extendido', 'Instalación sin interrumpir la venta', 'Monitoreo remoto de varias sucursales'],
    services: ['cctv-videovigilancia', 'cableado-estructurado', 'switching-routing', 'control-de-acceso'],
    plate: 'access',
    img: 'indComercio',
  },
]

// ---------- Proyectos (ilustrativos, pendientes de validación) ----------
export type ProjectCategory = 'Infraestructura TI industrial' | 'Fibra óptica' | 'CCTV' | 'Racks y site' | 'Redes corporativas'

export interface Project {
  slug: string
  title: string
  category: ProjectCategory
  sector: string
  plate: PlateKind
  img?: ImgKey
  code: string
  problem: string
  scope: string[]
  technologies: string[]
  services: string[]
  summary: string
}

export const PROJECT_CATEGORIES: ProjectCategory[] = ['Infraestructura TI industrial', 'Fibra óptica', 'CCTV', 'Racks y site', 'Redes corporativas']

export const PROJECTS: Project[] = [
  {
    slug: 'red-de-planta-nave-industrial',
    code: 'DEMO-01',
    services: ['fibra-optica', 'racks-y-site', 'cableado-estructurado', 'wifi-empresarial'],
    img: 'proyNave',
    title: 'Red de planta para nave de manufactura',
    category: 'Infraestructura TI industrial',
    sector: 'Industria',
    plate: 'site',
    summary: 'Backbone de fibra, cuarto de distribución y cobertura inalámbrica en piso de producción.',
    problem: 'Una nave nueva necesita integrarse a la red del site principal, con terminales en piso, cámaras en accesos y una distancia que excede el alcance del cobre.',
    scope: ['Enlace de fibra desde el site principal', 'Cuarto de distribución con rack y UPS', 'Nodos Cat6A para equipo y AP', 'Diseño de cobertura WiFi en piso'],
    technologies: ['Fibra monomodo', 'Cat6A', 'Switching PoE', 'WiFi empresarial'],
  },
  {
    slug: 'renovacion-cableado-corporativo',
    code: 'DEMO-02',
    services: ['cableado-estructurado', 'racks-y-site', 'certificacion-y-pruebas'],
    img: 'proyCorporativo',
    title: 'Renovación de cableado en oficinas corporativas',
    category: 'Redes corporativas',
    sector: 'Corporativo',
    plate: 'cabling',
    summary: 'Sustitución de cableado sin documentación y reordenamiento del site.',
    problem: 'Cableado de distintas épocas, sin etiquetado ni planos, con fallas intermitentes y un rack sin espacio para crecer.',
    scope: ['Levantamiento y plano de nodos', 'Tendido Cat6 por plafón y charola', 'Reordenamiento de rack', 'Certificación y etiquetado de cada punto'],
    technologies: ['Cat6', 'Patch panels', 'Administradores de cable', 'Certificación'],
  },
  {
    slug: 'videovigilancia-cedis',
    code: 'DEMO-03',
    services: ['cctv-videovigilancia', 'switching-routing', 'enlaces-inalambricos'],
    img: 'proyCedis',
    title: 'Videovigilancia en centro de distribución',
    category: 'CCTV',
    sector: 'CEDIS',
    plate: 'cctv',
    summary: 'Cobertura de andenes, patios y perímetro con grabación centralizada.',
    problem: 'Andenes y patios sin cobertura continua, casetas sin conexión a la red y grabación dispersa en equipos aislados.',
    scope: ['Diseño de cobertura por zona', 'Cámaras fijas y PTZ en patios', 'Red PoE dedicada a CCTV', 'NVR central y acceso remoto'],
    technologies: ['Cámaras IP', 'PTZ', 'NVR', 'Switch PoE', 'Enlace a caseta'],
  },
  {
    slug: 'enlace-fibra-entre-edificios',
    code: 'DEMO-04',
    services: ['fibra-optica', 'certificacion-y-pruebas', 'switching-routing'],
    img: 'proyFibra',
    title: 'Enlace de fibra entre dos edificios',
    category: 'Fibra óptica',
    sector: 'Industria',
    plate: 'fiber',
    summary: 'Conexión de un edificio administrativo con la nave por ducto subterráneo.',
    problem: 'Dos edificios del mismo predio operan con redes separadas y un enlace inalámbrico inestable.',
    scope: ['Trayectoria por ducto subterráneo', 'Fusión y distribuidores en ambos extremos', 'Medición OTDR por hilo', 'Integración al switch de núcleo'],
    technologies: ['Fibra monomodo', 'Fusión', 'OTDR', 'Transceptores SFP'],
  },
  {
    slug: 'ordenamiento-site',
    code: 'DEMO-05',
    services: ['racks-y-site', 'calidad-de-energia', 'mantenimiento-y-soporte'],
    img: 'proySite',
    title: 'Ordenamiento de site y racks',
    category: 'Racks y site',
    sector: 'Corporativo',
    plate: 'rack',
    summary: 'Reorganización de rack saturado con documentación de puertos.',
    problem: 'Patch cords sin orden, puertos sin identificar y tiempos de diagnóstico largos ante cualquier cambio.',
    scope: ['Elevación de rack actual y propuesta', 'Montaje de organizadores', 'Peinado y sustitución de patch cords', 'Etiquetado y tabla de puertos'],
    technologies: ['Rack 42U', 'Organizadores', 'Patch panels', 'UPS'],
  },
  {
    slug: 'wifi-campus-educativo',
    code: 'DEMO-06',
    services: ['wifi-empresarial', 'switching-routing', 'cableado-estructurado'],
    img: 'proyCampus',
    title: 'Conectividad para campus educativo',
    category: 'Redes corporativas',
    sector: 'Educación',
    plate: 'wifi',
    summary: 'Cobertura inalámbrica en aulas y áreas comunes con gestión centralizada.',
    problem: 'Varios edificios con cobertura desigual y saturación en horas pico de clases.',
    scope: ['Site survey por edificio', 'Ubicación de AP por densidad', 'Segmentación de redes por perfil', 'Gestión centralizada'],
    technologies: ['WiFi empresarial', 'Controladora', 'PoE', 'VLAN'],
  },
]

export const projectBySlug = (slug?: string) => PROJECTS.find((p) => p.slug === slug)
