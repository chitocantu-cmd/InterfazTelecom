// PROVISIONAL: copia del español con la forma de una traducción, sólo para compilar mientras se escriben los idiomas.
import { INDUSTRIES, NEEDS, PROCESS, PROJECTS } from '../../data/content'
import { EXTRAS, LOCATIONS, PLACES, RULE_TEXT, SCENARIOS, SIZES, STAGES } from '../../data/explorer'
import { CATEGORIES, SERVICES } from '../../data/solutions'
import type { ContentTranslation } from '../content'
import es from '../messages/es'

const rec = <T extends { label: string; id: string }>(list: T[]) => Object.fromEntries(list.map((o) => [o.id, o.label]))
export const provisional = {
  messages: es,
  content: {
    categories: Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as unknown as ContentTranslation['categories'],
    services: Object.fromEntries(SERVICES.map((s) => [s.slug, s])),
    industries: Object.fromEntries(INDUSTRIES.map((i) => [i.id, i])),
    projects: Object.fromEntries(PROJECTS.map((p) => [p.slug, p])),
    needs: Object.fromEntries(NEEDS.map((n) => [n.id, n])),
    process: PROCESS,
    explorer: { scenarios: Object.fromEntries(SCENARIOS.map((s) => [s.id, s])), places: rec(PLACES), locations: rec(LOCATIONS), sizes: rec(SIZES), stages: rec(STAGES), extras: rec(EXTRAS), rules: RULE_TEXT },
  } satisfies ContentTranslation,
}
