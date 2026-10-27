// Páginas públicas en cada idioma: ruta, título, descripción, ruta de navegación y si se indexan. Las usan la app
// (useSeo), el prerender (un HTML por idioma y ruta, sitemap, hreflang y datos estructurados) y las pruebas.
// Una página nueva debe agregarse en pagesFor(); si no, su dirección directa da 404 en producción.
import { publishedResources, visibleResources, type Resource } from '../content/recursos'
import { visibleZones } from '../content/zonas'
import { LOCALE_META, localize, type Locale } from '../i18n/config'
import type { Content } from '../i18n/content'
import type { Messages } from '../i18n/messages/es'
import { isIndexable, type Industry, type Project } from './content'
import type { Service } from './solutions'

export interface Seo { title: string; description: string }

/** Google corta las descripciones más largas. */
export const MAX_DESCRIPTION = 160
/** Las más cortas desaprovechan el espacio del resultado de búsqueda (el prerender avisa). */
export const MIN_DESCRIPTION = 110

const BRAND = 'Interfaz Redes'
/** Título completo de la pestaña: agrega la marca si el título no la trae. */
export const fullTitle = (title: string) => (title.includes(BRAND) ? title : `${title} · ${BRAND}`)

/**
 * Servicio: su descripción para buscadores si la tiene; si no, su frase corta más la primera oración de la
 * introducción, si cabe, o la que quepa.
 */
export function serviceSeo(s: Service, t: Messages): Seo {
  const title = t.service.seoTitle(s.name)
  if (s.seoDescription) return { title, description: s.seoDescription }
  const first = s.intro.match(/^.*?[.。](?=\s|$)/)?.[0] ?? s.intro
  const description = [`${s.short} ${first}`, first, s.short].find((d) => d.length <= MAX_DESCRIPTION) ?? s.short
  return { title, description }
}

export const industrySeo = (i: Industry, t: Messages): Seo => ({ title: t.industry.seoTitle(i.name), description: i.seoDescription })
export const projectSeo = (p: Project): Seo => ({ title: p.title, description: p.seoDescription ?? p.summary })
export const resourceSeo = (r: Resource): Seo => ({ title: r.title, description: r.summary })

/** Paso de la ruta de navegación (la misma de pantalla, sin «Inicio», que siempre va primero). `path` sin idioma. */
export interface Crumb { label: string; path: string }

export type PageKind = 'home' | 'solutions' | 'service' | 'industries' | 'industry' | 'projects' | 'project' | 'explorer' | 'resources' | 'resource' | 'about' | 'contact' | 'privacy' | 'zone'

export interface Page {
  locale: Locale
  kind: PageKind
  /** Ruta sin prefijo de idioma: la misma en los cuatro idiomas (une las versiones en hreflang). */
  base: string
  /** Ruta publicada, con el prefijo del idioma. */
  path: string
  seo: Seo
  crumbs: Crumb[]
  service?: Service
  /** Artículo del centro técnico (datos estructurados `Article`). */
  resource?: Resource
  /** No se indexa: idioma sin revisar, caso demostrativo, borrador o centro técnico sin artículos. */
  noindex: boolean
}

/** Páginas de un idioma. `drafts`: incluir borradores del centro técnico (desarrollo y vistas previas). */
export function pagesFor(locale: Locale, t: Messages, c: Content, { drafts = false }: { drafts?: boolean } = {}): Page[] {
  const unreviewed = !LOCALE_META[locale].reviewed
  const make = (kind: PageKind, base: string, seo: Seo, crumbs: Crumb[], extra: { service?: Service; resource?: Resource; noindex?: boolean } = {}): Page => ({
    locale, kind, base, path: localize(base, locale), seo, crumbs, service: extra.service, resource: extra.resource, noindex: unreviewed || Boolean(extra.noindex),
  })
  const SOL: Crumb = { label: t.nav.solutions, path: '/soluciones' }
  const IND: Crumb = { label: t.nav.industries, path: '/industrias' }
  const PRJ: Crumb = { label: t.nav.projects, path: '/proyectos' }
  const RES: Crumb = { label: t.resources.title, path: '/recursos' }
  const hasPublished = publishedResources().length > 0
  return [
    make('home', '/', t.seo.home, []),
    make('solutions', '/soluciones', t.seo.solutions, [SOL]),
    ...c.services.map((s) => make('service', `/soluciones/${s.slug}`, serviceSeo(s, t), [SOL, { label: s.name, path: `/soluciones/${s.slug}` }], { service: s })),
    make('industries', '/industrias', t.seo.industries, [IND]),
    ...c.industries.map((i) => make('industry', `/industrias/${i.id}`, industrySeo(i, t), [IND, { label: i.name, path: `/industrias/${i.id}` }])),
    make('projects', '/proyectos', t.seo.projects, [PRJ]),
    ...c.projects.map((p) => make('project', `/proyectos/${p.slug}`, projectSeo(p), [PRJ, { label: p.title, path: `/proyectos/${p.slug}` }], { noindex: !isIndexable(p) })),
    make('explorer', '/explorador', t.seo.explorer, [{ label: t.nav.explorer, path: '/explorador' }]),
    make('resources', '/recursos', t.seo.resources, [RES], { noindex: !hasPublished }),
    ...visibleResources(drafts).map((r) => make('resource', `/recursos/${r.slug}`, resourceSeo(r), [RES, { label: r.title, path: `/recursos/${r.slug}` }], { resource: r, noindex: r.status !== 'publicado' })),
    make('about', '/nosotros', t.seo.about, [{ label: t.nav.about, path: '/nosotros' }]),
    // Páginas municipales: sólo en español y, mientras sean borradores, sólo en desarrollo y vistas previas.
    ...(locale === 'es' ? visibleZones(drafts).map((z) => make('zone', `/zonas/${z.slug}`, z.seo, [{ label: z.name, path: `/zonas/${z.slug}` }], { noindex: z.status !== 'publicado' })) : []),
    make('contact', '/contacto', t.seo.contact, [{ label: t.nav.contact, path: '/contacto' }]),
    make('privacy', '/aviso-de-privacidad', t.seo.privacy, [{ label: t.footer.privacy, path: '/aviso-de-privacidad' }]),
  ]
}
