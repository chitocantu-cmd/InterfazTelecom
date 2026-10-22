// Catálogo de servicios (texto en español: es la fuente; las traducciones están en src/i18n/locales/).
// Sólo servicios confirmados en las fuentes de la empresa (interfazredes.com y la división Redes & TI de
// interfaz.com.mx). La clasificación completa (confirmados, por confirmar y no publicables) está en
// ARQUITECTURA_INTERFAZ.md: un servicio nuevo se agrega aquí sólo si es «confirmado».
import type { ImgKey } from './media'
import type { QuoteType } from './quote-types'

export type { QuoteType } from './quote-types'

export type PlateKind = 'rack' | 'fiber' | 'cctv' | 'cabling' | 'wifi' | 'access' | 'site' | 'engineering'
export type CategoryId = 'infraestructura' | 'fibra' | 'seguridad' | 'conectividad' | 'ingenieria'

export interface Spec { label: string; value: string }
export interface SpecTable { title: string; note?: string; columns: string[]; rows: string[][] }
export interface Step { title: string; text: string }
export interface Faq { q: string; a: string }

export interface Service {
  slug: string
  name: string
  category: CategoryId
  short: string
  /** Descripción para buscadores (120 a 160 caracteres) cuando la que se arma con `short` e `intro` queda corta o repetida. */
  seoDescription?: string
  plate: PlateKind
  img?: ImgKey
  code: string
  intro: string
  /** Problemas de la operación que resuelve (sección «Qué resuelve»). */
  problems: string[]
  applications: string[]
  scope: string[]
  deliverables: string[]
  keySpecs: Spec[]
  /** Opciones técnicas entre las que se elige en el diseño. */
  options?: Step[]
  quoteType: QuoteType
  related: string[]
  /** Sectores (id de INDUSTRIES) donde interviene con frecuencia. */
  industries: string[]
  /** Marcas que se integran (de «Marcas que manejamos» en interfaz.com.mx). No implica alianza ni certificación. */
  brands?: string[]
  featured?: boolean
  specTable?: SpecTable
  faq: Faq[]
  process: Step[]
}

export interface Category {
  id: CategoryId
  name: string
  code: string
  lede: string
  technical: string
  plate: PlateKind
  img?: ImgKey
  services: string[]
  cta: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'infraestructura',
    img: 'rack',
    name: 'Infraestructura de redes',
    code: 'INF',
    lede: 'Cableado estructurado, racks y sites de telecomunicaciones.',
    technical:
      'La capa física de la red: canalización, cableado de cobre Cat6 y Cat6A, gabinetes y cuartos de telecomunicaciones ordenados, etiquetados y certificados punto por punto.',
    plate: 'rack',
    services: ['cableado-estructurado', 'racks-y-site'],
    cta: 'Cotizar infraestructura',
  },
  {
    id: 'fibra',
    img: 'fiber',
    name: 'Fibra óptica',
    code: 'FO',
    lede: 'Enlaces entre edificios, naves, pisos y racks.',
    technical:
      'Enlaces monomodo y multimodo por ducto, vía aérea o interior. Tendido, fusión, distribuidores y medición OTDR de cada hilo, con reporte entregable.',
    plate: 'fiber',
    services: ['fibra-optica', 'certificacion-y-pruebas'],
    cta: 'Cotizar enlace de fibra',
  },
  {
    id: 'seguridad',
    img: 'cctv',
    name: 'Seguridad electrónica',
    code: 'SEG',
    lede: 'Videovigilancia, control de acceso y asistencia.',
    technical:
      'Cámaras IP fijas, domo, bullet y PTZ; grabación en NVR; monitoreo local y remoto; control de acceso peatonal y vehicular, control de asistencia y detección perimetral. Todo sobre una red diseñada para soportarlo.',
    plate: 'cctv',
    services: ['cctv-videovigilancia', 'control-de-acceso', 'control-de-asistencia', 'deteccion-perimetral'],
    cta: 'Cotizar seguridad',
  },
  {
    id: 'conectividad',
    img: 'wifi',
    name: 'Conectividad empresarial',
    code: 'CON',
    lede: 'Redes, WiFi, enlaces inalámbricos y telefonía IP.',
    technical:
      'La red activa que transporta la operación: switching con segmentación por VLAN y PoE, routing, cobertura inalámbrica diseñada con site survey y enlaces punto a punto o multipunto.',
    plate: 'wifi',
    services: ['redes-empresariales', 'wifi-empresarial', 'enlaces-inalambricos', 'telefonia-ip'],
    cta: 'Cotizar conectividad',
  },
  {
    id: 'ingenieria',
    img: 'nave',
    name: 'Ingeniería y mantenimiento',
    code: 'ING',
    lede: 'Proyecto ejecutivo, soporte y energía de respaldo.',
    technical:
      'Levantamiento en sitio, ingeniería y proyecto ejecutivo, mantenimiento preventivo y correctivo, y energía de respaldo para el equipo crítico de la red.',
    plate: 'engineering',
    services: ['diseno-e-ingenieria', 'mantenimiento-y-soporte', 'calidad-de-energia'],
    cta: 'Solicitar levantamiento',
  },
]

const ALL_INDUSTRIES = ['industria', 'corporativos', 'cedis', 'educacion', 'comercio']

