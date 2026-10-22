// Industrias, proyectos, necesidades y proceso (texto en español: es la fuente; traducciones en src/i18n/locales/).
import type { ImgKey } from './media'
import type { Faq, PlateKind, QuoteType, Step } from './solutions'

// ---------- Necesidades (enlaces ?necesidad= del cotizador; el explorador completo está en explorer.ts) ----------
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
    services: ['diseno-e-ingenieria', 'cableado-estructurado', 'racks-y-site', 'redes-empresariales', 'wifi-empresarial'],
    answer: 'Se parte de un levantamiento y un diseño: ubicación del site, trayectorias, cantidad de nodos, equipo activo y cobertura inalámbrica.',
    prepare: ['Planos o croquis del inmueble', 'Número aproximado de usuarios y puestos', 'Fecha prevista de ocupación'],
    quoteType: 'cableado',
  },
  {
    id: 'ampliar',
    label: 'Ampliar la infraestructura existente',
    context: 'Más nodos, áreas o capacidad',
    services: ['cableado-estructurado', 'redes-empresariales', 'racks-y-site', 'certificacion-y-pruebas'],
    answer: 'Revisamos lo instalado antes de agregar: capacidad del rack, puertos libres, distancias y estado de la documentación.',
    prepare: ['Fotografías del rack o site actual', 'Cantidad de nodos nuevos', 'Áreas que se integran'],
    quoteType: 'infra',
  },
  {
    id: 'edificios',
    label: 'Conectar edificios o naves',
    context: 'Enlace entre construcciones del mismo predio',
    services: ['fibra-optica', 'enlaces-inalambricos', 'redes-empresariales'],
    answer: 'Normalmente fibra óptica por ducto o vía aérea, con medición OTDR. Si no hay trayectoria posible, se evalúa un enlace inalámbrico punto a punto.',
    prepare: ['Distancia aproximada entre edificios', 'Si existe ducto o registro disponible', 'Fotografías de ambos extremos'],
    quoteType: 'fibra',
  },
  {
    id: 'cctv',
    label: 'Modernizar el sistema de videovigilancia',
    context: 'Migración, ampliación o reemplazo',
    services: ['cctv-videovigilancia', 'redes-empresariales', 'deteccion-perimetral', 'mantenimiento-y-soporte'],
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
export interface ProcessStep { n: string; title: string; short: string; detail: string; output: string[] }

export const PROCESS: ProcessStep[] = [
  { n: '01', title: 'Levantamiento', short: 'Visita técnica y medición en sitio.', detail: 'Recorremos el sitio con quien conoce la operación: rutas, distancias, áreas críticas, equipo existente y restricciones de obra. El levantamiento es la base de la propuesta.', output: ['Notas de campo', 'fotografías', 'medidas'] },
  { n: '02', title: 'Diseño e ingeniería', short: 'Topología y selección de tecnología.', detail: 'Definimos topología física y lógica, trayectorias, cantidades y tecnología adecuada al ambiente. Nada se cotiza antes de estar diseñado.', output: ['Planos', 'diagrama de red', 'lista de materiales'] },
  { n: '03', title: 'Propuesta técnica', short: 'Alcance, tiempos y propuesta claros.', detail: 'Entregamos alcance por partida, tiempos de ejecución y condiciones. Lo que está en la propuesta es lo que se instala.', output: ['Propuesta por partidas', 'programa'] },
  { n: '04', title: 'Instalación', short: 'Tendido, canalización y montaje.', detail: 'Personal técnico especializado ejecuta en campo, coordinado con su equipo de mantenimiento y seguridad para no detener la operación.', output: ['Bitácora de obra'] },
  { n: '05', title: 'Configuración y pruebas', short: 'Puesta en marcha y certificación.', detail: 'Configuramos equipo activo, certificamos enlaces de cobre, medimos fibra y verificamos cobertura y grabación.', output: ['Reportes de certificación', 'trazas OTDR'] },
  { n: '06', title: 'Entrega y soporte', short: 'Documentación, capacitación y mantenimiento.', detail: 'Entregamos documentación, capacitamos a su equipo y quedamos disponibles para mantenimiento preventivo y correctivo.', output: ['Memoria técnica', 'capacitación'] },
]

// ---------- Industrias ----------
export interface Industry {
  id: string
  name: string
  lede: string
  /** Descripción para buscadores (120 a 160 caracteres). */
  seoDescription: string
  /** Texto de apertura de la página del sector. */
  intro: string
  areas: string[]
  challenges: string[]
  /** Consideraciones técnicas propias del sector. */
  considerations: Step[]
  /** Cómo se ejecuta un proyecto en este sector. */
  process: Step[]
  faq: Faq[]
  services: string[]
  plate: PlateKind
  img?: ImgKey
  /** Tipo de inmueble del cotizador (SITES en src/lib/cotizacion.ts). */
  site: string
}

export const INDUSTRIES: Industry[] = [
  {
    id: 'industria',
    name: 'Industria y manufactura',
    lede: 'Redes que soportan el piso de producción, el perímetro y la conexión entre naves.',
    seoDescription: 'Infraestructura de red para plantas y naves en Monterrey: fibra entre naves, cableado industrial, WiFi para terminales, CCTV y control de acceso.',
    intro: 'Una planta exige que la red llegue a donde está la operación: naves a cientos de metros del site, áreas con polvo y vibración, y sistemas de producción, seguridad y oficinas compartiendo la misma infraestructura física.',
    areas: ['Áreas de producción', 'Accesos', 'Perímetros', 'Almacenes', 'Estacionamientos'],
    challenges: ['Distancias largas entre naves', 'Ambientes con polvo, vibración e interferencia', 'Ampliaciones sin detener la operación'],
    considerations: [
      { title: 'Distancia y backbone', text: 'Las naves suelen exceder los 90 m del cableado horizontal de cobre: el backbone entre el site y cada nave o cuarto de distribución va en fibra óptica.' },
      { title: 'Ambiente', text: 'Polvo, vibración, humedad y temperatura definen gabinetes, conectores y protecciones; cerca de motores y variadores conviene alejar o blindar el cobre.' },
      { title: 'Canalización en altura', text: 'Charola tipo malla o escalerilla a la altura de la estructura, con trayectorias que no interfieran con grúas, montacargas ni mantenimiento.' },
      { title: 'Sistemas que conviven', text: 'Producción, CCTV, control de acceso y WiFi de terminales comparten infraestructura física, cada uno en su propio segmento de red.' },
    ],
    process: [
      { title: 'Recorrido con mantenimiento y seguridad', text: 'Rutas, alturas, permisos de trabajo y áreas restringidas se revisan con su personal.' },
      { title: 'Plan por zonas', text: 'La ejecución se divide por áreas y ventanas para no detener las líneas de producción.' },
      { title: 'Instalación', text: 'Trabajo en altura y maniobras con el equipo y los protocolos que indique la planta.' },
      { title: 'Pruebas y entrega por zona', text: 'Certificación de enlaces, medición de fibra y documentación de cada área terminada.' },
    ],
    faq: [
      { q: '¿Qué conviene para conectar dos naves?', a: 'Fibra óptica por ducto o vía aérea cuando hay trayectoria; si no la hay, un enlace inalámbrico punto a punto. Se define con la distancia y la ruta.' },
      { q: '¿El WiFi funciona entre racks de almacenaje y maquinaria?', a: 'Sí, si se diseña con la altura de montaje, los materiales y las rutas de las terminales; por eso se parte de un site survey.' },
    ],
    services: ['fibra-optica', 'cableado-estructurado', 'wifi-empresarial', 'cctv-videovigilancia', 'control-de-acceso', 'control-de-asistencia'],
    plate: 'fiber',
    img: 'indIndustria',
    site: 'Planta industrial',
  },
  {
    id: 'corporativos',
    name: 'Corporativos y oficinas',
    lede: 'Infraestructura ordenada para equipos de trabajo, salas y áreas comunes.',
    seoDescription: 'Cableado, WiFi de alta densidad, site ordenado, telefonía IP y control de acceso para oficinas y corporativos en Monterrey, con entrega documentada.',
    intro: 'En una oficina la red se nota cuando falla: salas sin cobertura, puestos que no conectan después de una remodelación o un rack que nadie se atreve a tocar. El objetivo es una infraestructura ordenada que acompañe los cambios.',
    areas: ['Accesos', 'Oficinas', 'Áreas comunes', 'Recepción', 'Estacionamiento'],
    challenges: ['Alta densidad de usuarios WiFi', 'Remodelaciones y reubicaciones', 'Site saturado o sin documentación'],
    considerations: [
      { title: 'Densidad de usuarios', text: 'Salas de juntas, comedores y áreas abiertas concentran usuarios: el WiFi se diseña por capacidad, no sólo por cobertura.' },
      { title: 'Cambios de layout', text: 'Las remodelaciones son frecuentes; conviene dejar trayectorias registrables y reservas en el rack.' },
      { title: 'Cuarto de telecomunicaciones', text: 'Racks ordenados, con tabla de puertos y respaldo de energía, reducen tiempos de diagnóstico.' },
      { title: 'Accesos y visitantes', text: 'Recepción, pisos y áreas restringidas con permisos por horario, y una red separada para invitados.' },
    ],
    process: [
      { title: 'Levantamiento con TI y administración', text: 'Layout, puestos, salas, cuarto de telecomunicaciones y servicios de internet contratados.' },
      { title: 'Calendario acordado', text: 'La instalación se programa para no interrumpir la operación de las oficinas.' },
      { title: 'Migración ordenada', text: 'Puertos, equipos y extensiones se documentan para regresar a operación sin sorpresas.' },
      { title: 'Entrega documentada', text: 'Plano de nodos, certificación, tabla de puertos y mapa de access points.' },
    ],
    faq: [
      { q: '¿Pueden trabajar mientras la oficina opera?', a: 'Sí, con un calendario acordado por áreas; los trabajos de mayor impacto se programan en las ventanas que defina su equipo.' },
      { q: '¿Qué pasa con el equipo de red que ya tenemos?', a: 'Se revisa en el levantamiento; si es administrable y vigente, se integra al diseño.' },
    ],
    services: ['cableado-estructurado', 'wifi-empresarial', 'racks-y-site', 'telefonia-ip', 'control-de-acceso', 'redes-empresariales'],
    plate: 'cabling',
    img: 'indCorporativos',
    site: 'Oficinas / corporativo',
  },
  {
    id: 'cedis',
    name: 'Centros de distribución y logística',
    lede: 'Visibilidad de andenes, patios y almacén; conectividad para terminales en piso.',
    seoDescription: 'Videovigilancia de andenes y patios, WiFi para terminales, enlaces a casetas y fibra para centros de distribución y almacenes en Monterrey.',
    intro: 'Un centro de distribución combina superficies abiertas enormes, operación continua y puntos remotos como casetas y básculas. La infraestructura debe cubrir todo sin estorbar la operación de carga y descarga.',
    areas: ['Almacenes', 'Patios', 'Andenes', 'Perímetro', 'Accesos'],
    challenges: ['Grandes superficies abiertas', 'Casetas y accesos remotos', 'Cobertura WiFi entre racks de almacenaje'],
    considerations: [
      { title: 'Superficies abiertas y alturas', text: 'Cámaras y access points montados en altura, con cobertura calculada para los pasillos entre racks de almacenaje.' },
      { title: 'Andenes y patios', text: 'Cámaras que consideran la iluminación de las maniobras y lectura de placas en los accesos vehiculares.' },
      { title: 'Casetas y básculas', text: 'Ubicaciones remotas conectadas con fibra o enlaces inalámbricos punto a punto.' },
      { title: 'Terminales móviles', text: 'Escáneres y terminales en piso requieren roaming estable entre access points.' },
    ],
    process: [
      { title: 'Recorrido de la operación', text: 'Rutas de montacargas, andenes, horarios pico y puntos remotos.' },
      { title: 'Diseño por zona', text: 'Andenes, patios, almacén y perímetro con su propia cobertura y requisitos.' },
      { title: 'Instalación coordinada', text: 'Trabajos en altura y en patios programados con el equipo de operación.' },
      { title: 'Pruebas en condiciones reales', text: 'Cobertura WiFi con las terminales en uso y video de día y de noche.' },
    ],
    faq: [
      { q: '¿Cómo se conecta una caseta lejana?', a: 'Con fibra si hay trayectoria, o con un enlace inalámbrico punto a punto si no la hay; ambos llevan la caseta a la misma red.' },
      { q: '¿Se pueden registrar las placas en el acceso?', a: 'Sí, con cámaras y software de lectura de placas en los accesos vehiculares.' },
    ],
    services: ['cctv-videovigilancia', 'wifi-empresarial', 'enlaces-inalambricos', 'deteccion-perimetral', 'fibra-optica', 'control-de-acceso'],
    plate: 'cctv',
    img: 'indCedis',
    site: 'CEDIS / almacén',
  },
  {
    id: 'educacion',
    name: 'Instituciones educativas',
    lede: 'Campus conectados, aulas con cobertura y accesos controlados.',
    seoDescription: 'Fibra entre edificios, WiFi para aulas y áreas comunes, redes por perfil, control de acceso y CCTV para campus e instituciones educativas en Monterrey.',
    intro: 'Un campus reúne varios edificios, picos de usuarios en cada cambio de clase y entradas que deben controlarse. La red se diseña por edificio y por perfil de usuario.',
    areas: ['Aulas', 'Laboratorios', 'Accesos', 'Áreas comunes', 'Edificios administrativos'],
    challenges: ['Varios edificios en un mismo campus', 'Picos de usuarios simultáneos', 'Control de entradas y salidas'],
    considerations: [
      { title: 'Campus con varios edificios', text: 'Backbone de fibra entre edificios y un site central que concentra los servicios.' },
      { title: 'Picos de usuarios', text: 'Los cambios de clase y los eventos generan picos: la red inalámbrica se dimensiona por aula y área común.' },
      { title: 'Redes por perfil', text: 'Segmentos separados para alumnos, docentes, administración e invitados.' },
      { title: 'Entradas y salidas', text: 'Control de acceso en entradas, laboratorios y áreas restringidas; CCTV en accesos y estacionamientos.' },
    ],
    process: [
      { title: 'Levantamiento por edificio', text: 'Aulas, laboratorios, áreas comunes y trayectorias entre edificios.' },
      { title: 'Calendario escolar', text: 'Los trabajos de mayor impacto se programan fuera de clases o en periodos vacacionales.' },
      { title: 'Implementación por etapas', text: 'Edificio por edificio, sin dejar sin servicio a todo el campus.' },
      { title: 'Capacitación', text: 'Entrega de documentación y capacitación al personal de sistemas.' },
    ],
    faq: [
      { q: '¿Se puede separar la red de alumnos de la administrativa?', a: 'Sí: cada perfil en su propio segmento, con las reglas de acceso que defina la institución.' },
      { q: '¿Cuándo conviene instalar?', a: 'Los trabajos de mayor impacto se programan fuera de clases o en vacaciones; el resto se hace por etapas.' },
    ],
    services: ['fibra-optica', 'wifi-empresarial', 'redes-empresariales', 'control-de-acceso', 'cctv-videovigilancia'],
    plate: 'wifi',
    img: 'indEducacion',
    site: 'Institución educativa',
  },
  {
    id: 'comercio',
    name: 'Comercio y retail',
    lede: 'Seguridad en piso de venta y red confiable para puntos de venta y oficinas.',
    seoDescription: 'CCTV para piso de venta y cajas, red para puntos de venta, control de acceso y monitoreo de sucursales para comercio y retail en Monterrey.',
    intro: 'En comercio, la tecnología debe instalarse sin interrumpir la venta y operar todos los días: video en cajas y accesos, red estable para los puntos de venta y, cuando hay sucursales, visibilidad de todas.',
    areas: ['Piso de venta', 'Cajas', 'Almacén', 'Accesos'],
    challenges: ['Operación en horario extendido', 'Instalación sin interrumpir la venta', 'Monitoreo remoto de varias sucursales'],
    considerations: [
      { title: 'Piso de venta y cajas', text: 'Cobertura de cámaras en cajas, accesos y almacén, con grabación suficiente para revisar incidentes.' },
      { title: 'Sucursales', text: 'Acceso remoto al video de cada tienda con usuarios y permisos por perfil, cuando la solución lo permite.' },
      { title: 'Puntos de venta', text: 'Red estable para terminales, con segmentos separados para punto de venta, invitados y video.' },
      { title: 'Instalación sin interrumpir la venta', text: 'Trabajos programados fuera de horario o por zonas.' },
    ],
    process: [
      { title: 'Recorrido de tienda', text: 'Cajas, accesos, almacén y puntos ciegos del piso de venta.' },
      { title: 'Diseño por sucursal', text: 'Una base común que se replica con los ajustes de cada tienda.' },
      { title: 'Instalación fuera de horario', text: 'Programada para no interrumpir la venta.' },
      { title: 'Entrega y accesos', text: 'Usuarios, permisos y capacitación al personal de cada tienda.' },
    ],
    faq: [
      { q: '¿Puedo ver varias sucursales desde un mismo lugar?', a: 'Cuando la solución y la red lo permiten, se configura acceso remoto con usuarios y permisos por perfil.' },
      { q: '¿La instalación afecta la venta?', a: 'Se programa fuera de horario o por zonas para no interrumpir la operación.' },
    ],
    services: ['cctv-videovigilancia', 'cableado-estructurado', 'redes-empresariales', 'control-de-acceso', 'control-de-asistencia'],
    plate: 'access',
    img: 'indComercio',
    site: 'Comercio / edificio',
  },
]

export const industryById = (id?: string) => INDUSTRIES.find((i) => i.id === id)

// ---------- Proyectos ----------
/**
 * Estado editorial. «demostrativo»: describe un tipo de intervención con fines ilustrativos (no es un proyecto de un
 * cliente): se muestra identificado como tal, con noindex y fuera del sitemap. «autorizado»: proyecto real cuyo nombre,
 * datos y fotografías el cliente autorizó publicar; sólo esos se indexan.
 */
export type ProjectStatus = 'demostrativo' | 'autorizado'

/** Familias del filtro de proyectos, derivadas de los servicios de cada proyecto. */
export type ProjectFamily = 'infraestructura' | 'redes' | 'fibra' | 'cctv' | 'acceso'

export const FAMILY_OF: Record<string, ProjectFamily> = {
  'cableado-estructurado': 'infraestructura',
  'racks-y-site': 'infraestructura',
  'calidad-de-energia': 'infraestructura',
  'certificacion-y-pruebas': 'infraestructura',
  'redes-empresariales': 'redes',
  'wifi-empresarial': 'redes',
  'enlaces-inalambricos': 'redes',
  'telefonia-ip': 'redes',
  'fibra-optica': 'fibra',
  'cctv-videovigilancia': 'cctv',
  'deteccion-perimetral': 'cctv',
  'control-de-acceso': 'acceso',
  'control-de-asistencia': 'acceso',
}
export const PROJECT_FAMILIES: ProjectFamily[] = ['infraestructura', 'redes', 'fibra', 'cctv', 'acceso']

export interface Project {
  slug: string
  status: ProjectStatus
  title: string
  /** Id de INDUSTRIES. */
  industry: string
  plate: PlateKind
  img?: ImgKey
  code: string
  problem: string
  scope: string[]
  technologies: string[]
  services: string[]
  summary: string
  /** Descripción para buscadores (120 a 160 caracteres). */
  seoDescription?: string
  // Sólo proyectos autorizados (dejar vacío en los demostrativos):
  /** Nombre del cliente, sólo con autorización escrita. */
  client?: string
  /** Ubicación general (ciudad o municipio). */
  location?: string
  year?: number
  /** Resultados documentados (mediciones, entregables), no promesas. */
  results?: string[]
  /** Fotografías reales del proyecto. */
  gallery?: { img: ImgKey; caption: string }[]
  /** Par de fotografías reales del mismo punto, antes y después. */
  beforeAfter?: { before: ImgKey; after: ImgKey; caption: string }
}

export const PROJECTS: Project[] = [
  {
    slug: 'red-de-planta-nave-industrial',
    status: 'demostrativo',
    seoDescription: 'Caso demostrativo: backbone de fibra desde el site principal, cuarto de distribución con rack y UPS, nodos Cat6A y cobertura WiFi en piso de producción.',
    code: 'DEMO-01',
    services: ['fibra-optica', 'racks-y-site', 'cableado-estructurado', 'wifi-empresarial'],
    img: 'proyNave',
    title: 'Red de planta para nave de manufactura',
    industry: 'industria',
    plate: 'site',
    summary: 'Backbone de fibra, cuarto de distribución y cobertura inalámbrica en piso de producción.',
    problem: 'Una nave nueva necesita integrarse a la red del site principal, con terminales en piso, cámaras en accesos y una distancia que excede el alcance del cobre.',
    scope: ['Enlace de fibra desde el site principal', 'Cuarto de distribución con rack y UPS', 'Nodos Cat6A para equipo y AP', 'Diseño de cobertura WiFi en piso'],
    technologies: ['Fibra monomodo', 'Cat6A', 'Switching PoE', 'WiFi empresarial'],
  },
  {
    slug: 'renovacion-cableado-corporativo',
    status: 'demostrativo',
    seoDescription: 'Caso demostrativo: cableado de oficinas sin documentación sustituido por Cat6, con plano de nodos, rack reordenado y cada punto certificado y etiquetado.',
    code: 'DEMO-02',
    services: ['cableado-estructurado', 'racks-y-site', 'certificacion-y-pruebas'],
    img: 'proyCorporativo',
    title: 'Renovación de cableado en oficinas corporativas',
    industry: 'corporativos',
    plate: 'cabling',
    summary: 'Sustitución de cableado sin documentación y reordenamiento del site.',
    problem: 'Cableado de distintas épocas, sin etiquetado ni planos, con fallas intermitentes y un rack sin espacio para crecer.',
    scope: ['Levantamiento y plano de nodos', 'Tendido Cat6 por plafón y charola', 'Reordenamiento de rack', 'Certificación y etiquetado de cada punto'],
    technologies: ['Cat6', 'Patch panels', 'Administradores de cable', 'Certificación'],
  },
  {
    slug: 'videovigilancia-cedis',
    status: 'demostrativo',
    seoDescription: 'Caso demostrativo: videovigilancia de andenes, patios y perímetro de un CEDIS con cámaras fijas y PTZ, red PoE dedicada, NVR central y acceso remoto.',
    code: 'DEMO-03',
    services: ['cctv-videovigilancia', 'redes-empresariales', 'enlaces-inalambricos'],
    img: 'proyCedis',
    title: 'Videovigilancia en centro de distribución',
    industry: 'cedis',
    plate: 'cctv',
    summary: 'Cobertura de andenes, patios y perímetro con grabación centralizada.',
    problem: 'Andenes y patios sin cobertura continua, casetas sin conexión a la red y grabación dispersa en equipos aislados.',
    scope: ['Diseño de cobertura por zona', 'Cámaras fijas y PTZ en patios', 'Red PoE dedicada a CCTV', 'NVR central y acceso remoto'],
    technologies: ['Cámaras IP', 'PTZ', 'NVR', 'Switch PoE', 'Enlace a caseta'],
  },
  {
    slug: 'enlace-fibra-entre-edificios',
    status: 'demostrativo',
    seoDescription: 'Caso demostrativo: fibra monomodo por ducto subterráneo entre un edificio administrativo y la nave, con fusión, medición OTDR por hilo e integración al núcleo.',
    code: 'DEMO-04',
    services: ['fibra-optica', 'certificacion-y-pruebas', 'redes-empresariales'],
    img: 'proyFibra',
    title: 'Enlace de fibra entre dos edificios',
    industry: 'industria',
    plate: 'fiber',
    summary: 'Conexión de un edificio administrativo con la nave por ducto subterráneo.',
    problem: 'Dos edificios del mismo predio operan con redes separadas y un enlace inalámbrico inestable.',
    scope: ['Trayectoria por ducto subterráneo', 'Fusión y distribuidores en ambos extremos', 'Medición OTDR por hilo', 'Integración al switch de núcleo'],
    technologies: ['Fibra monomodo', 'Fusión', 'OTDR', 'Transceptores SFP'],
  },
  {
    slug: 'ordenamiento-site',
    status: 'demostrativo',
    seoDescription: 'Caso demostrativo: reorganización de un rack saturado con organizadores, patch cords nuevos, etiquetado y tabla de puertos para acortar cada diagnóstico.',
    code: 'DEMO-05',
    services: ['racks-y-site', 'calidad-de-energia', 'mantenimiento-y-soporte'],
    img: 'proySite',
    title: 'Ordenamiento de site y racks',
    industry: 'corporativos',
    plate: 'rack',
    summary: 'Reorganización de rack saturado con documentación de puertos.',
    problem: 'Patch cords sin orden, puertos sin identificar y tiempos de diagnóstico largos ante cualquier cambio.',
    scope: ['Elevación de rack actual y propuesta', 'Montaje de organizadores', 'Peinado y sustitución de patch cords', 'Etiquetado y tabla de puertos'],
    technologies: ['Rack 42U', 'Organizadores', 'Patch panels', 'UPS'],
  },
  {
    slug: 'wifi-campus-educativo',
    status: 'demostrativo',
    seoDescription: 'Caso demostrativo: WiFi para un campus educativo con site survey por edificio, access points ubicados por densidad, redes por perfil y gestión centralizada.',
    code: 'DEMO-06',
    services: ['wifi-empresarial', 'redes-empresariales', 'cableado-estructurado'],
    img: 'proyCampus',
    title: 'Conectividad para campus educativo',
    industry: 'educacion',
    plate: 'wifi',
    summary: 'Cobertura inalámbrica en aulas y áreas comunes con gestión centralizada.',
    problem: 'Varios edificios con cobertura desigual y saturación en horas pico de clases.',
    scope: ['Site survey por edificio', 'Ubicación de AP por densidad', 'Segmentación de redes por perfil', 'Gestión centralizada'],
    technologies: ['WiFi empresarial', 'Controladora', 'PoE', 'VLAN'],
  },
]

export const projectBySlug = (slug?: string) => PROJECTS.find((p) => p.slug === slug)
export const familiesOf = (p: Project) => Array.from(new Set(p.services.map((s) => FAMILY_OF[s]).filter(Boolean)))
/** Sólo los proyectos autorizados se indexan y entran al sitemap. */
export const isIndexable = (p: Project) => p.status === 'autorizado'
