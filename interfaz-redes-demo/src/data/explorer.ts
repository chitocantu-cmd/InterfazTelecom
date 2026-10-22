// Explorador de soluciones: escenarios, opciones y reglas con las que se sugieren servicios. Las sugerencias son
// orientativas: no calculan cantidades, precios ni ingeniería; ordenan la conversación del levantamiento técnico.
// Texto en español (fuente); traducciones en src/i18n/locales/. Las claves de la URL (?escenario=…) no se traducen.
import type { QuoteType } from './quote-types'

export interface Scenario {
  id: string
  label: string
  hint: string
  /** Servicios que suelen intervenir, en orden de relevancia. */
  services: string[]
  quoteTypes: QuoteType[]
  /** Información que conviene preparar. */
  prepare: string[]
  /** Preguntas que se resolverán en el levantamiento técnico. */
  questions: string[]
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'nueva-planta',
    label: 'Nueva planta industrial',
    hint: 'Nave o planta en construcción o por ocupar',
    services: ['diseno-e-ingenieria', 'fibra-optica', 'cableado-estructurado', 'racks-y-site', 'redes-empresariales', 'wifi-empresarial', 'cctv-videovigilancia', 'control-de-acceso'],
    quoteTypes: ['cableado', 'fibra', 'cctv', 'infra'],
    prepare: ['Planos arquitectónicos o layout de la planta', 'Ubicación prevista del site y de las áreas de producción', 'Fecha de arranque de operación'],
    questions: ['¿Dónde estará el site principal y qué distancia hay a cada área?', '¿Cuántos puestos, terminales, cámaras y accesos se prevén al arranque y a futuro?', '¿Hay restricciones de altura, ambiente o permisos de trabajo?', '¿Quién define el equipo activo: TI corporativo o el proyecto?'],
  },
  {
    id: 'nuevas-oficinas',
    label: 'Nuevas oficinas',
    hint: 'Oficina nueva, mudanza o remodelación',
    services: ['diseno-e-ingenieria', 'cableado-estructurado', 'racks-y-site', 'redes-empresariales', 'wifi-empresarial', 'telefonia-ip', 'control-de-acceso'],
    quoteTypes: ['cableado', 'infra'],
    prepare: ['Layout con mobiliario y número de puestos', 'Salas de juntas y áreas comunes', 'Fecha de ocupación'],
    questions: ['¿Cuántos puestos, salas y áreas comunes habrá?', '¿Se requiere telefonía IP o sólo datos?', '¿Qué áreas tendrán acceso restringido?', '¿Hay un cuarto de telecomunicaciones asignado?'],
  },
  {
    id: 'ampliacion-red',
    label: 'Ampliación de red',
    hint: 'Más nodos, áreas o capacidad sobre lo existente',
    services: ['cableado-estructurado', 'redes-empresariales', 'racks-y-site', 'certificacion-y-pruebas'],
    quoteTypes: ['cableado', 'infra'],
    prepare: ['Fotografías del rack y del site actual', 'Cantidad de nodos o áreas nuevas', 'Planos de las áreas que se integran'],
    questions: ['¿Cuántos puertos libres tienen hoy el rack y los switches?', '¿Existe documentación o etiquetado de lo instalado?', '¿Las áreas nuevas están a más de 90 m del rack?'],
  },
  {
    id: 'actualizacion-cctv',
    label: 'Actualización de CCTV',
    hint: 'Migrar, ampliar o reemplazar la videovigilancia',
    services: ['cctv-videovigilancia', 'redes-empresariales', 'deteccion-perimetral', 'mantenimiento-y-soporte'],
    quoteTypes: ['cctv'],
    prepare: ['Número y tipo de cámaras actuales', 'Grabador que se usa hoy', 'Áreas que se necesita cubrir', 'Días de grabación que se deben conservar'],
    questions: ['¿El sistema actual es análogo o IP?', '¿Cuántos días de grabación se deben conservar?', '¿Quién debe ver las cámaras y desde dónde?', '¿Hay áreas de noche o a contraluz?'],
  },
  {
    id: 'fibra',
    label: 'Instalación de fibra óptica',
    hint: 'Backbone, enlace entre racks o reparación',
    services: ['fibra-optica', 'certificacion-y-pruebas', 'racks-y-site'],
    quoteTypes: ['fibra'],
    prepare: ['Distancia aproximada entre los puntos', 'Fotografías de los racks en cada extremo', 'Si existe ducto o trayectoria'],
    questions: ['¿Qué distancia hay entre los puntos?', '¿Existe ducto, registro o trayectoria aérea?', '¿Qué equipo terminará la fibra en cada extremo?', '¿Cuántos hilos se requieren hoy y a futuro?'],
  },
  {
    id: 'edificios',
    label: 'Conectividad entre edificios',
    hint: 'Naves, casetas o edificios del mismo predio',
    services: ['fibra-optica', 'enlaces-inalambricos', 'redes-empresariales'],
    quoteTypes: ['fibra', 'infra'],
    prepare: ['Distancia entre los edificios', 'Fotografías de ambos extremos', 'Si hay línea de vista o posibilidad de canalizar'],
    questions: ['¿Hay línea de vista entre los edificios?', '¿Se puede canalizar entre ellos, por ducto o vía aérea?', '¿Qué servicios deben compartir: datos, cámaras, telefonía?'],
  },
  {
    id: 'control-acceso',
    label: 'Control de acceso',
    hint: 'Peatonal, vehicular, áreas restringidas o asistencia',
    services: ['control-de-acceso', 'control-de-asistencia', 'cctv-videovigilancia', 'cableado-estructurado'],
    quoteTypes: ['acceso'],
    prepare: ['Número de puertas o accesos', 'Tipo de acceso: peatonal o vehicular', 'Número aproximado de usuarios'],
    questions: ['¿Qué puertas o áreas deben controlarse?', '¿Cuántos usuarios y con qué horarios?', '¿Se necesita control de asistencia o reportes?', '¿Hay accesos vehiculares o torniquetes?'],
  },
  {
    id: 'organizacion-site',
    label: 'Organización de SITE',
    hint: 'Rack saturado, sin etiquetas o sin respaldo',
    services: ['racks-y-site', 'calidad-de-energia', 'certificacion-y-pruebas', 'mantenimiento-y-soporte'],
    quoteTypes: ['infra'],
    prepare: ['Fotografías del rack por el frente y por atrás', 'Lista del equipo activo', 'Si hay UPS y de qué capacidad'],
    questions: ['¿Cuántos racks hay y qué equipo contienen?', '¿Se puede programar una ventana de mantenimiento?', '¿El equipo tiene respaldo de energía?'],
  },
  {
    id: 'personalizado',
    label: 'Proyecto personalizado',
    hint: 'Otra necesidad o un proyecto integral',
    services: ['diseno-e-ingenieria', 'mantenimiento-y-soporte'],
    quoteTypes: ['otro'],
    prepare: ['Descripción de la necesidad', 'Planos, fotografías o documentos disponibles', 'Fecha en que se necesita'],
    questions: ['¿Qué problema debe resolver el proyecto?', '¿Qué sistemas existen hoy y cuáles se integran?', '¿Hay una fecha límite o una etapa de obra que respetar?'],
  },
]

