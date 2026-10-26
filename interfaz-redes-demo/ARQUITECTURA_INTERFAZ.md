# Arquitectura del sitio · Interfaz Redes 2.0

Para quien mantenga o amplíe el sitio. Complementa el `README.md` (cómo correr, probar y publicar).

## Pila

React 18 + TypeScript + Vite 6 + Tailwind 3 + Motion (LazyMotion) + React Router 7 + Lucide. Cada página se
**prerenderiza** a HTML en el build (`src/entry-server.tsx` + `scripts/prerender.mjs`) y React la **hidrata** en el
navegador (`src/main.tsx`). La recepción de cotizaciones es una función de Vercel (`api/cotizacion.ts` →
`server/cotizacion/`). No hay base de datos: cada solicitud se entrega por correo (Resend) y, si se configura, por
WhatsApp Cloud API.

## Mapa de carpetas

```
src/
  i18n/             idiomas: config (rutas y metadatos), diccionarios, catálogo traducido, proveedor y <Link>
    config.ts       LOCALES, LOCALE_META (incluye `reviewed`), splitLocale(), localize()
    messages/es.ts  textos de la interfaz en español (fuente; define el tipo Messages)
    locales/*.ts    en, ko, zh-CN: { messages, content } (se descargan sólo al visitar ese idioma)
    content.ts      ContentTranslation (lo que se traduce del catálogo) y buildContent()
    index.tsx       I18nProvider, useI18n/useT/useContent, loadLocale(), i18nFor()
    Link.tsx        Link, NavLink y Navigate que conservan el idioma
  data/             catálogo en español: servicios, industrias, proyectos, explorador, empresa, SEO
  content/recursos/ centro técnico: índice (index.ts) y artículos en Markdown (<slug>.md)
  components/       layout (header, footer, idioma), home, cotizador, proyectos (galería, antes/después), láminas, ui
  pages/            una por ruta; las interiores se cargan bajo demanda
  lib/              utilidades, SEO por página, analítica, cotización compartida con el servidor, Markdown
server/cotizacion/  validación, folio, anti-spam, correo a ventas (español) y acuse (idioma del cliente)
scripts/            prerender, revisión de hidratación
e2e/                pruebas de navegador (Playwright)
```

## Rutas

Las mismas rutas en cada idioma; el español va en la raíz para conservar las direcciones indexadas y los enlaces
de campañas.

| Español | Inglés | Coreano | Chino |
| --- | --- | --- | --- |
| `/` | `/en` | `/ko` | `/zh-CN` |
| `/soluciones`, `/soluciones/:slug` | `/en/soluciones/...` | `/ko/...` | `/zh-CN/...` |
| `/industrias`, `/industrias/:id` | ídem | ídem | ídem |
| `/proyectos`, `/proyectos/:slug` | ídem | ídem | ídem |
| `/explorador` | ídem | ídem | ídem |
| `/recursos`, `/recursos/:slug` | ídem | ídem | ídem |
| `/nosotros`, `/contacto`, `/aviso-de-privacidad` | ídem | ídem | ídem |

- Los *slugs* no se traducen: un enlace cambia de idioma sólo con el prefijo y el selector conserva la página.
- `vercel.json` redirige `/es/*` → `/*` y `/zh`, `/zh-cn` → `/zh-CN`.
- `?sector=` (enlaces anteriores de industrias) redirige a `/industrias/:id`.
- **Página nueva**: la ruta en `App.tsx` (`localeRoutes`), el cargador en `LOAD_BY_PATH`, su entrada en
  `pagesFor()` (`src/data/seo.ts`) y su módulo en `PAGE_MODULE` (`scripts/prerender.mjs`). Sin `pagesFor`, la
  dirección directa da 404 en producción.

## Idiomas (i18n)

- **Textos de la interfaz**: `src/i18n/messages/es.ts` define la forma (`Messages`); cada idioma la cumple
  completa (TypeScript falla si falta una clave). Textos con datos son funciones: `t.quote.ackSent(email)`.
- **Catálogo** (servicios, industrias, proyectos, proceso, explorador): el español está en `src/data/`; cada idioma
  aporta un `ContentTranslation` con los mismos ids. El prerender **detiene el build** si a un idioma le falta un
  servicio, industria, proyecto, escenario u opción (`missingContent`).
