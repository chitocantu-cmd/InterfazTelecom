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

Para probar el sitio publicado en lugar del local: `BASE_URL=https://interfaz-redes.vercel.app npm run test:e2e`
(en PowerShell: `$env:BASE_URL='https://interfaz-redes.vercel.app'; npm run test:e2e`).

## Dónde modificar

| Qué | Dónde |
| --- | --- |
| Teléfono, WhatsApp, correo, dirección, horario | `src/data/company.ts` |
| Servicios (textos, especificaciones, preguntas frecuentes) | `src/data/solutions.ts` |
| Opciones del cotizador | `QUOTE_TYPES` en `src/data/solutions.ts` |
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

El cotizador no tiene servidor propio: arma la solicitud y la abre en WhatsApp o en el correo del usuario con el
mensaje escrito. El envío se completa en esa aplicación.

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
e2e/                pruebas de navegador (Playwright)
public/             favicon, og-image, sitemap.xml y robots.txt (generados en el build)
scripts/            sitemap, HTML por página (prerender) y empaquetado de la vista previa
tools/renders/      escenas 3D de la primera versión de las imágenes de referencia (no forman parte del sitio)
tools/variantes.py  genera las versiones de 640 y 1024 px de las imágenes
```

## Despliegue en Vercel

Dirección publicada: **https://interfaz-redes.vercel.app**

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
  Si no se define, en Vercel se usa el dominio de producción del proyecto: `interfaz-redes.vercel.app` mientras no
  haya dominio propio y el dominio propio en cuanto se conecte. Fuera de Vercel, el valor de `.env`.
- `VITE_GA_ID` — ID de Google Analytics 4 (`G-XXXXXXX`). Si se deja vacío, no se carga ningún script de medición.

Dominio propio: **Settings → Domains**, agregar `interfazredes.com` y `www.interfazredes.com` y apuntar el DNS
como indique Vercel. Mientras el sitio sólo viva en `*.vercel.app`, esas direcciones envían `X-Robots-Tag: noindex`
para que Google no las indexe; con el dominio propio el sitio se indexa normalmente.

`vercel.json` ya incluye:
- Reescritura de todas las rutas a `index.html` (rutas limpias como `/soluciones/fibra-optica`). Las rutas
  públicas tienen además su propio HTML (`scripts/prerender.mjs`) con su título y descripción, para que WhatsApp,
  Facebook y Google los lean sin ejecutar JavaScript; Vercel lo sirve antes de la reescritura.
- Redirecciones 301 desde URLs del sitio anterior en WordPress (`/servicios/`, etc.).
- Caché de un año para `/assets/*`, cabeceras básicas de seguridad y `noindex` en `*.vercel.app`.

## Medición (GA4)

Con `VITE_GA_ID` configurado se registran:
- `page_view` en cada cambio de página.
- `generate_lead` al enviar una cotización por WhatsApp o correo (incluye el tipo de necesidad).
- `contact_whatsapp`, `contact_email` y `contact_phone` en cualquier enlace de contacto del sitio.

Marca `generate_lead` como evento clave (conversión) en GA4.

## Pendientes

- [x] Fotografía real del equipo en campo (portada, Nosotros y servicios de cableado, racks, certificación y mantenimiento).
- [ ] Fotografía real para fibra óptica, CCTV, control de acceso, WiFi e industrias (hoy son visualizaciones 3D).
- [ ] Reemplazar los casos demostrativos por proyectos autorizados (`src/data/content.ts`).
- [ ] Logotipo en mayor resolución (SVG o PNG ≥ 800 px) en `src/assets/brand/`.
- [ ] Confirmar WhatsApp, años de experiencia, vigencia del REPSE y marcas.
- [ ] Escribir la razón social en `RAZON_SOCIAL` (`src/pages/Privacy.tsx`) y revisar el aviso con un asesor legal.
- [ ] Conectar el dominio `interfazredes.com` en Vercel (requiere cambiar el DNS).
- [x] React Router 7 y Vite 6. `npm audit` aún reporta avisos en herramientas de compilación de Tailwind 3
      (no llegan al navegador); se resuelven al migrar a Tailwind 4.
