# Interfaz Redes · Sitio web

Sitio de **Interfaz Redes y Telecomunicaciones** (Monterrey, N.L.).
React 18 + TypeScript + Vite + Tailwind CSS + Motion + React Router + Lucide.

## Iniciar el sitio

Requiere Node 18 o superior. Desde la terminal de VS Code, dentro de esta carpeta:

```bash
npm install            # sólo la primera vez o al cambiar dependencias
npm run dev            # servidor de desarrollo
```

Vite muestra la dirección en la terminal (normalmente `http://localhost:5173/`; si ese puerto está ocupado
usa el siguiente libre, por ejemplo `5174`). Los cambios en el código se ven al guardar. `Ctrl + C` lo detiene.

## Versión de producción

```bash
npm run build          # compila a dist/ (genera también sitemap.xml, robots.txt y un HTML por página)
npm run preview        # sirve dist/ localmente para revisarla
npm run build:preview  # un solo HTML autocontenido → dist-preview/ (para compartir una vista previa)
```

## Comprobaciones

```bash
npm run typecheck      # TypeScript
npm run test:e2e       # pruebas de navegador (rutas, header, menú móvil, cotizador, filtros) en escritorio y móvil
```

Las pruebas usan el Google Chrome instalado en el equipo. Con Edge: `PW_CHANNEL=msedge npm run test:e2e`
(en PowerShell: `$env:PW_CHANNEL='msedge'; npm run test:e2e`). Levantan su propio servidor en el puerto 5199.

Para probar el sitio publicado en lugar del local: `BASE_URL=https://interfaztelecom.com.mx npm run test:e2e`
(en PowerShell: `$env:BASE_URL='https://interfaztelecom.com.mx'; npm run test:e2e`).

## Dónde modificar

| Qué | Dónde |
| --- | --- |
| Teléfono, WhatsApp, correo, dirección, horario | `src/data/company.ts` |
| Servicios (textos, especificaciones, preguntas frecuentes) | `src/data/solutions.ts` |
| Opciones del cotizador | `QUOTE_TYPES` en `src/data/solutions.ts` |
| Quién recibe las cotizaciones (correos y números de WhatsApp) | variables de entorno en Vercel (ver "Recepción de cotizaciones") |
| Campos, límites y textos de la solicitud | `src/lib/cotizacion.ts` (los comparten el cotizador y el servidor) |
| Correos de la cotización (aviso a ventas y acuse al cliente) | `server/cotizacion/correo.ts` |
| Industrias, proyectos, necesidades y proceso | `src/data/content.ts` |
| Fotografías | archivos en `src/assets/img/` y su registro en `src/data/media.ts` |
| Galería "Nuestro equipo en campo" | `src/pages/Home.tsx` y `src/pages/About.tsx` |
| Razón social del aviso de privacidad | constante `RAZON_SOCIAL` en `src/pages/Privacy.tsx` |
| Logotipo | `src/assets/brand/` (ver `index.ts`) y `public/favicon.jpg` |
| Título y descripción de cada página (Google y vista previa al compartir) | `src/data/seo.ts` |
| Colores y tipografía | `tailwind.config.js` y `src/index.css` |
| Páginas | `src/pages/` · rutas en `src/App.tsx` |

Para cambiar una fotografía: copie la imagen (de preferencia `.webp`, de 1600 a 2400 px de ancho; las imágenes a
sangre se muestran hasta 1600 px y en pantallas de alta densidad conviene el doble) en `src/assets/img/`,
regístrela en `src/data/media.ts` con `pic('<nombre>', <ancho en px>)` y su texto alternativo, y úsela con su
clave (`img: 'rack'`) en los datos. Después corra `python tools/variantes.py` (requiere Pillow): genera las versiones
de 640 y 1024 px que los celulares y las tarjetas descargan en lugar del original.
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
  data/             empresa, soluciones, industrias, proyectos, necesidades, proceso
  lib/              utilidades, SEO por página, analítica
  pages/            Inicio, Soluciones, Servicio, Industrias, Proyectos, Nosotros, Contacto, Aviso de privacidad
api/                funciones de Vercel (api/cotizacion.ts)
server/cotizacion/  recepción de cotizaciones: validación, folio, correo (Resend) y WhatsApp (Cloud API)
e2e/                pruebas de navegador (Playwright)
public/             favicon, og-image, logotipo para correos (email/), sitemap.xml y robots.txt
scripts/            sitemap, HTML por página (prerender) y empaquetado de la vista previa
tools/renders/      escenas 3D de la primera versión de las imágenes de referencia (no forman parte del sitio)
tools/variantes.py  genera las versiones de 640 y 1024 px de las imágenes
```

## Despliegue en Vercel

Dirección publicada: **https://interfaztelecom.com.mx** (`interfaztelecom.mx`, las versiones con `www` y `interfaz-redes.vercel.app` redirigen ahí)

El sitio se publica en el proyecto de Vercel **`interfaz-redes`** (independiente del proyecto `interfaz-monterrey`,
que publica interfaz.com.mx). El proyecto está conectado al repositorio de GitHub con **Root Directory**
`interfaz-redes-demo`, así que **cada `git push` a `main` publica una nueva versión** en producción; las otras
ramas generan vistas previas.

Para publicar cambios:

```bash
git add -A
git commit -m "Describe el cambio"
git push
```

Sin GitHub, también se puede publicar directamente desde la raíz del repositorio con `vercel deploy --prod`.

Variables (**Settings → Environment Variables**, opcionales):
- `VITE_SITE_URL` — URL pública para canonical, sitemap y Open Graph (imagen de la vista previa al compartir el enlace).
  Por defecto la de `.env` (`https://interfaztelecom.com.mx`).