- **Carga**: el español viaja en el paquete principal; `en`, `ko` y `zh-CN` son archivos aparte (~26 KB comprimidos
  cada uno) que `main.tsx` descarga antes de hidratar y el selector descarga antes de navegar.
- **Revisión lingüística**: `LOCALE_META[locale].reviewed`. Mientras sea `false` (hoy: inglés, coreano y chino), las
  páginas de ese idioma llevan `noindex`, quedan fuera del sitemap y de `hreflang`, y el footer avisa que la
  traducción está en revisión. Al aprobar un idioma: `reviewed: true`, build y publicar.
- **Fuentes CJK**: Archivo y DM Sans no cubren coreano ni chino; `index.css` define `--cjk` por idioma con las
  fuentes del sistema (Apple SD Gothic Neo / Malgun Gothic / Noto Sans KR; PingFang SC / Microsoft YaHei / Noto Sans
  SC) y ajusta interlineado, tracking y `word-break: keep-all` (coreano). No se descargan fuentes CJK.
- **Aviso de privacidad**: la versión vigente es la española (legislación mexicana); en otros idiomas se muestra un
  resumen en ese idioma y el texto español con `lang="es-MX"`.
- **Sugerencia de idioma**: si el idioma del navegador o la preferencia guardada no coincide con la página, aparece
  una sugerencia discreta (una vez); nunca hay redirección automática.

## Catálogo de servicios: clasificación

Regla: **sólo se publica lo confirmado** en fuentes de la empresa. Fuentes revisadas el 22 de octubre de 2026:
interfazredes.com (inicio) y la división Redes & TI de interfaz.com.mx (`/soluciones-redes-ti`,
`/cableado-estructurado-monterrey`, `/fibra-optica-monterrey`, `/wifi-empresarial-monterrey`,
`/camaras-de-seguridad-monterrey`, `/control-de-acceso-monterrey`, `/control-de-asistencia-monterrey`,
`/plantas-de-luz-telecomunicaciones`, `/plantas-de-luz-industriales`).

### A. Confirmados (publicados)

| Servicio | Slug | Evidencia |
| --- | --- | --- |
| Cableado estructurado Cat6/Cat6A, voz y datos, certificación | `cableado-estructurado` | interfazredes.com («redes, voz y datos»); interfaz.com.mx cableado |
| Fibra óptica monomodo/multimodo, fusión, OTDR, reparación de enlaces | `fibra-optica` | interfazredes.com («tendido de fibra óptica»); interfaz.com.mx fibra (incluye «diagnóstico y reparación») |
| Racks y site | `racks-y-site` | interfaz.com.mx («Site y racks») |
| WiFi empresarial | `wifi-empresarial` | interfaz.com.mx WiFi |
| Redes empresariales (switching & routing, VLAN, PoE) | `redes-empresariales` | interfaz.com.mx («Switching & routing») |
| Enlaces punto a punto y multipunto | `enlaces-inalambricos` | interfazredes.com («enlaces ptp mptp») |
| Voz y telefonía IP | `telefonia-ip` | interfaz.com.mx («Telefonía IP») |
| CCTV y videovigilancia | `cctv-videovigilancia` | ambas fuentes |
| Control de acceso (biométrico, tarjeta, torniquetes, cerraduras) | `control-de-acceso` | ambas fuentes |
| **Control de asistencia** (nuevo) | `control-de-asistencia` | interfaz.com.mx `/control-de-asistencia-monterrey` |
| Intrusión, perímetro, sensores de humo, CCTV móvil, lectura de placas | `deteccion-perimetral` | interfazredes.com |
| Ingeniería y proyecto ejecutivo | `diseno-e-ingenieria` | interfazredes.com («diseños, ingeniería y proyectos ejecutivos») |
| Certificación de enlaces | `certificacion-y-pruebas` | interfaz.com.mx («certificación de cada enlace») |
| Mantenimiento preventivo y correctivo | `mantenimiento-y-soporte` | interfaz.com.mx («Soporte y mantenimiento») |
| **Energía y respaldo**: UPS/PDU + plantas de luz (renta/venta, vía Interfaz de Monterrey) | `calidad-de-energia` | interfazredes.com («calidad de energía»); interfaz.com.mx plantas de luz para telecomunicaciones e industria |

### B. Relacionados, pendientes de confirmación comercial (no publicados como servicio)

