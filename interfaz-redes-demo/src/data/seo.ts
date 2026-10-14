// Título y descripción de cada página. Los usa la app (useSeo) y scripts/prerender.mjs, que
// escribe un HTML por ruta para que WhatsApp, Facebook y los buscadores los vean sin JavaScript.
import { PROJECTS, type Project } from './content'
import { SERVICES, type Service } from './solutions'

export interface Seo { title: string; description: string }

const BRAND = 'Interfaz Redes'
/** Google corta las descripciones más largas. */
const MAX_DESCRIPTION = 160

/** Título completo de la pestaña: agrega la marca si el título no la trae. */
export const fullTitle = (title: string) => (title.includes(BRAND) ? title : `${title} · ${BRAND}`)

export const SEO = {
  home: {
    title: 'Interfaz Redes · Redes, telecomunicaciones y CCTV en Monterrey',
    description: 'Ingeniería, instalación y mantenimiento de cableado estructurado, fibra óptica, redes, CCTV y control de acceso para empresas e industria en Monterrey, N.L.',
  },
  solutions: {
    title: 'Soluciones de infraestructura tecnológica',
    description: 'Cableado estructurado, fibra óptica, seguridad electrónica, conectividad empresarial e ingeniería y mantenimiento para empresas e industria en Monterrey.',
  },
  industries: {
    title: 'Soluciones por industria',
    description: 'Redes, fibra óptica, CCTV y control de acceso para industria, corporativos, centros de distribución, instituciones educativas y comercio.',
  },
  projects: {
    title: 'Proyectos',
    description: 'Tipos de proyecto de infraestructura que ejecuta Interfaz Redes: redes industriales, fibra óptica, CCTV, racks y sites, y redes corporativas.',
  },
  about: {
    title: 'Nosotros',
    description: 'Interfaz Redes y Telecomunicaciones: más de 15 años desarrollando proyectos de redes, fibra óptica y seguridad electrónica desde Monterrey. Registro REPSE.',
  },
  contact: {
    title: 'Cotizar proyecto',
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

/** Servicio: su frase corta más la primera oración de la introducción, si cabe; si no, la que quepa. */
export function serviceSeo(s: Service): Seo {
  const first = `${s.intro.split('. ')[0].replace(/\.$/, '')}.`
  const description = [`${s.short} ${first}`, first, s.short].find((d) => d.length <= MAX_DESCRIPTION) ?? s.short
  return { title: `${s.name} en Monterrey`, description }
}

export const projectSeo = (p: Project): Seo => ({ title: p.title, description: p.summary })

/** Rutas públicas con su título y descripción. */
export const SEO_ROUTES: [string, Seo][] = [
  ['/', SEO.home],
  ['/soluciones', SEO.solutions],
  ...SERVICES.map((s): [string, Seo] => [`/soluciones/${s.slug}`, serviceSeo(s)]),
  ['/industrias', SEO.industries],
  ['/proyectos', SEO.projects],
  ...PROJECTS.map((p): [string, Seo] => [`/proyectos/${p.slug}`, projectSeo(p)]),
  ['/nosotros', SEO.about],
  ['/contacto', SEO.contact],
  ['/aviso-de-privacidad', SEO.privacy],
]