export interface Option { id: string; label: string }

/** Tipo de instalación (el valor del cotizador es `site`, de SITES en src/lib/cotizacion.ts). */
export const PLACES: (Option & { site: string })[] = [
  { id: 'planta', label: 'Planta industrial', site: 'Planta industrial' },
  { id: 'oficinas', label: 'Oficinas / corporativo', site: 'Oficinas / corporativo' },
  { id: 'cedis', label: 'CEDIS / almacén', site: 'CEDIS / almacén' },
  { id: 'educacion', label: 'Institución educativa', site: 'Institución educativa' },
  { id: 'comercio', label: 'Comercio / edificio', site: 'Comercio / edificio' },
  { id: 'otro', label: 'Otro', site: 'Otro' },
]

/** Ubicación. La cobertura confirmada es Monterrey y su área metropolitana; fuera de ella se confirma caso por caso. */
export const LOCATIONS: Option[] = [
  { id: 'mty', label: 'Monterrey y área metropolitana' },
  { id: 'nl', label: 'Otro municipio de Nuevo León' },
  { id: 'mx', label: 'Otro estado de México' },
]

export const SIZES: Option[] = [
  { id: 'xs', label: 'Hasta 500 m² o 25 puestos' },
  { id: 's', label: '500 a 2,000 m²' },
  { id: 'm', label: '2,000 a 10,000 m²' },
  { id: 'l', label: 'Más de 10,000 m² o varios edificios' },
  { id: 'nd', label: 'Aún no lo sé' },
]

export const STAGES: Option[] = [
  { id: 'idea', label: 'Planeación o presupuesto' },
  { id: 'proyecto', label: 'Proyecto ejecutivo o licitación' },
  { id: 'obra', label: 'Obra en curso' },
  { id: 'operacion', label: 'Instalación en operación' },
]

/** Necesidades adicionales que el usuario puede marcar. */
export const EXTRAS: (Option & { service: string })[] = [
  { id: 'wifi', label: 'WiFi', service: 'wifi-empresarial' },
  { id: 'cctv', label: 'Videovigilancia', service: 'cctv-videovigilancia' },
  { id: 'acceso', label: 'Control de acceso', service: 'control-de-acceso' },
  { id: 'asistencia', label: 'Control de asistencia', service: 'control-de-asistencia' },
  { id: 'telefonia', label: 'Telefonía IP', service: 'telefonia-ip' },
  { id: 'fibra', label: 'Fibra entre edificios', service: 'fibra-optica' },
  { id: 'energia', label: 'Energía de respaldo', service: 'calidad-de-energia' },
  { id: 'mantenimiento', label: 'Mantenimiento', service: 'mantenimiento-y-soporte' },
]

