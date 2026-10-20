# Interfaz Redes · Sitio web

Sitio de **Interfaz Redes y Telecomunicaciones** (Monterrey, N.L.).
React 18 + TypeScript + Vite + Tailwind CSS + Motion + React Router + Lucide.

## Iniciar el sitio

Requiere **Node 24** (el mismo que usa Vercel; `.nvmrc` y `engines` en `package.json`). Desde la terminal de
VS Code, dentro de esta carpeta:

```bash
npm install            # sólo la primera vez o al cambiar dependencias
npm run dev            # servidor de desarrollo
```

Vite muestra la dirección en la terminal (normalmente `http://localhost:5173/`; si ese puerto está ocupado
usa el siguiente libre, por ejemplo `5174`). Los cambios en el código se ven al guardar. `Ctrl + C` lo detiene.

## Versión de producción

```bash
npm run build          # compila a dist/: un HTML por página con su contenido ya dibujado, sitemap.xml y robots.txt
npm run preview        # sirve dist/ localmente para revisarla (sin /api: el cotizador queda en modo manual)
npm run build:preview  # un solo HTML autocontenido → dist-preview/index.html (el archivo que se comparte)
```

## Comprobaciones

```bash
npm run typecheck        # TypeScript: el sitio, la función del servidor, la configuración y las pruebas
npm run lint             # ESLint (reglas de TypeScript y de los hooks de React)
npm run test:e2e         # pruebas de navegador en escritorio y móvil (ver abajo)
npm run check:hydration  # el HTML prerenderizado coincide con lo que dibuja React (correr tras cambiar componentes)
```

**Antes de publicar:** `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e` y, si se tocaron
componentes, `npm run check:hydration`. Si algo sale mal ya publicado, ver «Revertir» en «Despliegue en Vercel».

**Prerender.** Cada página llega con su contenido en el HTML (`src/entry-server.tsx`, compilado con
`vite build --ssr`) y React lo toma sin volver a dibujarlo (`hydrateRoot` en `src/main.tsx`). Por eso el primer
render de cada componente debe ser igual en el servidor y en el navegador: lo que dependa del navegador (parámetros
`?`, preferencias, almacenamiento) se lee con `useHydrated()` o en un efecto, no al dibujar. `check:hydration`
avisa si algo no coincide.

Las pruebas (`e2e/sitio.spec.ts`) recorren todas las rutas, el header y el menú móvil, el cotizador (validación,
envío en modo de prueba, errores del servidor), filtros y pestañas, accesibilidad con teclado y el HTML de cada
página. Usan el Google Chrome instalado en el equipo; con Edge: `PW_CHANNEL=msedge npm run test:e2e` (en
PowerShell: `$env:PW_CHANNEL='msedge'; npm run test:e2e`). Levantan su propio servidor en el puerto 5199. Si el
equipo está muy cargado y fallan por tiempo, corra `npx playwright test --workers=2`.

Para probar el sitio publicado en lugar del local: `BASE_URL=https://interfaztelecom.com.mx npm run test:e2e`
(en PowerShell: `$env:BASE_URL='https://interfaztelecom.com.mx'; npm run test:e2e`, y después
`Remove-Item Env:BASE_URL` para volver a probar el local). Contra el sitio publicado se saltan las pruebas que
enviarían una cotización real.

## Dónde modificar

