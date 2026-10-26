# Interfaz 3.0 · Cambios

Rama `interfaz-3.0` (desde `interfaz-2.0`). Punto de restauración: etiqueta `punto-recuperacion-3.0` (= `7cfdc46`, el
último commit de 2.0). Nada se publicó. El detalle de animaciones y reglas está en `MOTION_DESIGN_SYSTEM.md`.

## Concepto

«Infraestructura viva»: la portada recorre una instalación —cableado, fibra, seguridad e integración— sobre fotografías
con anotaciones técnicas y una escena 3D, y termina en un llamado a cotizar. Lo comercial no cambió: cotizador, folio,
acuse, WhatsApp, correo, idiomas y parámetros de las URL funcionan igual.

## Portada (nueva composición)

| Orden | Sección | Qué es |
| --- | --- | --- |
| 1 | Hero cinematográfico | Foto a sangre que se abre como compuerta, titular palabra por palabra («La infraestructura que conecta tu operación.»), anotaciones sobre la foto, parallax con el cursor, índice de capítulos. Recorte vertical propio en el teléfono |
| 2 | Recorrido «De la conexión a la operación» | 4 capítulos: redes y cableado, fibra, seguridad electrónica, infraestructura integrada. Escenario fijo con GSAP en escritorio; capítulos apilados en el teléfono |
| 3 | Intro y equipo en campo | Sin cambios (fotos reales del equipo) |
| 4 | Explorador de soluciones | Pantalla dividida: índice de 8 soluciones y escenario con máscara, titular animado y CTA que cotiza ese servicio |
| 5 | Explora una instalación | Rack 3D interactivo (three.js) con 7 componentes, ficha y servicios relacionados; foto en el teléfono / sin WebGL |
| 6 | Industrias | Paneles que se expanden con lo que suele necesitar cada sector |
| 7 | Explorador (acceso) | Sin cambios |
| 8 | Proyectos | Lista editorial con vista previa que sigue al cursor; miniaturas en el teléfono. Siguen marcados «Caso demostrativo» |
| 9 | Proceso | Sin cambios |
| 10 | Escena final | «Hablemos de tu próximo proyecto.» con conexiones que convergen en el CTA, y datos de contacto |

Se retiraron el diagrama de flujo (`FlowDiagram`, su contenido quedó dentro del recorrido) y el explorador de frentes
anterior (`home/Explorer.tsx`, reemplazado por `ServicesStage`). `QUOTE_FOR` pasó a `src/data/solutions.ts`.

## Todo el sitio

- **Escena final** nueva en Soluciones, Industrias, Proyectos y Nosotros (es el mismo `FinalCTA`).
- **Transición entre páginas**: máscara direccional de 0.55 s (antes, desvanecido de 0.38 s); línea de progreso
  mientras se descarga una página. Header y logotipo fijos.
- **Titulares** de páginas interiores (soluciones, servicio, industria, proyecto) entran palabra por palabra.
- **Idiomas**: textos nuevos en español, inglés, coreano y chino (estos tres siguen pendientes de revisión
  lingüística y con `noindex`). Titulares de escena más chicos en coreano y chino.
- **Corrección**: en desarrollo, StrictMode hacía que la página animara su entrada al abrirse; ahora la entrada
  inicial se reconoce por la clave de la ruta.

## Archivos nuevos

| Archivo | Para qué |
| --- | --- |
| `src/motion/tokens.ts` | Duraciones, curvas y escalonado (Motion y GSAP) |
| `src/motion/experience.ts` | Niveles full / lite / reduced, detección de WebGL, `?experiencia=` |
| `src/motion/primitives.tsx` | `SplitWords`, `useReveal`, `CoverBox`, `Callout`, `useCursorParallax`, `useMagnetic` |
| `src/motion/convergence.ts` | Canvas de la escena final |
| `src/components/home/Journey.tsx`, `journey-motion.ts` | Recorrido y su línea de tiempo GSAP |
| `src/components/home/ServicesStage.tsx` | Explorador de soluciones |
| `src/components/home/RackExplorer.tsx` | Sección «Explora una instalación» |
| `src/three/rackKit.ts`, `rackScene.ts` | Piezas y escena 3D (armado por pasos, materiales Phong, sin bloquear la página) |
| `src/data/journey.ts` | Fotos, encuadres, anotaciones y servicios de cada capítulo |
| `src/assets/img/aisleTall*.webp` | Recorte vertical del hero para teléfono |

## Dependencias

`gsap@3.15.0`, `three@0.186.1` (y `@types/three` en desarrollo). Las animaciones de GSAP se montan con
`gsap.context` (no hace falta `@gsap/react`). React, Vite y el resto no cambiaron de versión.

## Peso

| Paquete | 2.0 | 3.0 |
| --- | --- | --- |
| JavaScript inicial (gzip) | 120.6 KB | 128.3 KB |
| GSAP + recorrido (sólo `full`) | — | 46.1 KB |
| three.js + escena (sólo `full`, al acercarse) | — | 143.1 KB |
| Portada en el teléfono, foto del hero | 141 KB (1024 px, horizontal) | 119 KB (683 px, recorte vertical) |

## Pendientes y decisiones de la empresa

- Fotografía real de instalaciones para el recorrido y el hero (hoy son renders; desde 3.1 sin leyenda visible).
- La escena 3D es ilustrativa; un modelo hecho en Blender con fotos de un site real de Interfaz la mejoraría.
- Revisión lingüística de los textos nuevos en inglés, coreano y chino.
- Lo pendiente de 2.0 sigue igual (`PROGRESO_INTERFAZ_2.0.md`).
