// Municipios de Nuevo León para la medición: el campo «Ubicación» del cotizador es texto libre, así que a GA4 sólo
// viaja el nombre oficial del municipio que se reconozca en él (nunca el texto escrito). Es una lista de referencia,
// no la cobertura comercial: la cobertura confirmada está en COMPANY.areaServed.

/** Nombre oficial y formas en que suele escribirse (sin acentos, en minúsculas). */
export const NL_MUNICIPIOS: { name: string; aliases: string[] }[] = [
  { name: 'Monterrey', aliases: ['monterrey', 'mty', 'area metropolitana de monterrey', 'zona metropolitana de monterrey'] },
  { name: 'San Nicolás de los Garza', aliases: ['san nicolas de los garza', 'san nicolas', 'sn nicolas'] },
  { name: 'Apodaca', aliases: ['apodaca'] },
  { name: 'Guadalupe', aliases: ['guadalupe'] },
  { name: 'General Escobedo', aliases: ['general escobedo', 'gral escobedo', 'escobedo'] },
  { name: 'Santa Catarina', aliases: ['santa catarina'] },
  { name: 'San Pedro Garza García', aliases: ['san pedro garza garcia', 'san pedro', 'spgg', 'garza garcia'] },
  { name: 'García', aliases: ['garcia'] },
  { name: 'Juárez', aliases: ['juarez'] },
  { name: 'Pesquería', aliases: ['pesqueria'] },
  { name: 'Salinas Victoria', aliases: ['salinas victoria'] },
  { name: 'Ciénega de Flores', aliases: ['cienega de flores', 'cienega'] },
  { name: 'El Carmen', aliases: ['el carmen'] },
  { name: 'General Zuazua', aliases: ['general zuazua', 'gral zuazua', 'zuazua'] },
  { name: 'Cadereyta Jiménez', aliases: ['cadereyta jimenez', 'cadereyta'] },
  { name: 'Santiago', aliases: ['santiago'] },
  { name: 'Hidalgo', aliases: ['hidalgo nl', 'hidalgo n l', 'hidalgo nuevo leon'] },
  { name: 'Abasolo', aliases: ['abasolo'] },
  { name: 'Marín', aliases: ['marin'] },
  { name: 'Allende', aliases: ['allende'] },
  { name: 'Montemorelos', aliases: ['montemorelos'] },
  { name: 'Linares', aliases: ['linares'] },
  { name: 'Sabinas Hidalgo', aliases: ['sabinas hidalgo', 'sabinas'] },
]

/** Formas que se confunden con un municipio de Nuevo León pero son de otro estado. */
const ELSEWHERE = ['ciudad juarez', 'cd juarez', 'juarez chihuahua', 'santiago de queretaro', 'guadalupe zacatecas']

const normalize = (s: string) => ` ${s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `

/**
 * Municipio que aparece primero en el texto de ubicación. «no_indicado» si está vacío y «otro» si no se reconoce
 * ninguno de Nuevo León. Entre coincidencias que se enciman gana la más larga («San Pedro Garza García», no «García»).
 */
export function municipioDe(text: string): string {
  const t = normalize(text)
  if (!t.trim()) return 'no_indicado'
  if (ELSEWHERE.some((x) => t.includes(` ${x} `))) return 'otro'
  const hits: { at: number; end: number; name: string }[] = []
  for (const m of NL_MUNICIPIOS) {
    for (const a of m.aliases) {
      const at = t.indexOf(` ${a} `)
      if (at >= 0) hits.push({ at, end: at + a.length + 1, name: m.name })
    }
  }
  const kept = hits.filter((h) => !hits.some((o) => o !== h && o.at <= h.at && o.end >= h.end && o.end - o.at > h.end - h.at))
  kept.sort((a, b) => a.at - b.at || b.end - b.at - (a.end - a.at))
  return kept[0]?.name ?? 'otro'
}