| Tema | Por qué está en B | Qué se necesita |
| --- | --- | --- |
| Monitoreo de red | interfaz.com.mx menciona «Monitoreo e infraestructura» sin alcance ni horario | Confirmar alcance; nunca publicar «24/7» sin respaldo |
| Centros de datos | Aparece como tipo de proyecto («racks, switching y enlaces») | Confirmar si se ofrece diseño/construcción de centro de datos o sólo infraestructura de racks |
| Analítica de video (IA), videoporteros | Aparecen sólo como opción de menú en interfaz.com.mx | Confirmar equipos, casos y alcance |
| Videoconferencia y salas híbridas | Listado en la división Redes & TI; es audio y video | Decidir si este sitio lo ofrece o se enlaza a interfaz.com.mx |
| Suministro de equipo empresarial | interfaz.com.mx vende equipo | Confirmar si se ofrece venta sin instalación |

### C. Oportunidades no publicables hoy

| Tema | Situación |
| --- | --- |
| Ciberseguridad (auditorías, análisis de vulnerabilidades, cumplimiento) | Sin evidencia en las fuentes. La segmentación y el firewall perimetral se mencionan sólo como parte de redes empresariales. |
| Servidores y virtualización | Sin evidencia. |
| Automatización y confort | Está en interfazredes.com pero es residencial/edificios; fuera del enfoque del sitio. |

Para publicar un servicio de B o C: confirmación escrita del alcance, agregarlo a `SERVICES` con sus textos y
traducciones, y actualizar esta tabla.

## Industrias

`src/data/content.ts → INDUSTRIES`: cada sector tiene introducción, necesidades, áreas, consideraciones técnicas,
proceso de implementación, preguntas y el tipo de inmueble que preselecciona en el cotizador. Los textos describen
necesidades **habituales** del sector; no afirman experiencia en clientes específicos. Salud y hotelería quedaron
fuera hasta confirmar que hay proyectos o interés comercial.

## Proyectos y portafolio

- Cada proyecto tiene `status: 'demostrativo' | 'autorizado'`. Los demostrativos se muestran identificados
  («Caso demostrativo»), con `noindex` y fuera del sitemap.
- Un proyecto **autorizado** puede llevar `client`, `location`, `year`, `results` (resultados documentados),
  `gallery` (fotos reales) y `beforeAfter` (mismo punto, antes y después). La galería (`<dialog>` accesible) y el
  comparador antes/después ya están construidos y se muestran sólo si el proyecto trae esos datos.
- Nunca usar renders ni fotos de banco como evidencia de un proyecto.
- Filtros: tipo de solución (derivado de los servicios del proyecto) e industria; ambos en la URL.

## Explorador de soluciones

`src/data/explorer.ts`: 9 escenarios con servicios, información a preparar y preguntas para el levantamiento; opciones
de instalación, ubicación, tamaño, etapa y necesidades adicionales; `recommend()` aplica reglas simples (ingeniería
primero en planeación, licitación o proyectos grandes; fibra en proyectos grandes; mantenimiento en instalaciones en
operación; aviso de cobertura fuera de Monterrey). No calcula cantidades ni precios. El estado vive en la URL
(`/explorador?escenario=…`) y el botón final lleva a `/contacto` con los mismos parámetros: el cotizador preselecciona
tipos e inmueble y envía el resumen **en español** (`summary`) aunque el cliente navegue en otro idioma.

## Cotizador y servidor

- Pasos: necesidad → proyecto → contacto (con **cargo** opcional) → revisión. Estados visibles: lista para enviar,
  enviando (espera confirmación del servidor), recibida (sólo con folio del servidor), error con reintento.
- **Borrador** en `sessionStorage` (esta pestaña, sin archivos) que se recupera tras recargar y se borra al enviar.
- **Sin conexión** (`navigator.onLine === false`): no intenta enviar y lo dice; los datos se conservan.
- La solicitud lleva `lang`: el servidor valida y responde en ese idioma, el **acuse** sale en ese idioma y el correo a
  ventas sigue en español con «Idioma del cliente», «Cargo» y «Explorador de soluciones».
- Campos nuevos del API: `role` (≤120), `summary` (≤2000), `lang` y `?lang=` en la URL del POST. Compatibles hacia
  atrás: si faltan, todo funciona como antes.
