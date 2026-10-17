// Datos estructurados (schema.org) de cada página. Los inserta scripts/prerender.mjs en el HTML; la app no los usa.
// Sólo datos de COMPANY: el código postal, las coordenadas y el nombre legal se agregan cuando estén confirmados
// (Perfil de Empresa en Google).
import { COMPANY } from './company'
import type { Page } from './seo'

const absolute = (site: string, path: string) => site + (path === '/' ? '/' : path)

/** JSON-LD de la página, listo para ir dentro de <script type="application/ld+json">. */
export function structuredData(site: string, page: Page): string {
  const business = `${site}/#empresa`
  const url = absolute(site, page.path)
  const { street, city, region, country } = COMPANY.addressParts
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
      address: { '@type': 'PostalAddress', streetAddress: street, addressLocality: city, addressRegion: region, addressCountry: country },
      areaServed: COMPANY.areaServed,
      openingHours: COMPANY.hoursSchema,
      sameAs: [COMPANY.facebook],
    },
    { '@type': 'WebSite', '@id': `${site}/#sitio`, url: `${site}/`, name: COMPANY.name, alternateName: COMPANY.shortName, inLanguage: 'es-MX', publisher: { '@id': business } },
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
      areaServed: COMPANY.areaServed,
    })
  }
  if (page.crumbs.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [{ label: 'Inicio', path: '/' }, ...page.crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: absolute(site, c.path) })),
    })
  }
  // «<» escapado: un texto con «</script>» no puede cerrar la etiqueta antes de tiempo.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/</g, '\\u003c')
}

/** Texto para quien navega sin JavaScript (o un rastreador que no lo ejecuta). */
export const noscriptText = () =>
  `${COMPANY.name} · Cableado estructurado, fibra óptica, redes, CCTV y control de acceso en Monterrey. WhatsApp ${COMPANY.whatsappDisplay} · ${COMPANY.email}`
