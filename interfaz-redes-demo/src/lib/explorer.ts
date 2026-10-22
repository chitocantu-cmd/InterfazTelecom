// Resumen del explorador de soluciones: el mismo en pantalla (idioma de la página) y en la solicitud (español,
// para el equipo comercial).
import { recommend, type ExplorerState } from '../data/explorer'
import type { I18n } from '../i18n'

/** Líneas del resumen en el idioma de `i18n` (null si no hay escenario). */
export function summaryLines(s: ExplorerState, { t, c }: Pick<I18n, 't' | 'c'>): string[] | null {
  const sc = c.explorer.scenarios.find((x) => x.id === s.scenario)
  const rec = recommend(s, { scenarios: c.explorer.scenarios, rules: c.explorer.rules })
  if (!sc || !rec) return null
  const L = t.explorer.summaryLabels
  const label = (list: { id: string; label: string }[], id?: string) => list.find((o) => o.id === id)?.label
  const lines: (string | null)[] = [
    `${L.scenario}: ${sc.label}`,
    s.place ? `${L.place}: ${label(c.explorer.places, s.place)}` : null,
    s.location ? `${L.location}: ${label(c.explorer.locations, s.location)}` : null,
    s.size ? `${L.size}: ${label(c.explorer.sizes, s.size)}` : null,
    s.stage ? `${L.stage}: ${label(c.explorer.stages, s.stage)}` : null,
    s.extras.length ? `${L.extras}: ${s.extras.map((x) => label(c.explorer.extras, x)).join(', ')}` : null,
    `${t.explorer.services}: ${rec.services.map((slug) => c.serviceBySlug(slug)?.name).filter(Boolean).join(', ')}`,
  ]
  return lines.filter((l): l is string => Boolean(l))
}