| Qué | Dónde |
| --- | --- |
| Teléfono, WhatsApp, correo, dirección, horario | `src/data/company.ts` (de ahí los toman el footer, Contacto, los datos estructurados y el aviso sin JavaScript). `COMPANY.email` es también el destinatario por omisión de las cotizaciones. |
| Dominio del sitio | `COMPANY.site` en `src/data/company.ts`: canonical, sitemap, Open Graph y el origen que acepta el cotizador. Al cambiarlo, agregue el dominio en Vercel → Domains. |
| Servicios (textos, especificaciones, preguntas frecuentes) | `src/data/solutions.ts` |
| Opciones del cotizador | `QUOTE_TYPES` en `src/data/quote-types.ts` y su ícono en `ICONS` (`src/components/quote/QuoteWizard.tsx`) |
| Quién recibe las cotizaciones (correos y números de WhatsApp) | variables de entorno en Vercel (ver "Recepción de cotizaciones") |
| Campos, límites y textos de la solicitud | `src/lib/cotizacion.ts` (los comparten el cotizador y el servidor) |
| Correos de la cotización (aviso a ventas y acuse al cliente) | `server/cotizacion/correo.ts` |
| Industrias, proyectos, necesidades y proceso | `src/data/content.ts` |
| Fotografías | archivos en `src/assets/img/` y su registro en `src/data/media.ts` |
| Galería "Nuestro equipo en campo" | `src/pages/Home.tsx` y `src/pages/About.tsx` |
| Razón social del aviso de privacidad | constante `RAZON_SOCIAL` en `src/pages/Privacy.tsx` |
| Logotipo | `src/assets/brand/` (ver `index.ts`); íconos en `public/favicon.ico` y `public/apple-touch-icon.png` |
| Título y descripción de cada página (Google y vista previa al compartir) | `src/data/seo.ts` (`seoDescription` en servicios y proyectos) |
| Datos estructurados para Google (empresa, servicios, ruta de navegación) | `src/data/structured-data.ts` (con los datos de `company.ts`) |
| Colores y tipografía | `tailwind.config.js` y `src/index.css` |
| Imagen de la portada | `IMG.aisle` en `src/components/home/Hero.tsx` |
| Imagen al compartir el enlace | `public/og-image.jpg` (1200 × 630) y su texto en `og:image:alt` de `index.html` |
| Logotipo de los correos | `public/email/interfaz-logo.png` |
| Redirecciones | `redirects` en `vercel.json` |
| Mensajes de WhatsApp de los botones | `waLink(...)` en cada componente; el general es `WA_GENERAL` en `src/lib/utils.ts` |
| Leyenda «Caso demostrativo» | `src/pages/Projects.tsx` y `ProjectMeta` en `src/components/home/Sections.tsx` |
| Fecha del aviso de privacidad | constante `ACTUALIZADO` en `src/pages/Privacy.tsx` |
| Páginas | `src/pages/` · rutas en `src/App.tsx` (ver «Página nueva») |

**Página nueva:** la ruta en `src/App.tsx` (y en `LOAD_BY_PATH` si se carga bajo demanda), su entrada en `PAGES`
de `src/data/seo.ts` (sin ella, su dirección directa daría 404; de ahí salen también el sitemap y su HTML), el
archivo de la página en `PAGE_MODULE` de `scripts/prerender.mjs` y, si va en el menú, `NAV` en
`src/components/layout/Header.tsx`.

**Enlaces que llenan el cotizador:** `/contacto?tipo=fibra` (también `cableado`, `cctv`, `acceso`, `infra`,
`otro`), `?servicio=<slug del servicio>`, `?necesidad=<id de NEEDS>` y `?sector=<id de INDUSTRIES>`. Sirven para
campañas o botones en otros sitios.

Para cambiar una fotografía: la imagen **debe ser `.webp`** (`media.ts` sólo lee `.webp`; con otro formato el
build falla al prerenderizar), de 1600 a 2400 px de ancho (las imágenes a sangre se muestran hasta 1600 px y en
pantallas de alta densidad conviene el doble). Para convertir una JPG o PNG: instale Pillow una vez
(`pip install Pillow`) y corra `python -c "from PIL import Image; Image.open('foto.jpg').save('foto.webp', quality=82)"`
(o use squoosh.app). Cópiela en `src/assets/img/`, regístrela en `src/data/media.ts` con
`pic('<nombre>', <ancho en px>)`, su texto alternativo y `pos` (el punto de la imagen que no se recorta, como en
CSS `object-position`, por ejemplo `'50% 40%'`), y úsela con su clave (`img: 'rack'`) en los datos. Después corra
`python tools/variantes.py`: genera las versiones de 640 y 1024 px que los celulares y las tarjetas descargan en
lugar del original.
En `media.ts`, `ref: true` marca las visualizaciones 3D (muestran la leyenda "Imagen de referencia") y `ref: false`
las fotografías reales del equipo (`src/assets/img/campo/`, tomadas de interfaz.com.mx).

