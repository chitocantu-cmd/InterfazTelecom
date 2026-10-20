// Título y descripción de cada página. Los usa la app (useSeo) y scripts/prerender.mjs, que
// escribe un HTML por ruta para que WhatsApp, Facebook y los buscadores los vean sin JavaScript.
import { PROJECTS, type Project } from './content'
import { SERVICES, type Service } from './solutions'

export interface Seo { title: string; description: string }

const BRAND = 'Interfaz Redes'
/** Google corta las descripciones más largas. */
export const MAX_DESCRIPTION = 160
/** Las más cortas desaprovechan el espacio del resultado de búsqueda (el prerender avisa). */
export const MIN_DESCRIPTION = 110

/** Título completo de la pestaña: agrega la marca si el título no la trae. */
export const fullTitle = (title: string) => (title.includes(BRAND) ? title : `${title} · ${BRAND}`)

export const SEO = {
  home: {
    title: 'Interfaz Redes · Redes, telecomunicaciones y CCTV en Monterrey',
    description: 'Ingeniería, instalación y mantenimiento de cableado estructurado, fibra óptica, redes, CCTV y control de acceso para empresas e industria en Monterrey, N.L.',
  },
  solutions: {
    title: 'Soluciones de infraestructura TI en Monterrey',
    description: 'Cableado estructurado, fibra óptica, seguridad electrónica, conectividad empresarial e ingeniería y mantenimiento para empresas e industria en Monterrey.',
  },
  industries: {
    title: 'Soluciones por industria en Monterrey',
    description: 'Redes, fibra óptica, CCTV y control de acceso para industria, corporativos, centros de distribución, instituciones educativas y comercio.',
  },
  projects: {
    title: 'Proyectos de redes y CCTV en Monterrey',
    description: 'Tipos de proyecto de infraestructura que ejecuta Interfaz Redes: redes industriales, fibra óptica, CCTV, racks y sites, y redes corporativas.',
  },
  about: {
    title: 'Nosotros · Empresa de redes en Monterrey',
    description: 'Interfaz Redes y Telecomunicaciones: más de 15 años desarrollando proyectos de redes, fibra óptica y seguridad electrónica desde Monterrey. Registro REPSE.',
  },
  contact: {
    title: 'Cotice su proyecto de redes en Monterrey',
    description: 'Solicite una cotización de cableado estructurado, fibra óptica, CCTV, control de acceso o infraestructura TI. Respuesta por WhatsApp o correo.',
  },
  privacy: {
    title: 'Aviso de privacidad',
    description: 'Aviso de privacidad de Interfaz Redes y Telecomunicaciones: datos que recabamos, finalidades y cómo ejercer sus derechos ARCO.',
  },
  notFound: {
    title: 'Página no encontrada',
    description: 'La página que busca no existe. Revise el índice de soluciones de Interfaz Redes.',
  },
} satisfies Record<string, Seo>

/**
 * Servicio: su descripción para buscadores si la tiene; si no, su frase corta más la primera oración de la
 * introducción, si cabe, o la que quepa.
 */
export function serviceSeo(s: Service): Seo {
  const title = `${s.name} en Monterrey`
  if (s.seoDescription) return { title, description: s.seoDescription }
  const first = `${s.intro.split('. ')[0].replace(/\.$/, '')}.`
  const description = [`${s.short} ${first}`, first, s.short].find((d) => d.length <= MAX_DESCRIPTION) ?? s.short
  return { title, description }
}

export const projectSeo = (p: Project): Seo => ({ title: p.title, description: p.seoDescription ?? p.summary })

/** Paso de la ruta de navegación (la misma de pantalla, sin «Inicio», que siempre va primero). */
export interface Crumb { label: string; path: string }

/** Página pública: ruta, título, descripción y ruta de navegación. `service` marca las páginas de servicio. */
export interface Page { path: string; seo: Seo; crumbs: Crumb[]; service?: Service }

const page = (path: string, seo: Seo, label: string): Page => ({ path, seo, crumbs: [{ label, path }] })
const SOLUTIONS: Crumb = { label: 'Soluciones', path: '/soluciones' }
const PROJECTS_CRUMB: Crumb = { label: 'Proyectos', path: '/proyectos' }

/** Rutas públicas. Las usan el prerender (un HTML por ruta, sitemap y datos estructurados) y las pruebas. */
export const PAGES: Page[] = [
  { path: '/', seo: SEO.home, crumbs: [] },
  page('/soluciones', SEO.solutions, 'Soluciones'),
  ...SERVICES.map((s): Page => {
    const path = `/soluciones/${s.slug}`
    return { path, seo: serviceSeo(s), crumbs: [SOLUTIONS, { label: s.name, path }], service: s }
  }),
  page('/industrias', SEO.industries, 'Industrias'),
  page('/proyectos', SEO.projects, 'Proyectos'),
  ...PROJECTS.map((p): Page => {
    const path = `/proyectos/${p.slug}`
    return { path, seo: projectSeo(p), crumbs: [PROJECTS_CRUMB, { label: p.title, path }] }
  }),
  page('/nosotros', SEO.about, 'Nosotros'),
  page('/contacto', SEO.contact, 'Contacto'),
  page('/aviso-de-privacidad', SEO.privacy, 'Aviso de privacidad'),
]

/** Rutas públicas con su título y descripción. */
export const SEO_ROUTES: [string, Seo][] = PAGES.map((p) => [p.path, p.seo])
