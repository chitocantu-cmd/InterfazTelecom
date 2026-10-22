# SEO · siguiente etapa

Lo que ya quedó listo en el desarrollo y lo que falta hacer cuando empiece la etapa de posicionamiento. Esta etapa
**no** se ejecutó: no se publicaron artículos ni se hicieron campañas.

## Ya implementado (base técnica)

- **Un HTML prerenderizado por ruta e idioma** con título, descripción, canonical, Open Graph, `lang`, `og:locale` y
  datos estructurados (`LocalBusiness`, `WebSite`, `WebPage`, `Service`, `BreadcrumbList`). Los buscadores leen el
  contenido sin ejecutar JavaScript.
- **URL limpias y estables** en español en la raíz; `/en`, `/ko`, `/zh-CN` con las mismas rutas.
- **Controles de indexación**: `noindex` en idiomas sin revisión lingüística, casos demostrativos, borradores del
  centro técnico, centro técnico vacío y 404. Esas páginas no entran al sitemap ni llevan canonical.
- **hreflang** recíproco con `x-default` (español), generado sólo entre idiomas revisados. Hoy sólo el español está
  marcado como revisado, así que todavía no se emite `hreflang`.
- **Sitemap** sólo con páginas indexables y sus alternativas por idioma (`xhtml:link`); `robots.txt` lo declara.
- **Encabezados**: un `h1` por página, jerarquía `h2`/`h3` sin saltos.
- **Títulos y descripciones editables** en un solo lugar por idioma: `seo` en cada diccionario
  (`src/i18n/messages/es.ts`, `src/i18n/locales/*.ts`), `seoDescription` en servicios, industrias y proyectos.
- **Rendimiento**: prerender, imágenes con `srcset`, precarga de la imagen y fuentes de la portada, JS por página.
- **Redirecciones 308** de URL antiguas (WordPress, slug renombrado, `/es/*`, `/zh-cn`).

## Pendiente antes de indexar otros idiomas

1. **Revisión lingüística profesional** de inglés, coreano y chino simplificado (interfaz, catálogo y acuse de
   correo). Archivos: `src/i18n/locales/en.ts`, `ko.ts`, `zh-CN.ts`, `src/data/quote-types.ts`
   (`QUOTE_TYPE_TEXT`), `src/lib/cotizacion.ts` (`SITE_TEXT`, mensajes de validación) y
   `server/cotizacion/index.ts` y `correo.ts` (mensajes y acuse).
2. Al aprobar cada idioma: `reviewed: true` en `src/i18n/config.ts`, build y publicar. Eso activa indexación,
   sitemap y `hreflang` para ese idioma automáticamente.
3. Decidir si se traducen los *slugs* (`/en/solutions/fiber-optics`): mejora la lectura de la URL en inglés; implica
   un mapa de slugs por idioma y redirecciones. No es necesario para indexar.

## Etapa SEO (cuando se apruebe)

### Medición y cuentas

- Google Search Console: verificar `interfaztelecom.com.mx` (registro DNS en Vercel), enviar el sitemap, revisar
  cobertura e indexación de las 28 páginas indexables.
- Perfil de Empresa en Google (Google Business Profile): dirección, horario, categorías, fotos reales. Con el código
  postal y coordenadas confirmados, completarlos en `COMPANY.addressParts` y en los datos estructurados.
- GA4 con `VITE_GA_ID` (y Consent Mode si se decide mostrar aviso de cookies); marcar `generate_lead` como
  conversión. Revisar el aviso de privacidad antes de activar medición de terceros.
- Bing Webmaster Tools (opcional, comparte datos con otros buscadores).

### Investigación

- Palabras clave por servicio e industria en Monterrey y Nuevo León (español) y para empresas extranjeras con
  operación en México (inglés, coreano, chino): volumen, intención y competencia.
- Revisar qué consultas ya traen impresiones en Search Console antes de crear contenido nuevo.
- Mapear una intención principal por página para evitar canibalización (por ejemplo, «cableado estructurado
  Monterrey» → `/soluciones/cableado-estructurado`).

### Contenido

- Revisar y publicar los 5 borradores del centro técnico (`src/content/recursos/`), con revisión técnica de una
  persona del equipo (`reviewedBy`). Enlazar cada artículo desde los servicios relacionados.
- Publicar proyectos **autorizados** con fotos reales: son el contenido de mayor confianza (y dejan de llevar
  `noindex`).
- Ampliar el aviso de servicios con preguntas reales de clientes (datos de ventas).
- No crear páginas por ciudad sin contenido distinto; evitar páginas delgadas o duplicadas.

### Técnico

- `lastmod` en el sitemap sólo cuando exista una fecha real de modificación por página.
- Datos estructurados `FAQPage` sólo si Google vuelve a mostrarlos para sitios de empresa (hoy limitados); `Article`
  para los artículos publicados.
- Imagen Open Graph por idioma y por servicio (hoy es una sola).
- Revisar Core Web Vitals de campo (CrUX / Search Console) cuando haya tráfico suficiente.
- Si se agregan scripts de terceros, ampliar la `Content-Security-Policy-Report-Only` de `vercel.json` y después
  volverla obligatoria.

### Autoridad y reputación

- Directorios empresariales y cámaras locales donde Interfaz sea miembro (sólo reales).
- Reseñas en el Perfil de Empresa de Google de clientes reales.
- Menciones de proveedores o socios sólo con autorización.

## Dependencias de la empresa

| Necesario | Para qué |
| --- | --- |
| Revisión de traducciones | Indexar inglés, coreano y chino |
| Revisión técnica de artículos | Publicar el centro técnico |
| Proyectos autorizados (nombre, fotos, alcance) | Portafolio real e indexable |
| Código postal, coordenadas, razón social | Datos estructurados y aviso de privacidad completos |
| Fotografía real de fibra, CCTV, acceso, WiFi e industrias | Sustituir renders de referencia |
| Logotipo vectorial (SVG) o PNG ≥ 800 px | Nitidez en pantallas de alta densidad |