El cotizador envía la solicitud a `/api/cotizacion` cuando la recepción automática está configurada (ver
"Recepción de cotizaciones"); si no, la abre en WhatsApp o en el correo del usuario con el mensaje escrito.

## Estructura

```
src/
  assets/brand/     logotipo oficial (transparente y placa azul)
  assets/img/       visualizaciones 3D de referencia (sustituir por fotografía real)
  assets/img/campo/ fotografías reales del equipo en campo
  components/       layout (header, footer, encabezados), home, cotizador, láminas técnicas, ui
  data/             empresa, soluciones, tipos de cotización, industrias, proyectos, SEO y datos estructurados
  lib/              utilidades, SEO por página, cotización (compartido con el servidor), analítica
  pages/            Inicio, Soluciones, Servicio, Industrias, Proyectos, Nosotros, Contacto, Aviso de privacidad
  entry-server.tsx  dibuja cada página para el prerender
  main.tsx          arranque en el navegador (toma el HTML prerenderizado)
api/                funciones de Vercel (api/cotizacion.ts)
server/cotizacion/  recepción de cotizaciones: validación, folio, correo (Resend) y WhatsApp (Cloud API)
e2e/                pruebas de navegador (Playwright)
public/             íconos, og-image y logotipo para correos (email/)
scripts/            HTML por página con sitemap y robots (prerender), revisión de hidratación y vista previa
tools/renders/      escenas 3D de la primera versión de las imágenes de referencia (no forman parte del sitio)
tools/variantes.py  genera las versiones de 640 y 1024 px de las imágenes
```

## Despliegue en Vercel

Dirección publicada: **https://interfaztelecom.com.mx** (`interfaztelecom.mx`, las versiones con `www` y `interfaz-redes.vercel.app` redirigen ahí)

El sitio se publica en el proyecto de Vercel **`interfaz-redes`** (independiente del proyecto `interfaz-monterrey`,
que publica interfaz.com.mx). El proyecto está conectado al repositorio de GitHub con **Root Directory**
`interfaz-redes-demo`, así que **cada `git push` a `main` publica una nueva versión** en producción; las otras
ramas generan vistas previas.

**Sólo `main` publica.** Para un cambio grande, trabaje en una rama: al subirla, Vercel arma una vista previa
(protegida con su cuenta de Vercel) y, al revisarla, se une a `main`. Para publicar cambios:

```bash
git add -A
git commit -m "Describe el cambio"
git push
```

Sin GitHub también se puede publicar con `vercel deploy --prod` desde la raíz del repositorio, con la carpeta
vinculada al proyecto `interfaz-redes` (`vercel link`). **Nunca elija `interfaz-monterrey`** si la CLI pregunta
el proyecto: ese publica interfaz.com.mx.

**Revertir:** en Vercel → Deployments, abra la publicación anterior que funcionaba → «⋯» → **Instant Rollback**
(vuelve en segundos, sin compilar). Después corrija en el código y publique de nuevo. La primera versión del sitio
queda además en la etiqueta de git `respaldo-original`.

Variables del sitio (**Settings → Environment Variables**, opcionales; las `VITE_*` se leen al compilar, así que
requieren volver a publicar):
- `VITE_GA_ID` — ID de Google Analytics 4 (`G-XXXXXXX`). Si se deja vacío, no se carga ningún script de medición.
- `VITE_SITE_URL` — sólo para sobrescribir la URL del sitio en un build; por omisión es `COMPANY.site`.
- `VITE_ROUTER=hash` — lo usa `build:preview` (`.env.preview`): rutas con `#` para el archivo único.

