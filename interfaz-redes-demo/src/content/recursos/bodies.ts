// Texto de cada artículo (src/content/recursos/<slug>.md). Se descarga aparte, sólo al abrir el artículo.
// useResourceBody suspende hasta tenerlo (el prerender espera a que llegue y React lo toma igual en el navegador).
const BODIES = import.meta.glob<string>('./*.md', { query: '?raw', import: 'default' })

type Entry = { status: 'pending'; promise: Promise<void> } | { status: 'done'; value: string } | { status: 'error'; error: unknown }
const cache = new Map<string, Entry>()

export const hasBody = (slug: string) => Boolean(BODIES[`./${slug}.md`])

export function useResourceBody(slug: string): string {
  let entry = cache.get(slug)
  if (!entry) {
    const load = BODIES[`./${slug}.md`]
    if (!load) return ''
    const promise = load().then(
      (value) => { cache.set(slug, { status: 'done', value }) },
      (error) => { cache.set(slug, { status: 'error', error }) },
    )
    entry = { status: 'pending', promise }
    cache.set(slug, entry)
  }
  if (entry.status === 'pending') throw entry.promise
  if (entry.status === 'error') throw entry.error
  return entry.value
}
