import type { ImgKey } from './media'

export type PlateKind = 'rack' | 'fiber' | 'cctv' | 'cabling' | 'wifi' | 'access' | 'site' | 'engineering'
export type CategoryId = 'infraestructura' | 'fibra' | 'seguridad' | 'conectividad' | 'ingenieria'
export type QuoteType = 'cableado' | 'fibra' | 'cctv' | 'acceso' | 'infra' | 'otro'

export interface Spec { label: string; value: string }
export interface SpecTable { title: string; note?: string; columns: string[]; rows: string[][] }

export interface Service {
  slug: string
  name: string
  category: CategoryId
  short: string
  plate: PlateKind
  img?: ImgKey
  code: string
  intro: string
  applications: string[]
  scope: string[]
  deliverables: string[]
  keySpecs: Spec[]
  quoteType: QuoteType
  related: string[]
  featured?: boolean
  specTable?: SpecTable
  faq?: { q: string; a: string }[]
  process?: { title: string; text: string }[]
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
    lede: 'Videovigilancia, grabación y control de acceso.',
    technical:
      'Cámaras IP fijas, domo, bullet y PTZ; grabación en NVR; monitoreo local y remoto; control de acceso peatonal y vehicular; detección de intrusión y perímetro. Todo sobre una red diseñada para soportarlo.',
    plate: 'cctv',
    services: ['cctv-videovigilancia', 'control-de-acceso', 'deteccion-perimetral'],
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
    services: ['switching-routing', 'wifi-empresarial', 'enlaces-inalambricos', 'telefonia-ip'],
    cta: 'Cotizar conectividad',
  },
  {
    id: 'ingenieria',
    img: 'nave',
    name: 'Ingeniería y mantenimiento',
    code: 'ING',
    lede: 'Proyecto ejecutivo, soporte y calidad de energía.',
    technical:
      'Levantamiento en sitio, ingeniería y proyecto ejecutivo, mantenimiento preventivo y correctivo, y protección de energía para el equipo crítico de la red.',
    plate: 'engineering',
    services: ['diseno-e-ingenieria', 'mantenimiento-y-soporte', 'calidad-de-energia'],
    cta: 'Solicitar levantamiento',
  },
]

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
      { q: '¿Entregan certificación del cableado?', a: 'Sí. Certificamos cada punto y entregamos el reporte para respaldo de la instalación y garantía.' },
      { q: '¿Trabajan en ambientes industriales?', a: 'Sí, con materiales y protecciones aptos para la nave, el piso de producción y las condiciones de cada área.' },
    ],
    quoteType: 'cableado',
    related: ['fibra-optica', 'racks-y-site', 'wifi-empresarial'],
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
    ],
    quoteType: 'fibra',
    related: ['cableado-estructurado', 'racks-y-site', 'enlaces-inalambricos'],
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
    applications: ['Site nuevo en oficina o nave', 'Reordenamiento de un rack saturado', 'Migración de equipo activo', 'Preparación para auditoría o crecimiento'],
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
    quoteType: 'infra',
    related: ['cableado-estructurado', 'switching-routing', 'calidad-de-energia'],
  },
  {
    slug: 'wifi-empresarial',
    code: 'CON-02',
    img: 'wifi',
    name: 'WiFi empresarial',
    category: 'conectividad',
    short: 'Site survey, diseño de cobertura y controladoras.',
    plate: 'wifi',
    intro:
      'Diseñamos la red inalámbrica a partir del espacio real: materiales, densidad de usuarios y aplicaciones. Cobertura para oficinas, naves e industria sin depender de repetidores improvisados.',
    applications: ['Oficinas con alta densidad de usuarios', 'Naves y almacenes con escáneres y terminales', 'Salas de juntas y áreas comunes', 'Campus y edificios múltiples'],
    scope: ['Site survey y mapa de cobertura', 'Ubicación y montaje de access points', 'Cableado y alimentación PoE', 'Controladora o gestión centralizada', 'Redes separadas para invitados y operación', 'Pruebas de cobertura'],
    deliverables: ['Mapa de ubicación de AP', 'Configuración documentada', 'Pruebas de cobertura'],
    keySpecs: [
      { label: 'Diseño', value: 'Site survey' },
      { label: 'Gestión', value: 'Controladora' },
      { label: 'Alimentación', value: 'PoE' },
    ],
    quoteType: 'infra',
    related: ['switching-routing', 'cableado-estructurado'],
  },
  {
    slug: 'switching-routing',
    code: 'CON-01',
    img: 'aisle',
    name: 'Redes empresariales',
    category: 'conectividad',
    short: 'Switching, routing, segmentación por VLAN y PoE.',
    plate: 'rack',
    intro:
      'Configuramos switches y routers para separar la operación en segmentos, dar prioridad al tráfico crítico y controlar qué se comunica con qué. La base para que voz, video, datos y seguridad convivan en la misma red.',
    applications: ['Separar CCTV, voz y datos', 'Alimentar cámaras y AP con PoE', 'Conectar sedes', 'Sustituir equipo sin administración'],
    scope: ['Diseño de VLAN y direccionamiento', 'Configuración de switches de núcleo y acceso', 'PoE para cámaras, AP y telefonía', 'Routing y salida a internet', 'Respaldo de configuraciones'],
    deliverables: ['Diagrama lógico', 'Respaldo de configuraciones', 'Tabla de VLAN y direccionamiento'],
    keySpecs: [
      { label: 'Segmentación', value: 'VLAN' },
      { label: 'Alimentación', value: 'PoE' },
      { label: 'Documento', value: 'Diagrama lógico' },
    ],
    quoteType: 'infra',
    related: ['wifi-empresarial', 'racks-y-site', 'cctv-videovigilancia'],
  },
  {
    slug: 'enlaces-inalambricos',
    code: 'CON-03',
    name: 'Enlaces punto a punto y multipunto',
    category: 'conectividad',
    short: 'Conexión de sedes y ubicaciones remotas sin cable.',
    plate: 'fiber',
    intro:
      'Cuando no hay trayectoria para fibra o se necesita conectar una caseta, un patio o una sede cercana, diseñamos enlaces inalámbricos punto a punto (PtP) o punto a multipunto (PtMP).',
    applications: ['Casetas de vigilancia y accesos', 'Patios y estacionamientos', 'Sedes cercanas', 'Respaldo de un enlace de fibra'],
    scope: ['Validación de línea de vista', 'Selección de radios y antenas', 'Montaje en mástil o estructura', 'Alineación y configuración', 'Pruebas de desempeño'],
    deliverables: ['Diagrama de enlace', 'Configuración', 'Pruebas'],
    keySpecs: [
      { label: 'Tipo', value: 'PtP · PtMP' },
      { label: 'Requisito', value: 'Línea de vista' },
      { label: 'Uso', value: 'Sedes · casetas' },
    ],
    quoteType: 'infra',
    related: ['fibra-optica', 'cctv-videovigilancia'],
  },
  {
    slug: 'telefonia-ip',
    code: 'CON-04',
    name: 'Voz y telefonía IP',
    category: 'conectividad',
    short: 'Conmutadores y telefonía integrados a la red de datos.',
    plate: 'cabling',
    intro: 'Integramos conmutadores y teléfonos IP sobre la red de datos, con segmentación y prioridad para la voz.',
    applications: ['Oficinas y corporativos', 'Recepciones y áreas de atención', 'Migración desde telefonía análoga'],
    scope: ['Cableado y nodos de voz', 'Configuración de VLAN de voz', 'Alimentación PoE de teléfonos', 'Integración con conmutador'],
    deliverables: ['Plano de extensiones', 'Configuración documentada'],
    keySpecs: [
      { label: 'Integración', value: 'Voz y datos' },
      { label: 'Red', value: 'VLAN de voz' },
      { label: 'Equipos', value: 'PoE' },
    ],
    quoteType: 'infra',
    related: ['cableado-estructurado', 'switching-routing'],
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
      { q: '¿Puedo ver las cámaras desde el celular?', a: 'Cuando la solución y la red lo permiten, configuramos acceso remoto con usuarios y permisos por perfil.' },
      { q: '¿Dan mantenimiento a sistemas existentes?', a: 'Sí: diagnóstico, mantenimiento preventivo y correctivo de sistemas instalados.' },
    ],
    quoteType: 'cctv',
    related: ['control-de-acceso', 'switching-routing', 'fibra-optica'],
  },
  {
    slug: 'control-de-acceso',
    code: 'SEG-02',
    img: 'access',
    name: 'Control de acceso',
    category: 'seguridad',
    short: 'Accesos peatonales y vehiculares con permisos por horario y área.',
    plate: 'access',
    intro:
      'Administramos quién entra, a dónde y en qué horario. Accesos peatonales y vehiculares con la tecnología de identificación adecuada para el personal, y reportes de acceso o asistencia.',
    applications: ['Accesos principales y recepciones', 'Áreas restringidas: site, almacén, laboratorio', 'Accesos vehiculares y casetas', 'Control de asistencia de personal'],
    scope: ['Selección de lectores e identificación', 'Cerraduras, botones de salida y sensores de puerta', 'Controladoras y cableado', 'Alta de usuarios, horarios y áreas', 'Reportes de acceso y asistencia'],
    deliverables: ['Plano de puertas', 'Matriz de permisos', 'Capacitación'],
    keySpecs: [
      { label: 'Accesos', value: 'Peatonal · vehicular' },
      { label: 'Permisos', value: 'Horario · área' },
      { label: 'Reportes', value: 'Acceso · asistencia' },
    ],
    quoteType: 'acceso',
    related: ['cctv-videovigilancia', 'switching-routing'],
  },
  {
    slug: 'deteccion-perimetral',
    code: 'SEG-03',
    name: 'Intrusión, perímetro y detección',
    category: 'seguridad',
    short: 'Seguridad perimetral, detección de intrusión, sensores de humo y lectura de placas.',
    plate: 'cctv',
    intro: 'Complementamos la videovigilancia con detección: seguridad perimetral, detección de intrusión, sensores de humo, CCTV móvil y lectura de placas.',
    applications: ['Perímetros de planta y CEDIS', 'Accesos vehiculares', 'Áreas sin presencia permanente'],
    scope: ['Análisis de perímetro y puntos vulnerables', 'Sensores y detección de intrusión', 'Lectura de placas en accesos', 'Integración con CCTV'],
    deliverables: ['Plano de zonas', 'Configuración', 'Pruebas'],
    keySpecs: [
      { label: 'Detección', value: 'Intrusión · humo' },
      { label: 'Accesos', value: 'Lectura de placas' },
      { label: 'Integración', value: 'Con CCTV' },
    ],
    quoteType: 'cctv',
    related: ['cctv-videovigilancia', 'control-de-acceso'],
  },
  {
    slug: 'diseno-e-ingenieria',
    code: 'ING-01',
    name: 'Ingeniería y proyectos',
    category: 'ingenieria',
    short: 'Levantamiento, ingeniería y proyecto ejecutivo.',
    plate: 'engineering',
    intro:
      'Una inversión en tecnología debe partir de buena ingeniería. Ingenieros, arquitectos y técnicos desarrollan el diseño y el proyecto ejecutivo para que lo que se instale responda a la operación y al crecimiento.',
    applications: ['Proyectos de construcción o ampliación', 'Licitaciones que requieren especificación técnica', 'Renovación integral de infraestructura'],
    scope: ['Levantamiento en sitio', 'Topología física y lógica', 'Selección de tecnología', 'Catálogo de conceptos y materiales', 'Proyecto ejecutivo'],
    deliverables: ['Planos', 'Memoria técnica', 'Catálogo de conceptos'],
    keySpecs: [
      { label: 'Inicio', value: 'Levantamiento' },
      { label: 'Resultado', value: 'Proyecto ejecutivo' },
      { label: 'Equipo', value: 'Ingeniería y técnicos' },
    ],
    quoteType: 'otro',
    related: ['certificacion-y-pruebas', 'cableado-estructurado'],
  },
  {
    slug: 'certificacion-y-pruebas',
    code: 'ING-02',
    img: 'patchPanel',
    name: 'Certificación de enlaces',
    category: 'fibra',
    short: 'Certificación de cada enlace y reporte entregable.',
    plate: 'fiber',
    intro: 'Probamos lo que instalamos. Cada enlace de cobre se certifica y cada hilo de fibra se mide, con reporte que respalda la instalación.',
    applications: ['Entrega de obra nueva', 'Validación de una instalación existente', 'Diagnóstico de fallas intermitentes'],
    scope: ['Certificación de enlaces de cobre', 'Medición OTDR y de pérdida en fibra', 'Pruebas de cobertura WiFi', 'Reporte por punto'],
    deliverables: ['Reporte de certificación', 'Trazas OTDR'],
    keySpecs: [
      { label: 'Cobre', value: 'Por enlace' },
      { label: 'Fibra', value: 'OTDR' },
      { label: 'Entrega', value: 'Reporte' },
    ],
    quoteType: 'cableado',
    related: ['cableado-estructurado', 'fibra-optica'],
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
    applications: ['Programas preventivos periódicos', 'Atención de fallas', 'Sistemas instalados por terceros'],
    scope: ['Diagnóstico', 'Limpieza y reordenamiento', 'Revisión de grabación y almacenamiento', 'Actualización de documentación'],
    deliverables: ['Reporte de visita', 'Recomendaciones'],
    keySpecs: [
      { label: 'Tipo', value: 'Preventivo · correctivo' },
      { label: 'Sistemas', value: 'Red · CCTV · acceso' },
      { label: 'Entrega', value: 'Reporte de visita' },
    ],
    quoteType: 'otro',
    related: ['racks-y-site', 'cctv-videovigilancia'],
  },
  {
    slug: 'calidad-de-energia',
    code: 'ING-04',
    name: 'Calidad de energía',
    category: 'ingenieria',
    short: 'UPS y protección para el equipo crítico de la red.',
    plate: 'rack',
    intro: 'Protegemos la inversión con equipos que cuidan la calidad de energía del site: UPS, PDU y protección para switches, NVR y servidores.',
    applications: ['Site y racks de comunicaciones', 'NVR y grabación', 'Áreas con variaciones de voltaje'],
    scope: ['Dimensionamiento de carga', 'UPS y PDU en rack', 'Integración y pruebas'],
    deliverables: ['Cálculo de carga', 'Instalación documentada'],
    keySpecs: [
      { label: 'Equipo', value: 'UPS · PDU' },
      { label: 'Protege', value: 'Red · NVR' },
      { label: 'Base', value: 'Cálculo de carga' },
    ],
    quoteType: 'infra',
    related: ['racks-y-site', 'mantenimiento-y-soporte'],
  },
]

export const serviceBySlug = (slug?: string) => SERVICES.find((s) => s.slug === slug)
export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!
export const servicesOf = (id: CategoryId) => categoryById(id).services.map((slug) => serviceBySlug(slug)!).filter(Boolean)

export const QUOTE_TYPES: { id: QuoteType; label: string; hint: string }[] = [
  { id: 'cableado', label: 'Cableado y redes', hint: 'Nodos Cat6 / Cat6A, voz y datos' },
  { id: 'fibra', label: 'Fibra óptica', hint: 'Enlaces entre edificios, racks o pisos' },
  { id: 'cctv', label: 'CCTV', hint: 'Cámaras, grabación y monitoreo' },
  { id: 'acceso', label: 'Control de acceso', hint: 'Peatonal, vehicular o asistencia' },
  { id: 'infra', label: 'Infraestructura TI', hint: 'Site, racks, switching, WiFi' },
  { id: 'otro', label: 'Otro proyecto', hint: 'Ingeniería, mantenimiento o integral' },
]