Dominios (**Settings → Domains**): `interfaztelecom.com.mx` es el principal; `www.interfaztelecom.com.mx`,
`interfaztelecom.mx` y `www.interfaztelecom.mx` redirigen a él (308). Los dos dominios están registrados en Akky
y usan los servidores de nombres de Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`), así que sus registros DNS
(incluidos los de correo, si se contrata) se administran en Vercel → Domains. Las direcciones `*.vercel.app` envían
`X-Robots-Tag: noindex` y `interfaz-redes.vercel.app` redirige al dominio propio.

`vercel.json` ya incluye:
- Sin reescrituras: cada ruta pública tiene su propio HTML (`scripts/prerender.mjs`, servido con `cleanUrls` como
  `/soluciones/fibra-optica`) con su contenido, título, descripción y datos estructurados, para que WhatsApp,
  Facebook y los buscadores los lean sin JavaScript. El sitemap y robots.txt salen de las mismas rutas. Cualquier otra dirección recibe `404.html` con estado 404 y `noindex`, y la app muestra «Esta página
  no existe». **Una página nueva debe agregarse a `src/data/seo.ts`** (si no, su dirección directa daría 404).
- Redirecciones permanentes (308) desde URLs del sitio anterior en WordPress (`/servicios/`, etc.), de slugs
  renombrados (`/soluciones/switching-routing` → `/soluciones/redes-empresariales`) y de `interfaz-redes.vercel.app`.
- Caché de un año para `/assets/*` y de un día para íconos y `og-image.jpg`; cabeceras básicas de seguridad
  (HSTS lo agrega Vercel) y `noindex` en `*.vercel.app`.
- `Content-Security-Policy-Report-Only`: una política de seguridad en modo de sólo aviso (no bloquea nada). Si se
  agrega un script o servicio externo (por ejemplo Google Analytics), revise la consola del navegador y amplíe la
  política antes de volverla obligatoria.

## Recepción de cotizaciones

Flujo: el cliente llena el cotizador → `POST /api/cotizacion` valida los datos (los mismos criterios que el
navegador, en `src/lib/cotizacion.ts`), asigna un folio (`COT-AAMMDD-XXXXXX`) y avisa a ventas por **correo**
(con los archivos adjuntos y Reply-To al cliente) y por **WhatsApp** (si está configurado). Si llegó a ventas por
al menos un canal, manda un **acuse de recibo** al cliente y le muestra el folio; si no llegó por ningún canal,
el cotizador lo dice y ofrece enviarla por WhatsApp o correo. Nunca muestra "Solicitud recibida" sin que el
servidor la haya entregado. Si sólo llegó el WhatsApp (falló el correo), la confirmación lo dice: la solicitud llegó
sin archivos y con la descripción resumida, y ofrece mandarlos citando el folio.

**La recepción se activa con el correo** (`RESEND_API_KEY`). WhatsApp es un aviso adicional: los archivos y la
descripción completa sólo viajan por correo, así que configurar sólo WhatsApp no activa nada. Mientras no haya
correo configurado, `GET /api/cotizacion` responde `recepcion: false` y el cotizador funciona como antes: abre
WhatsApp o el correo con la solicitud escrita.

**Orden para activarla:** 1) dominio verificado en Resend y registro DMARC; 2) variables en el entorno **Preview**
con destinatarios de prueba; 3) prueba completa en una vista previa (correo, acuse, WhatsApp con todos los campos
al máximo, adjuntos, reintento y límite); 4) variables en **Production** (marcadas como *Sensitive*) y Redeploy;
5) monitoreo (ver «Seguridad y registro»). Hasta tener publicado el límite del Firewall de Vercel, conviene activar
con `COTIZACION_ACUSE=0`.

### Variables (Vercel → Settings → Environment Variables, entorno Production)

Lista completa con explicación en `.env.example`. Son del servidor: nunca llevan prefijo `VITE_` ni van en `.env`.
Después de cambiarlas hay que volver a publicar (Deployments → Redeploy) para que se apliquen.

| Variable | Para qué |
| --- | --- |
| `RESEND_API_KEY` | Clave de Resend. Con ella se activa el envío por correo. |
| `COTIZACION_DESTINATARIOS` | Correos que reciben cada solicitud, separados por coma. Por omisión `ventas@interfaz.com.mx`. |
| `COTIZACION_REMITENTE` | Remitente; su dominio debe estar verificado en Resend. Por omisión `Interfaz Redes <cotizaciones@interfaztelecom.com.mx>`. |
| `COTIZACION_RESPONDER_A` | A dónde llega la respuesta del cliente al acuse. Por omisión `ventas@interfaz.com.mx`. |
| `COTIZACION_ACUSE` | `0` para no mandar acuse al cliente (el acuse sale por Resend: requiere `RESEND_API_KEY`). |
| `COTIZACION_LIMITE_POR_IP` | Solicitudes válidas por IP cada 10 minutos (por omisión 5). |
| `COTIZACION_PRUEBA` | `1` sólo en local: escribe los mensajes en `.cotizaciones-prueba/` en vez de enviarlos. En Vercel no tiene efecto. |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Credenciales de WhatsApp Business Platform (Cloud API). |
| `WHATSAPP_DESTINATARIOS` | Números que reciben el aviso, con lada y sin "+", separados por coma (ej. `5218112345678`). |
| `WHATSAPP_PLANTILLA`, `WHATSAPP_PLANTILLA_IDIOMA` | Nombre e idioma de la plantilla aprobada (por omisión `nueva_cotizacion`, `es_MX`). |
| `WHATSAPP_API_VERSION` | Versión de la Graph API de Meta (por omisión `v23.0`). Meta retira versiones: revísela cada año. |

**Cambiar destinatarios:** edite `COTIZACION_DESTINATARIOS` o `WHATSAPP_DESTINATARIOS` en Vercel y vuelva a
publicar. No hay correos ni teléfonos de destino escritos en el código, salvo el valor por omisión de ventas
(`COMPANY.email` en `src/data/company.ts`).

### Correo con Resend

1. Cree una cuenta en https://resend.com y agregue el dominio `interfaztelecom.com.mx` (Domains → Add Domain).
2. Agregue en Vercel (Domains → interfaztelecom.com.mx → DNS Records) los registros que muestra Resend
   (MX y TXT de `send`, y TXT `resend._domainkey`) y espere a que Resend lo marque como verificado.
3. Cree una API key con permiso de envío y guárdela como `RESEND_API_KEY` en Vercel.

Cada correo lleva una clave de idempotencia (`<folio>-ventas`, `<folio>-acuse`): si un envío se reintenta, Resend
no lo duplica. Los archivos (hasta 5, 4 MB en total; PDF, DWG, DXF, JPG, PNG, HEIC, DOCX, XLSX) llegan adjuntos
al correo de ventas y no se guardan en el sitio; el límite viene de Vercel (4.5 MB por solicitud).

### WhatsApp (WhatsApp Business Platform · Cloud API de Meta)

Es la integración oficial; no se usa WhatsApp Web ni sesiones personales. Requiere una cuenta de Meta Business,
una app con el producto WhatsApp, un número dado de alta en la plataforma (no puede estar en uso en la app normal
de WhatsApp), un token permanente de usuario del sistema y una plantilla aprobada. Como los destinatarios no le
escriben antes al número de la empresa, Meta sólo permite avisarles con una **plantilla aprobada**.

Plantilla `nueva_cotizacion` (categoría *Utilidad*, idioma *Spanish (MEX)*). Debe tener **exactamente** las 10
variables `{{1}}`…`{{10}}` en este orden (folio, fecha, cliente, empresa, servicio, ubicación, WhatsApp, correo,
descripción, archivos); si se cambia el número o el orden, cada aviso falla. Al enviarla a revisión, Meta pide un
ejemplo por variable. El texto fijo mide 236 caracteres y el código recorta cada variable para que el mensaje armado
no pase de 1 024 (límite de Meta); la descripción llega resumida a 230 caracteres. Cuerpo:

```
*NUEVA COTIZACIÓN — INTERFAZ REDES*

Folio: {{1}}
Fecha: {{2}}

*Cliente:* {{3}}
*Empresa:* {{4}}
*Servicio:* {{5}}
*Ubicación:* {{6}}
*WhatsApp:* {{7}}
*Correo:* {{8}}

*Descripción del proyecto:*
{{9}}

*Archivos:*
{{10}}

Los datos completos y los archivos llegan al correo de ventas.
```

Mientras no esté configurada, después de enviar la solicitud el cliente ve un botón opcional "Enviar aviso por
WhatsApp" que abre WhatsApp con su folio y la solicitud escrita; el envío lo confirma él (no es automático).
Al configurar las variables de WhatsApp, el aviso pasa a ser automático y ese botón deja de mostrarse.

`WHATSAPP_DESTINATARIOS` va con lada de país y sin "+" (para México, `52` + 10 dígitos; confirme el formato con un
envío de prueba). En modo de desarrollo de la app de Meta sólo se puede enviar a números de prueba registrados.

### Seguridad y registro

- Validación en el navegador y otra vez en el servidor; longitudes máximas por campo.
- Sólo acepta envíos desde el propio sitio (cabecera `Origin`; en vistas previas, también su propia dirección de
  Vercel; `localhost` sólo fuera de Vercel), con campo trampa contra bots (`hp_ref`), tiempo mínimo de captura y
  límite de solicitudes válidas por IP (`COTIZACION_LIMITE_POR_IP`, por omisión 5 cada 10 minutos; IPv6 por bloque
  /64; el 429 lleva `Retry-After`).
- **El límite y la memoria de reintentos son por instancia de la función.** El límite real es la regla
  «Límite cotizaciones por IP» del Firewall de Vercel (máximo 10 `POST /api/cotizacion` por IP cada 10 minutos;
  Vercel → Firewall). Si hace falta más, Vercel BotID o Turnstile.
- Textos: el correo y el teléfono se validan con expresiones lineales (un texto enorme no traba la función) y los
  campos de una línea no aceptan saltos de línea.
- Archivos: tipo, cantidad y tamaño revisados, y el contenido debe corresponder a la extensión (firmas de PDF, JPG,
  PNG, HEIC, DWG, DXF y Office); el nombre se limpia de caracteres de control.
- Un doble clic o un reintento con la misma clave conserva el folio y no duplica el correo (Resend usa la clave de
  idempotencia). Un aviso de WhatsApp sí podría repetirse si el reintento cae en otra instancia.
- El acuse al cliente no repite texto libre del formulario (no sirve para mandar mensajes a terceros).
- Credenciales sólo en variables de entorno del servidor; los errores al cliente no exponen detalles internos.
- Registro en los logs de Vercel (Project → Logs), sin datos personales:
  - `{"evento":"cotizacion", folio, recibida, correo, whatsapp, acuse, archivos, tipos}` por cada solicitud, con el
    estado de cada canal (`enviado`, `parcial`, `error`, `no_configurado`, `omitido`, `prueba`).
  - `{"evento":"cotizacion", "resultado":"limite" | "descartada_spam"}` para lo rechazado.
  - `{"evento":"cotizacion_error", folio, canal, detalle, archivos, descripcion_recortada}` por cada canal que
    falló, y `canal: "servidor"` (con un hash de la clave) si la función falló.
- Monitoreo recomendado: un monitor externo que consulte `GET /api/cotizacion` y avise si deja de responder
  `"recepcion":true`, alertas o Log Drain para `cotizacion_error`, y los webhooks de rebote de Resend.

### Contrato de la API

`GET /api/cotizacion` → `{"recepcion": boolean, "whatsapp": boolean}` (si la recepción automática está activa).

`POST /api/cotizacion` (`multipart/form-data`, desde el propio sitio): `types` (uno o varios de `QUOTE_TYPES`),
`site`, `location`, `description`, `name`, `company`, `email`, `phone`, `context`, `files` (hasta 5), `key`
(`AAMMDD-uuid`, la misma en un reintento), `elapsed` (ms desde que se abrió el cotizador) y `hp_ref` (campo
trampa, vacío). Respuestas:

| Estado | Cuerpo |
| --- | --- |
| 200 | `{"ok": true, "folio", "fecha", "estados": {"correo", "whatsapp", "acuse"}}` |
| 400 | `{"ok": false, "codigo": "formato" \| "rechazada" \| "invalida" \| "archivos", "mensaje", "errores"?}` (`errores`: por campo) |
| 403 | `codigo: "origen"` (no viene del sitio) |
| 413 | `codigo: "invalida"` (un campo excede su máximo) o `"archivos"` (más de 4 MB) |
| 429 | `codigo: "limite"`, con `Retry-After` |
| 502 | `codigo: "entrega"` (no llegó por ningún canal), con `estados` |
| 500 / 503 | `codigo: "servidor"` / `"no_configurado"` |

El cotizador nunca muestra «Solicitud recibida» si no recibe un 200.

### Probar en local

Copie la plantilla como `.env.local` (en PowerShell: `Copy-Item .env.example .env.local`). **Nunca ponga claves en
`.env`**: ese archivo se sube a GitHub y el repositorio es público. Si cambia `.env.local` con `npm run dev`
corriendo, reinicie el servidor.

`npm run dev` atiende `/api` con la misma función que Vercel, con las variables de `.env` y `.env.local` (las del
sistema tienen prioridad). `.env.local` con `COTIZACION_PRUEBA=1` y `npm run dev`: el cotizador envía a la función local, que escribe el
correo a ventas, el acuse y el aviso de WhatsApp en `.cotizaciones-prueba/` en lugar de enviarlos (las pruebas
automáticas usan este modo). Con `RESEND_API_KEY` en `.env.local` y sin `COTIZACION_PRUEBA`, envía de verdad.

## Medición (GA4)

Con `VITE_GA_ID` configurado se registran:
- `page_view` en cada cambio de página.
- `generate_lead` al enviar una cotización: `method` es `formulario` (recibida por el servidor), `whatsapp` o
  `email` (envío manual), e incluye el tipo de necesidad.
- `contact_whatsapp`, `contact_email` y `contact_phone` en cualquier enlace de contacto del sitio.

Marca `generate_lead` como evento clave (conversión) en GA4.

## Dependencias

Dependabot (`.github/dependabot.yml`) propone cada mes las actualizaciones menores agrupadas en un pull request;
las mayores se hacen a mano, cada una en su rama y con las pruebas e2e: Vite 7/8 (revisar `prerender.mjs` y el
`/api` local de `vite.config.ts`), React 19, lucide-react 1.x, TypeScript 7 y Tailwind 4 (este último cambia
estilos: requiere revisión de diseño y Safari 16.4 o superior).

`npm audit --omit=dev` (lo que llega al sitio) da 0. `npm audit` completo reporta avisos en herramientas de
compilación (de Tailwind 3 y PostCSS) que no llegan al navegador y no tienen corrección publicada. **No ejecute
`npm audit fix --force`**: instala Tailwind 4 y una versión vieja de vite-plugin-singlefile.

## Pendientes

- [x] Fotografía real del equipo en campo (portada, Nosotros y servicios de cableado, racks, certificación y mantenimiento).
- [ ] Fotografía real para fibra óptica, CCTV, control de acceso, WiFi e industrias (hoy son visualizaciones 3D).
- [ ] Reemplazar los casos demostrativos por proyectos autorizados (`src/data/content.ts`).
- [ ] Logotipo en mayor resolución (SVG o PNG ≥ 800 px) en `src/assets/brand/`.
- [ ] Confirmar WhatsApp, años de experiencia, vigencia del REPSE y marcas.
- [ ] Escribir la razón social en `RAZON_SOCIAL` (`src/pages/Privacy.tsx`) y revisar el aviso con un asesor legal.
- [x] Dominio propio `interfaztelecom.com.mx` (y `interfaztelecom.mx`) conectado, con HTTPS.
- [x] Dominio verificado en Resend (con DMARC) y prueba real de envío en una vista previa (octubre de 2026).
- [ ] Recepción en producción: `RESEND_API_KEY` y `COTIZACION_DESTINATARIOS` también en Production, publicar la
      regla del Firewall y Redeploy.
- [ ] WhatsApp Cloud API y plantilla `nueva_cotizacion` (opcional).
- [ ] Search Console y Perfil de Empresa de Google (código postal y coordenadas para los datos estructurados).
