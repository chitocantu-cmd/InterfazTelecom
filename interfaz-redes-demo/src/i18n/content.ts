// Contenido localizado: el catálogo en español (src/data/) con los textos de otro idioma encima. Los campos que no se
// traducen (slug, imágenes, servicios relacionados, tipo de cotización) siempre salen de los datos en español.
import { INDUSTRIES, NEEDS, PROCESS, PROJECTS, type Industry, type Need, type ProcessStep, type Project } from '../data/content'
import { EXTRAS, LOCATIONS, PLACES, RULE_TEXT, SCENARIOS, SIZES, STAGES, type Option, type Scenario } from '../data/explorer'
import { CATEGORIES, SERVICES, type Category, type CategoryId, type Faq, type Service, type Spec, type SpecTable, type Step } from '../data/solutions'

export interface ServiceText {
  name: string
  short: string
  seoDescription?: string
  intro: string
  problems: string[]
  applications: string[]
  scope: string[]
  deliverables: string[]
  keySpecs: Spec[]
  options?: Step[]
  specTable?: SpecTable
  faq: Faq[]
  process: Step[]
}
export type CategoryText = Pick<Category, 'name' | 'lede' | 'technical' | 'cta'>
export type IndustryText = Pick<Industry, 'name' | 'lede' | 'seoDescription' | 'intro' | 'areas' | 'challenges' | 'considerations' | 'process' | 'faq'>
export type ProjectText = Pick<Project, 'title' | 'summary' | 'problem' | 'scope' | 'technologies' | 'seoDescription'>
export type NeedText = Pick<Need, 'label' | 'context'>
export type ProcessText = Pick<ProcessStep, 'title' | 'short' | 'detail' | 'output'>
export type ScenarioText = Pick<Scenario, 'label' | 'hint' | 'prepare' | 'questions'>

/** Textos de un idioma. Debe cubrir todos los ids del catálogo: el prerender falla si falta alguno. */
export interface ContentTranslation {
  categories: Record<CategoryId, CategoryText>
  services: Record<string, ServiceText>
  industries: Record<string, IndustryText>
  projects: Record<string, ProjectText>
  needs: Record<string, NeedText>
  process: ProcessText[]
  explorer: {
    scenarios: Record<string, ScenarioText>
    places: Record<string, string>
    locations: Record<string, string>
    sizes: Record<string, string>
    stages: Record<string, string>
    extras: Record<string, string>
    rules: typeof RULE_TEXT
  }
}

export interface Content {
  categories: Category[]
  services: Service[]
  industries: Industry[]
  projects: Project[]
  needs: Need[]
  process: ProcessStep[]
  explorer: {
    scenarios: Scenario[]
    places: (Option & { site: string })[]
    locations: Option[]
    sizes: Option[]
    stages: Option[]
    extras: (Option & { service: string })[]
    rules: typeof RULE_TEXT
  }
  serviceBySlug: (slug?: string) => Service | undefined
  categoryById: (id: CategoryId) => Category
  servicesOf: (id: CategoryId) => Service[]
  industryById: (id?: string) => Industry | undefined
  projectBySlug: (slug?: string) => Project | undefined
}

const relabel = <T extends Option>(list: T[], labels?: Record<string, string>): T[] => list.map((o) => ({ ...o, label: labels?.[o.id] ?? o.label }))

/** Catálogo en el idioma de `tr` (sin `tr`, el español). */
export function buildContent(tr?: ContentTranslation): Content {
  const categories = CATEGORIES.map((c) => ({ ...c, ...tr?.categories[c.id] }))
  const services = SERVICES.map((s) => ({ ...s, ...tr?.services[s.slug] }))
  const industries = INDUSTRIES.map((i) => ({ ...i, ...tr?.industries[i.id] }))
  const projects = PROJECTS.map((p) => ({ ...p, ...tr?.projects[p.slug] }))
  const needs = NEEDS.map((n) => ({ ...n, ...tr?.needs[n.id] }))
  const process = PROCESS.map((p, i) => ({ ...p, ...tr?.process[i] }))
  const scenarios = SCENARIOS.map((s) => ({ ...s, ...tr?.explorer.scenarios[s.id] }))
  const serviceBySlug = (slug?: string) => services.find((s) => s.slug === slug)
  const categoryById = (id: CategoryId) => categories.find((c) => c.id === id)!
  return {
    categories,
    services,
    industries,
    projects,
    needs,
    process,
    explorer: {
      scenarios,
      places: relabel(PLACES, tr?.explorer.places),
      locations: relabel(LOCATIONS, tr?.explorer.locations),
      sizes: relabel(SIZES, tr?.explorer.sizes),
      stages: relabel(STAGES, tr?.explorer.stages),
      extras: relabel(EXTRAS, tr?.explorer.extras),
      rules: tr?.explorer.rules ?? RULE_TEXT,
    },
    serviceBySlug,
    categoryById,
    servicesOf: (id) => categoryById(id).services.map((slug) => serviceBySlug(slug)!).filter(Boolean),
    industryById: (id) => industries.find((i) => i.id === id),
    projectBySlug: (slug) => projects.find((p) => p.slug === slug),
  }
}

/** Ids del catálogo que le faltan a una traducción (lo revisa el prerender: un hueco detiene el build). */
export function missingContent(tr: ContentTranslation): string[] {
  const miss: string[] = []
  const check = (kind: string, ids: string[], record: Record<string, unknown>) => ids.forEach((id) => { if (!record[id]) miss.push(`${kind}:${id}`) })
  check('categoria', CATEGORIES.map((c) => c.id), tr.categories)
  check('servicio', SERVICES.map((s) => s.slug), tr.services)
  check('industria', INDUSTRIES.map((i) => i.id), tr.industries)
  check('proyecto', PROJECTS.map((p) => p.slug), tr.projects)
  check('necesidad', NEEDS.map((n) => n.id), tr.needs)
  check('escenario', SCENARIOS.map((s) => s.id), tr.explorer.scenarios)
  check('inmueble', PLACES.map((o) => o.id), tr.explorer.places)
  check('ubicacion', LOCATIONS.map((o) => o.id), tr.explorer.locations)
  check('tamano', SIZES.map((o) => o.id), tr.explorer.sizes)
  check('etapa', STAGES.map((o) => o.id), tr.explorer.stages)
  check('extra', EXTRAS.map((o) => o.id), tr.explorer.extras)
  if (tr.process.length !== PROCESS.length) miss.push('proceso')
  return miss
}
