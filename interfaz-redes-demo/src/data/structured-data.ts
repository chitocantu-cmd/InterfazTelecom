// Datos estructurados (schema.org) de cada página. Los inserta scripts/prerender.mjs en el HTML; la app no los usa.
// Sólo datos de COMPANY: el código postal, las coordenadas y el nombre legal se agregan cuando estén confirmados
// (Perfil de Empresa en Google).
import { LOCALE_META, localize } from '../i18n/config'
import type { Messages } from '../i18n/messages/es'
import { COMPANY } from './company'
import type { Page } from './seo'
import { SERVICES } from './solutions'

const absolute = (site: string, path: string) => site + (path === '/' ? '/' : path)

/**
 * Cobertura confirmada (COMPANY.areaServed) como lugares: Monterrey y su área metropolitana. No se agregan municipios
 * ni el estado completo mientras la empresa no los confirme.
 */
const AREA_SERVED = [
  { '@type': 'City', name: 'Monterrey' },
  { '@type': 'AdministrativeArea', name: 'Área metropolitana de Monterrey' },
]

/** JSON-LD de la página, listo para ir dentro de <script type="application/ld+json">. */
export function structuredData(site: string, page: Page, t: Messages): string {
  const business = `${site}/#empresa`
  const url = absolute(site, page.path)
  const lang = LOCALE_META[page.locale].htmlLang
  const { street, city, region, country } = COMPANY.addressParts
  const webPage: Record<string, unknown> = { '@type': 'WebPage', '@id': `${url}#pagina`, url, name: page.seo.title, description: page.seo.description, inLanguage: lang, isPartOf: { '@id': `${site}/#sitio` } }
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'LocalBusiness',
      '@id': business,
      name: COMPANY.name,
      alternateName: COMPANY.shortName,
      url: `${site}/`,
      logo: `${site}/apple-touch-icon.png`,
      image: `${site}/og-image.jpg`,
      telephone: COMPANY.phoneIntl,
      email: COMPANY.email,
      address: { '@type': 'PostalAddress', streetAddress: street, addressLocality: city, addressRegion: region, addressCountry: country, ...(COMPANY.postalCode ? { postalCode: COMPANY.postalCode } : {}) },
      ...(COMPANY.geo ? { geo: { '@type': 'GeoCoordinates', latitude: COMPANY.geo.lat, longitude: COMPANY.geo.lng } } : {}),
      areaServed: AREA_SERVED,
      openingHours: COMPANY.hoursSchema,
      // Atención comercial en español (la página en inglés lo aclara: el equipo trabaja principalmente en español).
      contactPoint: { '@type': 'ContactPoint', contactType: 'sales', telephone: COMPANY.phoneIntl, email: COMPANY.email, areaServed: 'MX', availableLanguage: ['es'] },
      knowsAbout: SERVICES.map((s) => s.name),
      // División de redes de Interfaz de Monterrey (sitio del grupo: interfaz.com.mx).
      parentOrganization: { '@type': 'Organization', name: COMPANY.legalName, alternateName: COMPANY.parent.name, url: COMPANY.parent.url },
      sameAs: [COMPANY.facebook],
    },
    { '@type': 'WebSite', '@id': `${site}/#sitio`, url: `${site}/`, name: COMPANY.name, alternateName: COMPANY.shortName, inLanguage: 'es-MX', publisher: { '@id': business } },
    webPage,
  ]
  if (page.service) {
    graph.push({
      '@type': 'Service',
      '@id': `${url}#servicio`,
      name: page.service.name,
      serviceType: page.service.name,
      description: page.seo.description,
      url,
      provider: { '@id': business },
      areaServed: AREA_SERVED,
    })
  }
  // Artículo del centro técnico: sólo los publicados (los borradores llevan noindex). Autor: la empresa; la revisión
  // técnica (`reviewedBy`) va en la página, que es donde schema.org la define.
  if (page.resource && page.resource.status === 'publicado') {
    const r = page.resource
    graph.push({
      '@type': 'Article',
      '@id': `${url}#articulo`,
      headline: r.title,
      description: r.summary,
      inLanguage: 'es-MX',
      dateModified: r.updated,
      author: { '@id': business },
      publisher: { '@id': business },
      mainEntityOfPage: { '@id': `${url}#pagina` },
      about: r.services.map((slug) => ({ '@id': `${site}/soluciones/${slug}#servicio` })),
    })
    if (r.reviewedBy) webPage.reviewedBy = { '@type': 'Person', name: r.reviewedBy }
  }
  if (page.crumbs.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [{ label: t.common.home, path: '/' }, ...page.crumbs].map((c, i) => ({
        '@type': 'ListItem', position: i + 1, name: c.label, item: absolute(site, localize(c.path, page.locale)),
      })),
    })
  }
  // «<» escapado: un texto con «</script>» no puede cerrar la etiqueta antes de tiempo.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/</g, '\\u003c')
}

/** Texto para quien navega sin JavaScript (o un rastreador que no lo ejecuta). */
export const noscriptText = (t: Messages) => t.seo.noscript(COMPANY.name, COMPANY.whatsappDisplay, COMPANY.email)
