# Interfaz Redes · Sitio web

Sitio de **Interfaz Redes y Telecomunicaciones** (Monterrey, N.L.).
React 18 + TypeScript + Vite + Tailwind CSS + Motion + React Router.

## Desarrollo

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # producción → dist/ (genera también sitemap.xml y robots.txt)
npm run preview        # sirve dist/ localmente
npm run build:preview  # un solo HTML autocontenido → dist-preview/ (para compartir el demo)
```

Requiere Node 18 o superior.

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. En Vercel: **Add New → Project → Import** el repositorio. Vercel detecta Vite y usa `vercel.json`
   (`npm run build`, salida `dist/`). No hay que cambiar nada.
3. **Settings → Environment Variables** (opcional):
   - `VITE_SITE_URL` — dominio definitivo, por defecto `https://interfazredes.com`. Se usa en canonical, sitemap y Open Graph.
   - `VITE_GA_ID` — ID de Google Analytics 4 (`G-XXXXXXX`). Si se deja vacío, no se carga ningún script de medición.
4. **Settings → Domains**: agrega `interfazredes.com` y `www.interfazredes.com` y apunta el DNS como indique Vercel.

`vercel.json` ya incluye:
- Reescritura de todas las rutas a `index.html` (rutas limpias como `/soluciones/fibra-optica`).
- Redirecciones 301 desde URLs del sitio anterior en WordPress (`/servicios/`, etc.).
- Caché de un año para `/assets/*` y cabeceras básicas de seguridad.

## Estructura

```
src/
  assets/brand/     logotipo oficial (transparente y placa azul)
  assets/img/       imágenes de referencia (sustituir por fotografía real)
  components/       layout (header, footer, encabezados), home, cotizador, láminas técnicas
  data/             empresa, soluciones, industrias, proyectos, necesidades, proceso
  lib/              utilidades, SEO por página, analítica
  pages/            Inicio, Soluciones, Servicio, Industrias, Proyectos, Nosotros, Contacto, Aviso de privacidad
public/             favicon, og-image, sitemap.xml y robots.txt (generados en el build)
scripts/            generador de sitemap y empaquetado del demo
tools/renders/      escenas 3D que generaron las imágenes de referencia
```

El contenido editable vive en `src/data/`: servicios en `solutions.ts`, proyectos e industrias en `content.ts`,
datos de contacto en `company.ts`.

## Medición (GA4)

Con `VITE_GA_ID` configurado se registran:
- `page_view` en cada cambio de página.
- `generate_lead` al enviar una cotización por WhatsApp o correo (incluye el tipo de necesidad).
- `contact_whatsapp`, `contact_email` y `contact_phone` en cualquier enlace de contacto del sitio.

Marca `generate_lead` como evento clave (conversión) en GA4.

## Pendientes antes de lanzar

- [ ] Sustituir imágenes de referencia por fotografía real de obra (`src/assets/img/` y `src/data/media.ts`).
- [ ] Reemplazar los casos demostrativos por proyectos autorizados (`src/data/content.ts`).
- [ ] Logotipo en mayor resolución (SVG o PNG ≥ 800 px) en `src/assets/brand/`.
- [ ] Confirmar WhatsApp, años de experiencia, vigencia del REPSE y marcas.
- [ ] Completar razón social en el aviso de privacidad (`src/pages/Privacy.tsx`) y revisarlo con asesor legal.
- [ ] Quitar las leyendas "Imagen de referencia" y "Caso demostrativo" cuando el contenido sea real.