/** Textos que dependen de la etapa, el tamaño o la ubicación (se agregan a lo que trae el escenario). */
export const RULE_TEXT = {
  prepareObra: 'Programa de obra y fechas de acceso al sitio',
  prepareOperacion: 'Horarios en que se puede intervenir sin afectar la operación',
  prepareGrande: 'Plano de conjunto con las distancias entre edificios o áreas',
  questionGrande: '¿Cuántos cuartos de distribución se necesitan para que ningún nodo pase de 90 m?',
  questionFuera: '¿Dónde se ubica el proyecto y hay restricciones de acceso o de horario?',
  coverageFuera: 'La cobertura fuera del área metropolitana de Monterrey se confirma con el equipo comercial.',
}

export interface ExplorerState {
  scenario?: string
  place?: string
  location?: string
  size?: string
  stage?: string
  extras: string[]
}

/** Parámetros de la URL (compartibles) ↔ estado. Se usan en /explorador y en /contacto. */
export const EXPLORER_PARAMS = { scenario: 'escenario', place: 'inmueble', location: 'ubicacion', size: 'tamano', stage: 'etapa', extras: 'extras' } as const

const known = (list: Option[], v: string | null) => (v && list.some((o) => o.id === v) ? v : undefined)

export function readExplorer(params: URLSearchParams): ExplorerState {
  return {
    scenario: known(SCENARIOS, params.get(EXPLORER_PARAMS.scenario)),
    place: known(PLACES, params.get(EXPLORER_PARAMS.place)),
    location: known(LOCATIONS, params.get(EXPLORER_PARAMS.location)),
    size: known(SIZES, params.get(EXPLORER_PARAMS.size)),
    stage: known(STAGES, params.get(EXPLORER_PARAMS.stage)),
    extras: (params.get(EXPLORER_PARAMS.extras) ?? '').split(',').filter((x) => EXTRAS.some((e) => e.id === x)),
  }
}

export function explorerQuery(s: ExplorerState): string {
  const p = new URLSearchParams()
  if (s.scenario) p.set(EXPLORER_PARAMS.scenario, s.scenario)
  if (s.place) p.set(EXPLORER_PARAMS.place, s.place)
  if (s.location) p.set(EXPLORER_PARAMS.location, s.location)
  if (s.size) p.set(EXPLORER_PARAMS.size, s.size)
  if (s.stage) p.set(EXPLORER_PARAMS.stage, s.stage)
  if (s.extras.length) p.set(EXPLORER_PARAMS.extras, s.extras.join(','))
  return p.toString()
}

export const isComplete = (s: ExplorerState) => Boolean(s.scenario && s.place && s.location && s.size && s.stage)

export interface Recommendation {
  services: string[]
  quoteTypes: QuoteType[]
  prepare: string[]
  questions: string[]
  /** La ubicación está fuera de la cobertura confirmada. */
  outside: boolean
}

/** Sugerencias del escenario + necesidades adicionales + reglas por etapa, tamaño y ubicación. */
export function recommend(s: ExplorerState, text: { scenarios: Scenario[]; rules: typeof RULE_TEXT } = { scenarios: SCENARIOS, rules: RULE_TEXT }): Recommendation | null {
  const sc = text.scenarios.find((x) => x.id === s.scenario)
  if (!sc) return null
  const services = [...sc.services]
  const add = (slug: string) => { if (!services.includes(slug)) services.push(slug) }
  for (const id of s.extras) add(EXTRAS.find((e) => e.id === id)!.service)
  // Antes de obra (planeación o licitación) o en proyectos grandes, la ingeniería va primero.
  if (s.stage === 'idea' || s.stage === 'proyecto' || s.size === 'l') {
    const i = services.indexOf('diseno-e-ingenieria')
    if (i >= 0) services.splice(i, 1)
    services.unshift('diseno-e-ingenieria')
  }
  if (s.size === 'l') add('fibra-optica')
  if (s.stage === 'operacion') add('mantenimiento-y-soporte')

  const quoteTypes = new Set<QuoteType>(sc.quoteTypes)
  const typeOf: Record<string, QuoteType> = { 'wifi-empresarial': 'infra', 'cctv-videovigilancia': 'cctv', 'control-de-acceso': 'acceso', 'control-de-asistencia': 'acceso', 'telefonia-ip': 'infra', 'fibra-optica': 'fibra', 'calidad-de-energia': 'infra' }
  for (const id of s.extras) {
    const t = typeOf[EXTRAS.find((e) => e.id === id)!.service]
    if (t) quoteTypes.add(t)
  }

  const prepare = [...sc.prepare]
  if (s.stage === 'obra') prepare.push(text.rules.prepareObra)
  if (s.stage === 'operacion') prepare.push(text.rules.prepareOperacion)
  if (s.size === 'l') prepare.push(text.rules.prepareGrande)

  const questions = [...sc.questions]
  if (s.size === 'l' || s.size === 'm') questions.push(text.rules.questionGrande)
  const outside = s.location === 'nl' || s.location === 'mx'
  if (outside) questions.push(text.rules.questionFuera)

  return { services, quoteTypes: [...quoteTypes], prepare, questions, outside }
}