export const SERVICES: Service[] = [
  {
    slug: 'cableado-estructurado',
    code: 'INF-01',
    img: 'plafon',
    name: 'Cableado estructurado',
    category: 'infraestructura',
    short: 'Voz y datos Cat6 / Cat6A con certificación de cada punto.',
    plate: 'cabling',
    featured: true,
    intro:
      'Diseñamos e instalamos la red de cobre que conecta estaciones de trabajo, access points, cámaras y telefonía con el site. Canalización, tendido, terminación, etiquetado y certificación de cada enlace, con reporte entregable.',
    problems: [
      'Fallas intermitentes por cableado sin categoría definida, mal terminado o sin documentación',
      'Racks donde nadie sabe qué puerto corresponde a qué nodo',
      'Crecimiento de puestos, access points o cámaras sin puertos ni canalización disponibles',
      'Remodelaciones que obligan a reubicar nodos sin perder el orden de la instalación',
    ],
    applications: [
      'Oficinas nuevas o remodelaciones',
      'Naves industriales y áreas de producción',
      'Reubicación o crecimiento de puestos de trabajo',
      'Renovación de cableado obsoleto o sin documentación',
      'Infraestructura para WiFi, CCTV y telefonía IP',
    ],
    scope: [
      'Levantamiento y cálculo de nodos por área',
      'Canalización: charola, tubería, ducto y escalerilla',
      'Tendido horizontal Cat6 o Cat6A según aplicación',
      'Terminación en patch panel y jack, con faceplates',
      'Organización en rack con administradores horizontales y verticales',
      'Etiquetado de nodos, patch panels y cables',
      'Pruebas de certificación por enlace y entrega de reporte',
    ],
    deliverables: ['Planos de nodos', 'Reporte de certificación por punto', 'Etiquetado consistente', 'Memoria de materiales'],
    keySpecs: [
      { label: 'Categorías', value: 'Cat6 · Cat6A' },
      { label: 'Pruebas', value: 'Certificación por enlace' },
      { label: 'Ambientes', value: 'Oficina · industria' },
    ],
    specTable: {
      title: 'Cat6 o Cat6A: cuál especificar',
      note: 'Valores de referencia de las categorías. La selección final depende del levantamiento, las aplicaciones y la vida útil esperada de la instalación.',
      columns: ['Parámetro', 'Cat6', 'Cat6A'],
      rows: [
        ['Ancho de banda', '250 MHz', '500 MHz'],
        ['10GBASE-T', 'Hasta 55 m (con condiciones)', 'Hasta 100 m'],
        ['Canal máximo', '100 m', '100 m'],
        ['Uso típico', 'Puestos de oficina, telefonía', 'Access points WiFi 6/7, backbone de cobre, PoE de alta potencia'],
        ['Diámetro y peso', 'Menor', 'Mayor: considerar ocupación de charola'],
      ],
    },
    process: [
      { title: 'Levantamiento', text: 'Recorrido en sitio, conteo de nodos por área, rutas de canalización y ubicación del site.' },
      { title: 'Diseño', text: 'Plano de nodos, trayectorias, cálculo de materiales y distancias máximas por enlace.' },
      { title: 'Instalación', text: 'Canalización, tendido, terminación y organización en rack por personal técnico.' },
      { title: 'Certificación', text: 'Prueba de cada enlace y entrega de reporte, planos y etiquetado.' },
    ],
    faq: [
      { q: '¿Cómo calculan cuántos nodos necesita mi empresa?', a: 'Consideramos usuarios, dispositivos, access points, cámaras y crecimiento previsto. Lo definimos en el levantamiento y lo dejamos documentado en el plano de nodos.' },
      { q: '¿Entregan certificación del cableado?', a: 'Sí. Certificamos cada punto y entregamos el reporte para respaldo de la instalación.' },
      { q: '¿Trabajan en ambientes industriales?', a: 'Sí, con materiales y protecciones aptos para la nave, el piso de producción y las condiciones de cada área.' },
      { q: '¿Se puede instalar sin detener la operación?', a: 'El trabajo se planea por áreas y se coordina con su equipo de mantenimiento; las ventanas de trabajo se acuerdan en la propuesta.' },
    ],
    quoteType: 'cableado',
    related: ['fibra-optica', 'racks-y-site', 'wifi-empresarial'],
    industries: ALL_INDUSTRIES,
    brands: ['Panduit', 'CommScope'],
  },
  {
    slug: 'fibra-optica',
    code: 'INF-02',
    img: 'fiber',
    name: 'Fibra óptica',
    category: 'fibra',
    short: 'Enlaces monomodo y multimodo con fusión y medición OTDR.',
    plate: 'fiber',
    featured: true,
    intro:
      'Conectamos edificios, naves, pisos y racks con enlaces de fibra óptica. Tendido aéreo, subterráneo o interior, fusión, distribuidores y medición OTDR para entregar cada hilo documentado.',
    problems: [
      'Edificios o naves del mismo predio que operan con redes separadas',
      'Enlaces inalámbricos o de cobre inestables por distancia o interferencia',
      'Backbone de cobre sin capacidad entre el site y los cuartos de distribución',
      'Fibra existente sin identificación de hilos ni mediciones',
    ],
    applications: [
      'Comunicación entre dos o más edificios del mismo predio',
      'Backbone entre site principal y cuartos de distribución',
      'Distancias que superan el alcance del cobre',
      'Zonas con interferencia electromagnética en planta',
      'Enlace de casetas, patios y perímetro para CCTV',
    ],
    scope: [
      'Selección monomodo o multimodo según distancia y equipo',
      'Trayectoria: ducto subterráneo, aérea o interior',
      'Tendido con protección mecánica adecuada a la ruta',
      'Fusión de hilos y armado de charolas de empalme',
      'Distribuidores de fibra en rack y jumpers',
      'Medición OTDR y prueba de pérdida por hilo',
      'Diagnóstico y reparación de enlaces existentes',
    ],
    deliverables: ['Trazas OTDR por hilo', 'Diagrama de trayectoria', 'Identificación de hilos y puertos', 'Reporte de pérdidas'],
    keySpecs: [
      { label: 'Tipo', value: 'Monomodo · multimodo' },
      { label: 'Empalme', value: 'Fusión' },
      { label: 'Medición', value: 'OTDR por hilo' },
    ],
    specTable: {
      title: 'Monomodo o multimodo',
      note: 'Referencia general. Las distancias reales dependen del transceptor, la velocidad y las pérdidas del enlace completo.',
      columns: ['Criterio', 'Multimodo (OM3 / OM4)', 'Monomodo (OS2)'],
      rows: [
        ['Distancia habitual', 'Dentro del edificio o campus corto', 'Entre edificios y largas distancias'],
        ['10 Gb/s', 'OM3 ~300 m · OM4 ~400 m', 'Kilómetros, según óptica'],
        ['Longitudes de onda', '850 / 1300 nm', '1310 / 1550 nm'],
        ['Uso típico', 'Backbone interior, site a IDF', 'Enlaces entre naves, edificios y sedes'],
      ],
    },
    process: [
      { title: 'Trayectoria', text: 'Validamos la ruta física, distancias, cruces y protección requerida.' },
      { title: 'Ingeniería', text: 'Definimos tipo de fibra, cantidad de hilos, distribuidores y reservas.' },
      { title: 'Tendido y fusión', text: 'Instalamos el cable, fusionamos y armamos los distribuidores en cada extremo.' },
      { title: 'Medición', text: 'Medimos con OTDR cada hilo y entregamos trazas y diagrama.' },
    ],
    faq: [
      { q: '¿Cuándo conviene fibra en lugar de cobre?', a: 'Cuando la distancia supera el alcance del cobre, cuando se conectan edificios distintos o cuando hay interferencia electromagnética en la ruta.' },
      { q: '¿Instalan fibra entre edificios?', a: 'Sí, enlaces monomodo y multimodo entre edificios, racks o pisos, por ducto subterráneo, aérea o interior.' },
      { q: '¿Qué entregan al terminar?', a: 'Trazas OTDR de cada hilo, identificación de puertos y el diagrama de la trayectoria.' },
      { q: '¿Reparan fibra existente?', a: 'Sí: diagnóstico y reparación de enlaces existentes, con medición para ubicar el punto de falla.' },
    ],
    quoteType: 'fibra',
    related: ['cableado-estructurado', 'racks-y-site', 'enlaces-inalambricos'],
    industries: ['industria', 'cedis', 'educacion', 'corporativos'],
    brands: ['Corning', 'CommScope', 'Panduit'],
  },
  {
    slug: 'racks-y-site',
    code: 'INF-03',
    img: 'site',
    name: 'Racks y site de telecomunicaciones',
    category: 'infraestructura',
    short: 'Gabinetes, organización, etiquetado y administración del cuarto de telecom.',
    plate: 'site',
    intro:
      'Montamos y reorganizamos el cuarto de telecomunicaciones: gabinetes, administradores de cable, patch panels, equipo activo y etiquetado. Un site ordenado reduce tiempos de diagnóstico y errores en cambios.',
    problems: [
      'Patch cords sin orden que alargan cualquier diagnóstico o cambio',
      'Equipo activo sin ventilación ni espacio para crecer',
      'Puertos y paneles sin identificar, sin tabla de puertos actualizada',
      'Equipo crítico sin respaldo de energía en el rack',
    ],
    applications: ['Site nuevo en oficina o nave', 'Reordenamiento de un rack saturado', 'Migración de equipo activo', 'Cuartos de distribución (MDF / IDF)', 'Preparación para auditoría o crecimiento'],
    scope: [
      'Selección de rack o gabinete y accesorios',
      'Montaje de patch panels, organizadores y equipo activo',
      'Peinado y administración de patch cords',
      'Etiquetado de puertos, paneles y cables',
      'Integración de UPS y PDU',
      'Documentación de distribución en rack',
    ],
    deliverables: ['Elevación de rack', 'Tabla de puertos', 'Etiquetado', 'Fotografía antes y después'],
    keySpecs: [
      { label: 'Alcance', value: 'Gabinete · organización' },
      { label: 'Documento', value: 'Elevación de rack' },
      { label: 'Energía', value: 'UPS · PDU' },
    ],
    options: [
      { title: 'Rack abierto de 2 o 4 postes', text: 'Para cuartos de telecomunicaciones con acceso controlado; facilita la administración de cable.' },
      { title: 'Gabinete cerrado', text: 'Para áreas compartidas o sin cuarto dedicado: puerta con llave, paneles laterales y ventilación.' },
      { title: 'Gabinete de pared', text: 'Para distribución en naves, pisos o sucursales con pocos puertos.' },
    ],
    process: [
      { title: 'Levantamiento', text: 'Inventario de equipo, puertos y conexiones, con fotografías del estado actual.' },
      { title: 'Propuesta de elevación', text: 'Distribución del rack propuesta, organizadores y ventana de trabajo.' },
      { title: 'Reordenamiento', text: 'Montaje, peinado, sustitución de patch cords y etiquetado en la ventana acordada.' },
      { title: 'Documentación', text: 'Tabla de puertos, elevación final y fotografías antes y después.' },
    ],
    faq: [
      { q: '¿Pueden reordenar un rack sin detener la red?', a: 'Se planea por bloques en una ventana acordada con su equipo de TI; cada cambio se documenta para restablecer las conexiones en el mismo orden.' },
      { q: '¿Qué entregan al terminar?', a: 'Elevación del rack, tabla de puertos, etiquetado y fotografías antes y después.' },
      { q: '¿Incluyen UPS y PDU?', a: 'Se integran en el rack según la carga del equipo; el dimensionamiento se hace con el servicio de energía y respaldo.' },
    ],
    quoteType: 'infra',
    related: ['cableado-estructurado', 'redes-empresariales', 'calidad-de-energia'],
    industries: ['corporativos', 'industria', 'educacion', 'comercio', 'cedis'],
    brands: ['Panduit', 'APC', 'Tripp Lite'],
  },
  {
    slug: 'wifi-empresarial',
    code: 'CON-02',
    img: 'wifi',
    name: 'WiFi empresarial',
    category: 'conectividad',
    short: 'Site survey, diseño de cobertura y gestión centralizada.',
    plate: 'wifi',
    intro:
      'Diseñamos la red inalámbrica a partir del espacio real: materiales, densidad de usuarios y aplicaciones. Cobertura para oficinas, naves e industria sin depender de repetidores improvisados.',
    problems: [
      'Zonas sin cobertura o con cortes al moverse por el edificio',
      'Saturación en salas, aulas o comedores con muchos usuarios',
      'Escáneres y terminales de almacén que pierden conexión entre racks de almacenaje',
      'Una sola red para empleados, invitados y equipos',
    ],
    applications: ['Oficinas con alta densidad de usuarios', 'Naves y almacenes con escáneres y terminales', 'Salas de juntas y áreas comunes', 'Campus y edificios múltiples'],
    scope: ['Site survey y mapa de cobertura', 'Ubicación y montaje de access points', 'Cableado y alimentación PoE', 'Controladora o gestión centralizada', 'Redes separadas para invitados y operación', 'Pruebas de cobertura'],
    deliverables: ['Mapa de ubicación de AP', 'Configuración documentada', 'Pruebas de cobertura'],
    keySpecs: [
      { label: 'Diseño', value: 'Site survey' },
      { label: 'Gestión', value: 'Centralizada' },
      { label: 'Alimentación', value: 'PoE' },
    ],
    options: [
      { title: 'Site survey predictivo', text: 'Diseño sobre planos con los materiales del inmueble; útil en obra nueva.' },
      { title: 'Site survey en sitio', text: 'Medición en el espacio en operación; confirma cobertura e interferencias reales.' },
      { title: 'Gestión centralizada', text: 'Controladora o plataforma de gestión para administrar y monitorear todos los access points.' },
    ],
    process: [
      { title: 'Site survey', text: 'Medición o modelado de cobertura con los materiales y la densidad de usuarios de cada área.' },
      { title: 'Diseño de cobertura', text: 'Ubicación de access points, canales y redes separadas por perfil.' },
      { title: 'Instalación', text: 'Cableado PoE, montaje y configuración de redes y segmentos.' },
      { title: 'Validación', text: 'Pruebas de cobertura y entrega del mapa de access points.' },
    ],
    faq: [
      { q: '¿Por qué mi WiFi no llega a toda la oficina?', a: 'Normalmente por la ubicación de los access points, los materiales del edificio o repetidores improvisados. El site survey identifica la causa antes de proponer equipo.' },
      { q: '¿Puedo separar la red de invitados?', a: 'Sí: redes separadas para operación, invitados y equipos, cada una en su propio segmento.' },
      { q: '¿Sirve para naves industriales?', a: 'Sí, con access points y montajes adecuados a la altura, el polvo y los racks de almacenaje.' },
    ],
    quoteType: 'infra',
    related: ['redes-empresariales', 'cableado-estructurado'],
    industries: ['corporativos', 'cedis', 'educacion', 'industria', 'comercio'],
    brands: ['Ubiquiti', 'Cisco Meraki', 'Aruba', 'TP-Link Omada'],
  },
  {
    slug: 'redes-empresariales',
    code: 'CON-01',
    img: 'aisle',
    name: 'Redes empresariales',
    category: 'conectividad',
    short: 'Switching, routing, segmentación por VLAN y PoE.',
    plate: 'rack',
    intro:
      'Configuramos switches y routers para separar la operación en segmentos, dar prioridad al tráfico crítico y controlar qué se comunica con qué. La base para que voz, video, datos y seguridad convivan en la misma red.',
    problems: [
      'Cámaras, telefonía y equipos de oficina compitiendo en la misma red plana',
      'Switches sin administración que no permiten diagnosticar fallas',
      'Sedes o naves que no comparten servicios de red',
      'Configuraciones sin respaldo ni documentación',
    ],
    applications: ['Separar CCTV, voz y datos', 'Alimentar cámaras y AP con PoE', 'Conectar sedes', 'Sustituir equipo sin administración'],
    scope: ['Diseño de VLAN y direccionamiento', 'Configuración de switches de núcleo y acceso', 'PoE para cámaras, AP y telefonía', 'Routing y salida a internet', 'Respaldo de configuraciones'],
    deliverables: ['Diagrama lógico', 'Respaldo de configuraciones', 'Tabla de VLAN y direccionamiento'],
    keySpecs: [
      { label: 'Segmentación', value: 'VLAN' },
      { label: 'Alimentación', value: 'PoE' },
      { label: 'Documento', value: 'Diagrama lógico' },
    ],
    options: [
      { title: 'Núcleo y acceso', text: 'Un switch de núcleo en el site y switches de acceso por área, conectados por fibra o cobre según la distancia.' },
      { title: 'Segmentación por VLAN', text: 'CCTV, voz, datos, invitados y equipos de operación en segmentos separados, con reglas entre ellos.' },
      { title: 'Presupuesto PoE', text: 'Potencia por switch calculada con el consumo de cada cámara, access point y teléfono.' },
    ],
    process: [
      { title: 'Levantamiento lógico', text: 'Inventario de equipo, direccionamiento actual y servicios que usa la operación.' },
      { title: 'Diseño', text: 'VLAN, direccionamiento, PoE y redundancia donde la operación lo requiere.' },
      { title: 'Implementación', text: 'Configuración y migración por etapas, con regreso controlado si algo falla.' },
      { title: 'Documentación', text: 'Diagrama lógico, tabla de VLAN y respaldo de configuraciones.' },
    ],
    faq: [
      { q: '¿Pueden trabajar con el equipo que ya tenemos?', a: 'Se revisa el equipo existente; si es administrable y está vigente, se reutiliza y se integra al diseño.' },
      { q: '¿Qué es una VLAN y para qué sirve?', a: 'Es un segmento lógico dentro de la misma red física: separa CCTV, voz, datos e invitados para que no compitan entre sí y se controle qué se comunica con qué.' },
      { q: '¿Cuánta potencia PoE necesito?', a: 'Depende de la suma de cámaras, access points y teléfonos por switch; se calcula en el diseño con el consumo de cada equipo.' },
    ],
    quoteType: 'infra',
    related: ['wifi-empresarial', 'racks-y-site', 'cctv-videovigilancia'],
    industries: ALL_INDUSTRIES,
    brands: ['Cisco', 'Aruba', 'Ubiquiti'],
  },
  {
    slug: 'enlaces-inalambricos',
    seoDescription: 'Enlaces inalámbricos punto a punto y multipunto en Monterrey para casetas, patios y sedes cercanas sin trayectoria para fibra, con validación de línea de vista.',
    code: 'CON-03',
    name: 'Enlaces punto a punto y multipunto',
    category: 'conectividad',
    short: 'Conexión de sedes y ubicaciones remotas sin cable.',
    plate: 'fiber',
    intro:
      'Cuando no hay trayectoria para fibra o se necesita conectar una caseta, un patio o una sede cercana, diseñamos enlaces inalámbricos punto a punto (PtP) o punto a multipunto (PtMP).',
    problems: [
      'Casetas, básculas o accesos sin conexión a la red',
      'Sedes cercanas sin trayectoria posible para fibra',
      'Cámaras en patios o perímetro lejos del site',
      'Un enlace principal sin respaldo',
    ],
    applications: ['Casetas de vigilancia y accesos', 'Patios y estacionamientos', 'Sedes cercanas', 'Respaldo de un enlace de fibra'],
    scope: ['Validación de línea de vista', 'Selección de radios y antenas', 'Montaje en mástil o estructura', 'Alineación y configuración', 'Pruebas de desempeño'],
    deliverables: ['Diagrama de enlace', 'Configuración', 'Pruebas'],
    keySpecs: [
      { label: 'Tipo', value: 'PtP · PtMP' },
      { label: 'Requisito', value: 'Línea de vista' },
      { label: 'Uso', value: 'Sedes · casetas' },
    ],
    options: [
      { title: 'Punto a punto (PtP)', text: 'Un enlace dedicado entre dos ubicaciones; mayor capacidad y estabilidad.' },
      { title: 'Punto a multipunto (PtMP)', text: 'Una base que conecta varias ubicaciones remotas, como casetas o postes de cámaras.' },
    ],
    process: [
      { title: 'Línea de vista', text: 'Recorrido de ambos extremos: alturas, obstáculos y puntos de montaje.' },
      { title: 'Diseño', text: 'Radios, antenas, frecuencia y estructura de montaje.' },
      { title: 'Instalación y alineación', text: 'Montaje en mástil o estructura, alineación y configuración.' },
      { title: 'Pruebas', text: 'Capacidad y estabilidad del enlace, con la configuración documentada.' },
    ],
    faq: [
      { q: '¿Qué distancia puede cubrir un enlace?', a: 'Depende de la línea de vista, la frecuencia y el equipo; se confirma con la revisión de ambos extremos.' },
      { q: '¿Fibra o enlace inalámbrico?', a: 'Si existe trayectoria física, la fibra ofrece más estabilidad; el enlace inalámbrico conviene cuando no la hay o como respaldo.' },
      { q: '¿El clima afecta el enlace?', a: 'La lluvia intensa puede reducir el margen de algunas frecuencias; el diseño lo considera según la distancia y la banda.' },
    ],
    quoteType: 'infra',
    related: ['fibra-optica', 'cctv-videovigilancia'],
    industries: ['cedis', 'industria', 'educacion'],
  },
  {
    slug: 'telefonia-ip',
    seoDescription: 'Conmutadores y teléfonos IP sobre la red de datos, con segmentación y prioridad para la voz. Para oficinas, recepciones y migración desde telefonía análoga.',
    code: 'CON-04',
    name: 'Voz y telefonía IP',
    category: 'conectividad',
    short: 'Conmutadores y telefonía integrados a la red de datos.',
    plate: 'cabling',
    intro: 'Integramos conmutadores y teléfonos IP sobre la red de datos, con segmentación y prioridad para la voz.',
    problems: [
      'Conmutadores análogos sin crecimiento ni refacciones',
      'Extensiones dispersas sin cableado ordenado',
      'Llamadas con cortes cuando la red se satura',
    ],
    applications: ['Oficinas y corporativos', 'Recepciones y áreas de atención', 'Migración desde telefonía análoga'],
    scope: ['Cableado y nodos de voz', 'Configuración de VLAN de voz', 'Alimentación PoE de teléfonos', 'Integración con conmutador'],
    deliverables: ['Plano de extensiones', 'Configuración documentada'],
    keySpecs: [
      { label: 'Integración', value: 'Voz y datos' },
      { label: 'Red', value: 'VLAN de voz' },
      { label: 'Equipos', value: 'PoE' },
    ],
    process: [
      { title: 'Inventario', text: 'Extensiones, líneas, áreas de atención y equipo actual.' },
      { title: 'Diseño', text: 'VLAN de voz, prioridad de tráfico y alimentación PoE.' },
      { title: 'Instalación', text: 'Nodos, teléfonos y configuración del conmutador.' },
      { title: 'Pruebas', text: 'Llamadas internas y externas, y plano de extensiones.' },
    ],
    faq: [
      { q: '¿Necesito cableado nuevo para telefonía IP?', a: 'Los teléfonos IP usan la red de datos; si el cableado y los switches tienen capacidad y PoE, se aprovechan.' },
      { q: '¿Por qué separar la voz en su propia VLAN?', a: 'Para darle prioridad y que una descarga o el video de una cámara no corten una llamada.' },
    ],
    quoteType: 'infra',
    related: ['cableado-estructurado', 'redes-empresariales'],
    industries: ['corporativos', 'educacion', 'comercio'],
  },
  {
    slug: 'cctv-videovigilancia',
    code: 'SEG-01',
    img: 'cctv',
    name: 'CCTV y videovigilancia',
    category: 'seguridad',
    short: 'Cámaras IP, PTZ, NVR, monitoreo local y remoto.',
    plate: 'cctv',
    featured: true,
    intro:
      'Un sistema de videovigilancia funciona cuando cámara, red, grabación y acceso se diseñan como un solo sistema. Definimos cobertura, tipo de cámara, almacenamiento y topología antes de cotizar equipo.',
    problems: [
      'Áreas críticas sin cobertura o con cámaras mal orientadas',
      'Grabaciones que no se conservan el tiempo necesario',
      'Grabadores aislados sin acceso centralizado',
      'Sistemas análogos que ya no admiten crecimiento',
    ],
    applications: [
      'Industria: producción, accesos, perímetro, almacenes, estacionamientos',
      'Corporativos: accesos, recepción, oficinas, áreas comunes',
      'Centros de distribución: andenes, patios, almacén, perímetro',
      'Comercio: piso de venta, cajas, almacén, accesos',
    ],
    scope: [
      'Levantamiento de áreas críticas y riesgos',
      'Diseño de cobertura y ubicación de cada cámara',
      'Selección de cámara fija, domo, bullet, PTZ o fisheye',
      'Red PoE, cableado y enlaces para el sistema',
      'NVR, almacenamiento y política de retención',
      'Usuarios, permisos y acceso remoto',
      'Pruebas de cobertura y grabación',
    ],
    deliverables: ['Plano de ubicación y cobertura', 'Configuración de grabación', 'Usuarios y accesos', 'Capacitación'],
    keySpecs: [
      { label: 'Cámaras', value: 'IP · domo · bullet · PTZ' },
      { label: 'Grabación', value: 'NVR' },
      { label: 'Monitoreo', value: 'Local y remoto' },
    ],
    specTable: {
      title: 'Qué cámara para cada punto',
      note: 'Guía general. La selección se confirma en sitio según distancia, iluminación y nivel de detalle requerido.',
      columns: ['Tipo', 'Dónde funciona mejor', 'Considerar'],
      rows: [
        ['Bullet', 'Perímetros, estacionamientos, fachadas', 'Disuasiva y de largo alcance; montaje expuesto'],
        ['Domo / turret', 'Interiores, recepciones, pasillos', 'Discreta, resistente a manipulación'],
        ['PTZ', 'Patios y áreas abiertas grandes', 'Requiere operador o recorridos programados'],
        ['Fisheye 360°', 'Almacenes, pisos de venta, áreas abiertas', 'Una vista panorámica en lugar de varias fijas'],
      ],
    },
    process: [
      { title: 'Qué proteger', text: 'Identificamos áreas críticas, accesos, perímetro y riesgos de la operación.' },
      { title: 'Arquitectura', text: 'Cobertura, tipo de cámara, grabación y topología de red.' },
      { title: 'Ejecución', text: 'Cableado, montaje, configuración y pruebas en sitio.' },
      { title: 'Continuidad', text: 'Capacitación, documentación y mantenimiento preventivo.' },
    ],
    faq: [
      { q: '¿Cuántas cámaras necesita mi instalación?', a: 'Se define por áreas y puntos críticos, no por un número fijo. En el levantamiento marcamos cada punto y su campo de visión en plano.' },
      { q: '¿Cuánto tiempo se conserva la grabación?', a: 'Lo define la política de retención que acuerde: con el número de cámaras, la resolución y los días requeridos se calcula el almacenamiento del NVR.' },
      { q: '¿Puedo ver las cámaras desde el celular?', a: 'Cuando la solución y la red lo permiten, configuramos acceso remoto con usuarios y permisos por perfil.' },
      { q: '¿Dan mantenimiento a sistemas existentes?', a: 'Sí: diagnóstico, mantenimiento preventivo y correctivo de sistemas instalados.' },
    ],
    quoteType: 'cctv',
    related: ['control-de-acceso', 'redes-empresariales', 'fibra-optica'],
    industries: ['industria', 'cedis', 'comercio', 'corporativos', 'educacion'],
    brands: ['Hikvision', 'Hanwha Vision', 'Dahua', 'EZVIZ'],
  },
  {
    slug: 'control-de-acceso',
    seoDescription: 'Control de acceso peatonal y vehicular en Monterrey: biométricos, tarjetas, torniquetes y cerraduras con permisos por horario y área, y reportes de acceso.',
    code: 'SEG-02',
    img: 'access',
    name: 'Control de acceso',
    category: 'seguridad',
    short: 'Accesos peatonales y vehiculares con permisos por horario y área.',
    plate: 'access',
    intro:
      'Administramos quién entra, a dónde y en qué horario. Accesos peatonales y vehiculares con la tecnología de identificación adecuada para el personal, y reportes de acceso o asistencia.',
    problems: [
      'Llaves y accesos sin registro de quién entró y cuándo',
      'Áreas restringidas (site, almacén, laboratorio) abiertas al personal en general',
      'Accesos vehiculares controlados sólo con bitácora manual',
      'Ingresos que no se pueden revisar junto con el video',
    ],
    applications: ['Accesos principales y recepciones', 'Áreas restringidas: site, almacén, laboratorio', 'Accesos vehiculares y casetas', 'Control de asistencia de personal'],
    scope: ['Selección de lectores e identificación', 'Cerraduras, botones de salida y sensores de puerta', 'Torniquetes y control vehicular según el acceso', 'Controladoras y cableado', 'Alta de usuarios, horarios y áreas', 'Reportes de acceso y asistencia'],
    deliverables: ['Plano de puertas', 'Matriz de permisos', 'Capacitación'],
    keySpecs: [
      { label: 'Accesos', value: 'Peatonal · vehicular' },
      { label: 'Permisos', value: 'Horario · área' },
      { label: 'Reportes', value: 'Acceso · asistencia' },
    ],
    options: [
      { title: 'Biométrico', text: 'Huella o rostro: evita el préstamo de credenciales.' },
      { title: 'Tarjeta y PIN', text: 'Credenciales RFID y códigos por usuario; rápidas en accesos de alto flujo.' },
      { title: 'Torniquetes', text: 'Control de flujo en entradas y recepciones.' },
      { title: 'Cerraduras electrónicas', text: 'Puertas y áreas restringidas con permisos por persona.' },
    ],
    process: [
      { title: 'Diagnóstico', text: 'Puertas, usuarios, niveles de acceso y accesos vehiculares.' },
      { title: 'Diseño', text: 'Lectores, cerraduras, controladoras y cableado por puerta.' },
      { title: 'Instalación', text: 'Montaje de lectores, cerraduras, torniquetes y controladoras.' },
      { title: 'Configuración', text: 'Usuarios, horarios, áreas, reportes y capacitación.' },
    ],
    faq: [
      { q: '¿Biométrico o tarjeta, cuál conviene?', a: 'El biométrico evita el préstamo de credenciales; la tarjeta es más rápida en accesos de alto flujo. Es común combinarlos según el área.' },
      { q: '¿Se integra con el CCTV?', a: 'Cuando los equipos son compatibles, el evento de acceso se puede revisar junto con el video de esa puerta.' },
      { q: '¿Puedo controlar horarios por persona?', a: 'Sí: permisos por persona, área y horario.' },
    ],
    quoteType: 'acceso',
    related: ['control-de-asistencia', 'cctv-videovigilancia', 'redes-empresariales'],
    industries: ['corporativos', 'industria', 'cedis', 'educacion', 'comercio'],
    brands: ['Hikvision', 'ZKTeco', 'Suprema', 'Dahua'],
  },
  {
    slug: 'control-de-asistencia',
    seoDescription: 'Control de asistencia en Monterrey con checadores biométricos y por tarjeta: horas, retardos y faltas en reportes listos para prenómina, en una o varias sedes.',
    code: 'SEG-03',
    name: 'Control de asistencia',
    category: 'seguridad',
    short: 'Checadores biométricos y por tarjeta con reportes para prenómina.',
    plate: 'access',
    intro:
      'Registramos entradas y salidas del personal con checadores biométricos o por tarjeta, y dejamos configurados los reportes de horas, retardos y faltas que usa su área de nómina.',
    problems: [
      'Checadas registradas por otra persona',
      'Cálculo manual de horas extra, retardos y faltas',
      'Asistencia de varias sucursales sin consolidar',
    ],
    applications: ['Plantas con turnos rotativos', 'Oficinas y corporativos', 'Empresas con varias sucursales', 'Sustitución de relojes checadores o listas en papel'],
    scope: [
      'Definición de turnos, tolerancias y reglas de retardo',
      'Selección y montaje de checadores',
      'Conexión a la red y al software de gestión',
      'Alta de personal con huella, rostro o credencial',
      'Configuración de reportes para prenómina',
      'Capacitación al personal administrativo',
    ],
    deliverables: ['Checadores instalados', 'Reglas de turno documentadas', 'Reportes configurados', 'Capacitación'],
    keySpecs: [
      { label: 'Identificación', value: 'Huella · rostro · tarjeta' },
      { label: 'Reportes', value: 'Horas · retardos · faltas' },
      { label: 'Integración', value: 'Control de acceso' },
    ],
    process: [
      { title: 'Definición', text: 'Turnos, reglas de retardo y los reportes que necesita nómina.' },
      { title: 'Instalación', text: 'Montaje y conexión de los checadores a la red.' },
      { title: 'Configuración', text: 'Alta de personal, turnos y reglas en el software.' },
      { title: 'Reportes', text: 'Prueba de reportes con su área de nómina y capacitación.' },
    ],
    faq: [
      { q: '¿El checador evita que alguien cheque por otro?', a: 'El biométrico (huella o rostro) identifica a la persona, a diferencia de una tarjeta, que puede prestarse.' },
      { q: '¿Calcula horas extra y retardos?', a: 'Sí, con las reglas de turno y tolerancia que se configuren.' },
      { q: '¿Se integra con mi nómina?', a: 'Los reportes se exportan en un formato que su sistema de nómina pueda importar; el formato se confirma en el levantamiento.' },
      { q: '¿Sirve para varias sucursales?', a: 'Sí: la asistencia de cada ubicación se consolida cuando los checadores están conectados a la red.' },
    ],
    quoteType: 'acceso',
    related: ['control-de-acceso', 'redes-empresariales'],
    industries: ['industria', 'corporativos', 'comercio', 'cedis'],
    brands: ['ZKTeco', 'Hikvision', 'Suprema'],
  },
  {
    slug: 'deteccion-perimetral',
    code: 'SEG-04',
    name: 'Intrusión, perímetro y detección',
    category: 'seguridad',
    short: 'Seguridad perimetral, detección de intrusión, sensores de humo y lectura de placas.',
    plate: 'cctv',
    intro: 'Complementamos la videovigilancia con detección: seguridad perimetral, detección de intrusión, sensores de humo, CCTV móvil y lectura de placas.',
    problems: [
      'Perímetros extensos donde una cámara por sí sola no alerta a tiempo',
      'Accesos vehiculares sin registro de placas',
      'Áreas sin presencia permanente: patios, almacenes cerrados, azoteas',
    ],
    applications: ['Perímetros de planta y CEDIS', 'Accesos vehiculares', 'Áreas sin presencia permanente'],
    scope: ['Análisis de perímetro y puntos vulnerables', 'Sensores y detección de intrusión', 'Sensores de humo', 'Lectura de placas en accesos', 'CCTV móvil', 'Integración con CCTV'],
    deliverables: ['Plano de zonas', 'Configuración', 'Pruebas'],
    keySpecs: [
      { label: 'Detección', value: 'Intrusión · humo' },
      { label: 'Accesos', value: 'Lectura de placas' },
      { label: 'Integración', value: 'Con CCTV' },
    ],
    options: [
      { title: 'Detección perimetral', text: 'Sensores a lo largo de bardas y cercas, divididos por zonas.' },
      { title: 'Detección de intrusión', text: 'Sensores en puertas, ventanas y áreas interiores sin presencia permanente.' },
      { title: 'Lectura de placas', text: 'Cámaras y software que registran las placas en accesos vehiculares.' },
      { title: 'CCTV móvil', text: 'Videovigilancia en ubicaciones temporales o sin infraestructura fija.' },
    ],
    process: [
      { title: 'Análisis de perímetro', text: 'Recorrido de bardas, accesos y puntos vulnerables.' },
      { title: 'Diseño por zonas', text: 'Sensores, cámaras asociadas y lectura de placas por acceso.' },
      { title: 'Instalación', text: 'Montaje, cableado y configuración de zonas.' },
      { title: 'Pruebas', text: 'Prueba de cada zona e integración con el CCTV.' },
    ],
    faq: [
      { q: '¿La detección se integra con las cámaras?', a: 'Cuando los equipos lo permiten, la alarma de una zona se asocia a la cámara que la cubre para revisar el evento.' },
      { q: '¿Qué es la lectura de placas?', a: 'Cámaras y software que registran las placas de los vehículos en un acceso para consultar entradas y salidas.' },
    ],
    quoteType: 'cctv',
    related: ['cctv-videovigilancia', 'control-de-acceso'],
    industries: ['cedis', 'industria', 'comercio'],
  },
  {
    slug: 'diseno-e-ingenieria',
    seoDescription: 'Levantamiento, ingeniería y proyecto ejecutivo en Monterrey para obra nueva, ampliaciones y licitaciones con especificación técnica de su infraestructura.',
    code: 'ING-01',
    name: 'Ingeniería y proyectos',
    category: 'ingenieria',
    short: 'Levantamiento, ingeniería y proyecto ejecutivo.',
    plate: 'engineering',
    intro:
      'Una inversión en tecnología debe partir de buena ingeniería. Ingenieros, arquitectos y técnicos desarrollan el diseño y el proyecto ejecutivo para que lo que se instale responda a la operación y al crecimiento.',
    problems: [
      'Obras que necesitan la especificación de voz, datos y seguridad antes de licitar',
      'Cotizaciones de distintos proveedores que no se pueden comparar entre sí',
      'Ampliaciones sin planos de lo que ya está instalado',
    ],
    applications: ['Proyectos de construcción o ampliación', 'Licitaciones que requieren especificación técnica', 'Renovación integral de infraestructura'],
    scope: ['Levantamiento en sitio', 'Topología física y lógica', 'Selección de tecnología', 'Catálogo de conceptos y materiales', 'Proyecto ejecutivo'],
    deliverables: ['Planos', 'Memoria técnica', 'Catálogo de conceptos'],
    keySpecs: [
      { label: 'Inicio', value: 'Levantamiento' },
      { label: 'Resultado', value: 'Proyecto ejecutivo' },
      { label: 'Equipo', value: 'Ingeniería y técnicos' },
    ],
    process: [
      { title: 'Levantamiento', text: 'Visita técnica, medición y revisión de planos con su equipo de proyecto.' },
      { title: 'Ingeniería', text: 'Topología física y lógica, trayectorias y selección de tecnología.' },
      { title: 'Proyecto ejecutivo', text: 'Planos, memoria técnica y catálogo de conceptos con cantidades.' },
      { title: 'Revisión', text: 'Ajustes con su equipo antes de licitar o ejecutar.' },
    ],
    faq: [
      { q: '¿Qué incluye un proyecto ejecutivo?', a: 'Planos de trayectorias y nodos, topología física y lógica, memoria técnica y catálogo de conceptos con cantidades.' },
      { q: '¿Pueden ejecutar el proyecto después?', a: 'Sí; el mismo equipo realiza la ingeniería y la instalación, aunque el proyecto también sirve para licitar.' },
    ],
    quoteType: 'otro',
    related: ['certificacion-y-pruebas', 'cableado-estructurado'],
    industries: ALL_INDUSTRIES,
  },
  {
    slug: 'certificacion-y-pruebas',
    seoDescription: 'Certificación de cada enlace de cobre y medición de cada hilo de fibra, con reporte entregable, para entrega de obra, validación o fallas intermitentes.',
    code: 'ING-02',
    img: 'patchPanel',
    name: 'Certificación de enlaces',
    category: 'fibra',
    short: 'Certificación de cada enlace y reporte entregable.',
    plate: 'fiber',
    intro: 'Probamos lo que instalamos. Cada enlace de cobre se certifica y cada hilo de fibra se mide, con reporte que respalda la instalación.',
    problems: [
      'Instalaciones recibidas sin evidencia de desempeño',
      'Fallas intermitentes sin causa identificada',
      'Entregas de obra que requieren respaldo documental de cada enlace',
    ],
    applications: ['Entrega de obra nueva', 'Validación de una instalación existente', 'Diagnóstico de fallas intermitentes'],
    scope: ['Certificación de enlaces de cobre', 'Medición OTDR y de pérdida en fibra', 'Pruebas de cobertura WiFi', 'Reporte por punto'],
    deliverables: ['Reporte de certificación', 'Trazas OTDR'],
    keySpecs: [
      { label: 'Cobre', value: 'Por enlace' },
      { label: 'Fibra', value: 'OTDR' },
      { label: 'Entrega', value: 'Reporte' },
    ],
    options: [
      { title: 'Certificación de cobre', text: 'Medición de cada enlace frente a los parámetros de su categoría (Cat6 o Cat6A).' },
      { title: 'Medición OTDR', text: 'Reflectometría de cada hilo: distancia, empalmes, conectores y pérdidas a lo largo del enlace.' },
      { title: 'Prueba de pérdida', text: 'Pérdida total del enlace de fibra de extremo a extremo.' },
    ],
    process: [
      { title: 'Alcance', text: 'Enlaces a probar, categoría o tipo de fibra y criterios de aceptación.' },
      { title: 'Medición', text: 'Certificación de cobre y medición de fibra en sitio.' },
      { title: 'Análisis', text: 'Identificación de enlaces fuera de parámetro y su causa probable.' },
      { title: 'Reporte', text: 'Reporte por punto y trazas, listos para archivo.' },
    ],
    faq: [
      { q: '¿Qué diferencia hay entre certificar y probar continuidad?', a: 'Una prueba de continuidad sólo confirma que los hilos conectan; la certificación mide el desempeño del enlace frente a la categoría especificada.' },
      { q: '¿Qué es una traza OTDR?', a: 'Una gráfica de reflectometría del hilo de fibra: muestra distancia, empalmes, conectores y pérdidas a lo largo del enlace.' },
      { q: '¿Certifican instalaciones de otros proveedores?', a: 'Sí, como validación o diagnóstico de una instalación existente.' },
    ],
    quoteType: 'cableado',
    related: ['cableado-estructurado', 'fibra-optica'],
    industries: ALL_INDUSTRIES,
  },
  {
    slug: 'mantenimiento-y-soporte',
    code: 'ING-03',
    img: 'escalera',
    name: 'Mantenimiento y soporte',
    category: 'ingenieria',
    short: 'Preventivo y correctivo para mantener la red disponible.',
    plate: 'site',
    intro: 'Mantenimiento preventivo y correctivo de redes, site, CCTV y control de acceso, para anticipar fallas y sostener la operación.',
    problems: [
      'Fallas que se atienden sólo cuando ya detuvieron la operación',
      'Sistemas instalados por terceros sin documentación',
      'Grabaciones de CCTV que dejaron de guardarse sin que nadie lo notara',
    ],
    applications: ['Programas preventivos periódicos', 'Atención de fallas', 'Sistemas instalados por terceros'],
    scope: ['Diagnóstico', 'Limpieza y reordenamiento', 'Revisión de grabación y almacenamiento', 'Actualización de documentación'],
    deliverables: ['Reporte de visita', 'Recomendaciones'],
    keySpecs: [
      { label: 'Tipo', value: 'Preventivo · correctivo' },
      { label: 'Sistemas', value: 'Red · CCTV · acceso' },
      { label: 'Entrega', value: 'Reporte de visita' },
    ],
    options: [
      { title: 'Preventivo', text: 'Visitas programadas para revisar racks, cableado, equipo activo, grabación y accesos.' },
      { title: 'Correctivo', text: 'Diagnóstico y reparación de fallas en sistemas propios o instalados por terceros.' },
    ],
    process: [
      { title: 'Diagnóstico inicial', text: 'Estado de cada sistema y documentación existente.' },
      { title: 'Programa', text: 'Frecuencia, alcance y ventanas de trabajo acordadas.' },
      { title: 'Visitas', text: 'Revisión, limpieza, reordenamiento y pruebas.' },
      { title: 'Reporte', text: 'Hallazgos, trabajos realizados y recomendaciones.' },
    ],
    faq: [
      { q: '¿Dan mantenimiento a sistemas instalados por otros?', a: 'Sí, previa revisión de su estado; si falta documentación, se levanta en la primera visita.' },
      { q: '¿Qué incluye una visita preventiva?', a: 'La revisión de racks, cableado, equipo activo, grabación y accesos que marque el programa, con reporte y recomendaciones.' },
    ],
    quoteType: 'otro',
    related: ['racks-y-site', 'cctv-videovigilancia'],
    industries: ALL_INDUSTRIES,
  },
  {
    slug: 'calidad-de-energia',
    seoDescription: 'UPS, PDU y plantas de luz para sites, NVR y equipo crítico de la red en Monterrey, dimensionados con la carga y coordinados con la instalación de la red.',
    code: 'ING-04',
    name: 'Energía y respaldo',
    category: 'ingenieria',
    short: 'UPS, PDU y plantas de luz para el equipo crítico de la red.',
    plate: 'rack',
    intro:
      'Cuidamos la energía del equipo que sostiene la red: UPS y PDU dimensionados para el rack y, a través de Interfaz de Monterrey, plantas de luz en renta o venta para sites, enlaces y trabajos temporales de infraestructura crítica.',
    problems: [
      'Equipo de red que se reinicia con cada variación de voltaje',
      'Grabadores que pierden video durante un corte',
      'Sites o enlaces sin suministro definitivo',
      'Migraciones y mantenimientos que requieren energía temporal',
    ],
    applications: ['Site y racks de comunicaciones', 'NVR y grabación', 'Áreas con variaciones de voltaje', 'Sites o enlaces sin suministro definitivo'],
    scope: ['Dimensionamiento de carga', 'UPS y PDU en rack', 'Integración y pruebas de respaldo', 'Plantas de luz para sites y trabajos temporales (renta o venta)'],
    deliverables: ['Cálculo de carga', 'Instalación documentada', 'Pruebas de respaldo'],
    keySpecs: [
      { label: 'Equipo', value: 'UPS · PDU · planta' },
      { label: 'Protege', value: 'Red · NVR' },
      { label: 'Base', value: 'Cálculo de carga' },
    ],
    options: [
      { title: 'UPS en línea o interactivo', text: 'El de línea entrega energía regenerada de forma continua; el interactivo corrige variaciones y pasa a batería en un corte. Se elige con la carga y la calidad del suministro.' },
      { title: 'PDU', text: 'Distribuye la energía dentro del rack; las administrables permiten medir el consumo por toma.' },
      { title: 'Planta de luz', text: 'Respaldo de mayor duración o energía temporal donde no hay suministro; se dimensiona con la carga y las corrientes de arranque.' },
    ],
    process: [
      { title: 'Revisión de carga', text: 'Equipo conectado, consumo y tiempo de respaldo requerido.' },
      { title: 'Dimensionamiento', text: 'Capacidad del UPS, baterías, PDU o planta según la carga crítica.' },
      { title: 'Instalación', text: 'Montaje, conexión e integración en el rack o el sitio.' },
      { title: 'Pruebas', text: 'Prueba de respaldo y documentación de la instalación.' },
    ],
    faq: [
      { q: '¿Cuánto tiempo de respaldo da un UPS?', a: 'Depende de la carga conectada y de las baterías; se calcula para el tiempo que hay que sostener, por ejemplo hasta un apagado ordenado o hasta que entre una planta.' },
      { q: '¿Las plantas de luz son en renta o venta?', a: 'Ambas, a través de Interfaz de Monterrey; la capacidad se define con la carga del sitio.' },
    ],
    quoteType: 'infra',
    related: ['racks-y-site', 'mantenimiento-y-soporte'],
    industries: ['industria', 'corporativos', 'cedis'],
    brands: ['APC', 'Tripp Lite'],
  },
]

export const serviceBySlug = (slug?: string) => SERVICES.find((s) => s.slug === slug)
export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!
export const servicesOf = (id: CategoryId) => categoryById(id).services.map((slug) => serviceBySlug(slug)!).filter(Boolean)