- Lo demás (folio, idempotencia, anti-spam, límite por IP, firmas de archivos, un correo por destinatario) no cambió;
  ver README «Recepción de cotizaciones».

## Centro técnico

- Índice en `src/content/recursos/index.ts` (metadatos, sin dependencias de Vite) y texto en `<slug>.md`.
- Markdown propio y seguro (`src/lib/markdown.tsx`): títulos, párrafos, listas, tablas, notas, negritas, enlaces.
  No admite HTML.
- Flujo: `borrador` → `revision` → `publicado` (con `reviewedBy` y `updated`). Sólo lo publicado aparece en
  producción, se indexa y entra al sitemap. Borradores visibles en `npm run dev` y en builds con
  `VITE_BORRADORES=1` (para una vista previa en Vercel, poner esa variable sólo en el entorno Preview).
- El menú muestra «Recursos» automáticamente cuando hay al menos un artículo publicado.
- Los artículos se escriben en español; en otros idiomas el índice avisa que el contenido está en español.

## Movimiento

| Pieza | Técnica | Respeta «reducir movimiento» |
| --- | --- | --- |
| Entrada del hero (header → titular → texto → foto → botones) | CSS (`.enter-rise`, `.enter-reveal`, retardo `--d`) | Sí |
| Transición entre páginas | CSS `.page-enter`, sólo tras la primera navegación (`html[data-nav]`) | Sí |
| Mega menú, explorador de frentes, pasos del cotizador y del explorador | Motion (`m.*`, `AnimatePresence`) | Sí (`MotionConfig reducedMotion="user"`) |
| Aparición al desplazarse | Motion `Reveal` (sólo posición, sin opacidad) | Sí |
| Diagrama de flujo y fibra de la topología | CSS, sólo mientras están en pantalla (`useInView`) | Sí (se apaga) |
| Microinteracciones (flechas, botones, imágenes) | CSS | Sí |

Duraciones y curvas: variables en `:root` (`--ease-out`, `--ease-emph`, `--dur-*`). Motion se descarga aparte
(`domAnimation`, ~18 KB) después del primer pintado. No se usa GSAP.

## Medición (eventos)

`src/lib/analytics.ts`. Sin `VITE_GA_ID` los eventos quedan en `window.dataLayer` (listo para Tag Manager); con él,
van a GA4. **Ningún evento lleva datos personales.**

| Evento | Parámetros |
| --- | --- |
| `page_view` | ruta y título; lo envía GA4 (entrada + medición mejorada del historial), no el sitio |
| `quote_cta` | ubicación del botón (`data-track-cta`) |
| `quote_start`, `quote_step` | origen y tipos / número de paso |
| `generate_lead` | método (formulario, whatsapp, email), tipos, idioma, si vino del explorador |
| `quote_error` | código de error |
| `service_view` | servicio |
| `explorer_step`, `explorer_complete` | escenario, paso, número de servicios (el paso al cotizador es `quote_cta` con ubicación `explorador-resultado`) |
| `language_change` | idioma de origen y destino |
| `project_view` | proyecto y estado |
| `file_download` | archivo (reservado para documentos autorizados) |
| `contact_whatsapp`, `contact_email`, `contact_phone` | ruta |

## SEO técnico

`src/data/seo.ts → pagesFor()` produce, por idioma, ruta, título, descripción, migas y `noindex`. El prerender
escribe `lang`, `og:locale`, canonical (sólo en indexables), `hreflang` (sólo entre idiomas revisados, con
`x-default` español), JSON-LD (`LocalBusiness`, `WebSite`, `WebPage`, `Service`, `BreadcrumbList`) y el sitemap con
alternativas por idioma. Plan de la siguiente etapa en `SEO_FASE_SIGUIENTE.md`.

## Decisiones

- **Español en la raíz** y no en `/es/`: conserva las URL indexadas y los enlaces de campañas; `/es/*` redirige.
- **Slugs sin traducir**: rutas idénticas entre idiomas (cambio de idioma trivial y robusto). Traducir slugs queda
  como opción para la etapa SEO.
- **Fuentes del sistema para CJK**: evita descargar varios megabytes de fuentes.
- **Botón flotante de WhatsApp sólo en escritorio** y tras la primera pantalla: en móvil el header lleva «Cotizar» y
  el menú, WhatsApp.
- **Sin dependencias nuevas**: i18n, Markdown, galería y comparador están hechos con lo que ya había.