- `VITE_GA_ID` — ID de Google Analytics 4 (`G-XXXXXXX`). Si se deja vacío, no se carga ningún script de medición.

Dominios (**Settings → Domains**): `interfaztelecom.com.mx` es el principal; `www.interfaztelecom.com.mx`,
`interfaztelecom.mx` y `www.interfaztelecom.mx` redirigen a él (308). Los dos dominios están registrados en Akky
y usan los servidores de nombres de Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`), así que sus registros DNS
(incluidos los de correo, si se contrata) se administran en Vercel → Domains. Las direcciones `*.vercel.app` envían
`X-Robots-Tag: noindex` y `interfaz-redes.vercel.app` redirige al dominio propio.

`vercel.json` ya incluye:
- Sin reescrituras: cada ruta pública tiene su propio HTML (`scripts/prerender.mjs`, servido con `cleanUrls` como
  `/soluciones/fibra-optica`) con su título y descripción, para que WhatsApp, Facebook y Google los lean sin
  JavaScript. Cualquier otra dirección recibe `404.html` con estado 404 y `noindex`, y la app muestra «Esta página
  no existe». **Una página nueva debe agregarse a `src/data/seo.ts`** (si no, su dirección directa daría 404).
- Redirecciones 301 desde URLs del sitio anterior en WordPress (`/servicios/`, etc.).
- Caché de un año para `/assets/*`, cabeceras básicas de seguridad y `noindex` en `*.vercel.app`.

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
5) monitoreo (ver «Seguridad y registro»). Hasta tener un límite compartido (Firewall de Vercel), conviene activar
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
| `COTIZACION_ACUSE` | `0` para no mandar acuse al cliente. |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Credenciales de WhatsApp Business Platform (Cloud API). |
| `WHATSAPP_DESTINATARIOS` | Números que reciben el aviso, con lada y sin "+", separados por coma (ej. `5218112345678`). |
| `WHATSAPP_PLANTILLA`, `WHATSAPP_PLANTILLA_IDIOMA` | Nombre e idioma de la plantilla aprobada (por omisión `nueva_cotizacion`, `es_MX`). |

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
- **El límite y la memoria de reintentos son por instancia de la función.** Para un límite real conviene una regla
  de rate limit en el Firewall de Vercel para `POST /api/cotizacion` y, si hace falta, Vercel BotID o Turnstile.
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

### Probar en local

Copie la plantilla como `.env.local` (en PowerShell: `Copy-Item .env.example .env.local`). **Nunca ponga claves en
`.env`**: ese archivo se sube a GitHub y el repositorio es público. Si cambia `.env.local` con `npm run dev`
corriendo, reinicie el servidor.

`.env.local` con `COTIZACION_PRUEBA=1` y `npm run dev`: el cotizador envía a la función local, que escribe el
correo a ventas, el acuse y el aviso de WhatsApp en `.cotizaciones-prueba/` en lugar de enviarlos (las pruebas
automáticas usan este modo). Con `RESEND_API_KEY` en `.env.local` y sin `COTIZACION_PRUEBA`, envía de verdad.

## Medición (GA4)

Con `VITE_GA_ID` configurado se registran:
- `page_view` en cada cambio de página.
- `generate_lead` al enviar una cotización: `method` es `formulario` (recibida por el servidor), `whatsapp` o
  `email` (envío manual), e incluye el tipo de necesidad.
- `contact_whatsapp`, `contact_email` y `contact_phone` en cualquier enlace de contacto del sitio.

Marca `generate_lead` como evento clave (conversión) en GA4.

## Pendientes

- [x] Fotografía real del equipo en campo (portada, Nosotros y servicios de cableado, racks, certificación y mantenimiento).
- [ ] Fotografía real para fibra óptica, CCTV, control de acceso, WiFi e industrias (hoy son visualizaciones 3D).
- [ ] Reemplazar los casos demostrativos por proyectos autorizados (`src/data/content.ts`).
- [ ] Logotipo en mayor resolución (SVG o PNG ≥ 800 px) en `src/assets/brand/`.
- [ ] Confirmar WhatsApp, años de experiencia, vigencia del REPSE y marcas.
- [ ] Escribir la razón social en `RAZON_SOCIAL` (`src/pages/Privacy.tsx`) y revisar el aviso con un asesor legal.
- [x] Dominio propio `interfaztelecom.com.mx` (y `interfaztelecom.mx`) conectado, con HTTPS.
- [ ] Activar la recepción automática: `RESEND_API_KEY` y dominio verificado en Resend; WhatsApp Cloud API y plantilla.
- [x] React Router 7 y Vite 6. `npm audit` aún reporta avisos en herramientas de compilación de Tailwind 3
      (no llegan al navegador); se resuelven al migrar a Tailwind 4.
