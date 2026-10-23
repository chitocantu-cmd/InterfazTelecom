# Progreso · Interfaz Redes 2.0

Registro de lo hecho, lo verificado y lo pendiente. Rama de trabajo: `interfaz-2.0` (local, **sin publicar**).
Punto de recuperación: etiqueta `punto-recuperacion-2.0` (= `59afee6`, lo que está en producción).

Estado: ✅ hecho y verificado · 🟡 hecho, falta algo de la empresa · ⏳ pendiente · ⛔ bloqueado por un dato externo.

## P0 · Estabilidad

| Tarea | Estado | Evidencia |
| --- | --- | --- |
| Auditoría del workspace, git y recuperación | ✅ | Rama `interfaz-2.0`, etiqueta `punto-recuperacion-2.0` |
| Línea base (typecheck, lint, build) antes de tocar nada | ✅ | 27 páginas + 404, sin errores |
| Recepción de cotizaciones intacta (folio, idempotencia, anti-spam, Resend, WhatsApp) | ✅ | e2e en modo de prueba: envío, folio, acuse, rechazos, fallas del servidor |
| Hidratación sin diferencias tras el rediseño | ✅ | `check:hydration`: 66 rutas × 2 anchos sin avisos |
| Ningún flujo comercial roto: URL anteriores y parámetros del cotizador | ✅ | `?tipo=`, `?servicio=`, `?necesidad=`, `?sector=` (redirige a la página del sector), 308 de URL antiguas |

## P1 · Experiencia estructural

| Tarea | Estado | Notas |
| --- | --- | --- |
| Benchmark de DNSIT con evidencia y mediciones | ✅ | `BENCHMARK_DNSIT_INTERFAZ.md` (interno, fuera de git) |
| Clasificación de servicios A/B/C con fuentes | ✅ | `ARQUITECTURA_INTERFAZ.md` |
| 15 servicios con página propia y contenido propio (qué resuelve, alcance, opciones técnicas, proceso, industrias, preguntas, marcas, cotización contextual, complementarios) | ✅ | Nuevo: **Control de asistencia**; **Energía y respaldo** suma plantas de luz (vía Interfaz de Monterrey) |
| Páginas por industria (5) con necesidades, soluciones, consideraciones técnicas, implementación, preguntas y asesoría con el sector preseleccionado | ✅ | Salud y hotelería no se publicaron (sin evidencia) |
| Header fijo que se compacta sin mover el contenido; mega menú con vista previa; CTA de cotización también en móvil | ✅ | Pruebas de ancho 320–2560 px sin desbordes |
| Experiencia móvil | ✅ | Sin botón flotante en móvil; selector de idioma en el menú; títulos y pasos ajustados |

## P2 · Diferenciación

| Tarea | Estado | Notas |
| --- | --- | --- |
| Hero nuevo con coreografía de entrada (CSS, antes del JavaScript) | ✅ | Foto a sangre + foto real del equipo + índice de frentes técnicos |
| Sistema de movimiento (entrada, transición de páginas, mega menú, explorador, microinteracciones, diagrama de flujo, topología) | ✅ | Todo respeta «reducir movimiento»; animaciones continuas sólo en pantalla |
| Cuatro idiomas con rutas propias, selector, preferencia guardada y sugerencia sin redirección | 🟡 | Falta **revisión lingüística** de inglés, coreano y chino (hoy con `noindex`) |
| Formularios, validaciones, errores del servidor y acuse por correo en el idioma del cliente | 🟡 | Ídem |
| Explorador de soluciones (6 preguntas, sugerencias orientativas, resumen al cotizador) | ✅ | Probado de punta a punta, incluido el resumen en español que recibe ventas |
| Cotizador: cargo, idioma, resumen del explorador, borrador por pestaña, estados visibles, sin conexión | ✅ | e2e |
| Portafolio con estados editoriales, filtros por solución e industria, galería y antes/después | 🟡 | Componentes listos; faltan **proyectos autorizados y fotos reales** |

## P3 · Ampliación

| Tarea | Estado | Notas |
| --- | --- | --- |
| Centro técnico con flujo editorial (borrador → revisión → publicado) y Markdown | 🟡 | 5 borradores escritos; falta **revisión técnica** para publicarlos |
| Arquitectura de eventos sin datos personales (dataLayer / GA4) | ✅ | Sin scripts de terceros mientras no haya `VITE_GA_ID` |
| Preparación SEO (hreflang, canonical, noindex, sitemap multilingüe) | ✅ | Plan en `SEO_FASE_SIGUIENTE.md` |

## Pruebas (última corrida)

Se registran en `AUDITORIA_FINAL_INTERFAZ.md` (sección «Interfaz 2.0»), con el detalle de cada comprobación.

## Decisiones que requieren a la empresa

| Decisión o dato | Por qué importa |
| --- | --- |
| Aprobar la publicación de la rama `interfaz-2.0` | No se ha subido ni desplegado nada |
| Revisión lingüística de en / ko / zh-CN | Para indexar esos idiomas (`reviewed: true`) |
| Revisión técnica de los 5 artículos | Para publicar el centro técnico |
| Proyectos autorizados (nombre, ubicación general, fotos, alcance, resultados) | Para que el portafolio deje de ser demostrativo |
| Confirmar servicios de la lista B (monitoreo, centros de datos, analítica de video, videoconferencia) | Ampliar el catálogo sin afirmar capacidades no respaldadas |
| Redacción con «usted» o «tú» en titulares | Hoy los titulares usan «tú» (como pidió el brief: «Cuéntanos qué necesita tu infraestructura») y el resto del sitio, «usted» |
| Logotipo en vector o PNG ≥ 800 px | En pantallas de alta densidad el logotipo actual (171 px) se ve suave |
| Fotografía real de fibra, CCTV, acceso, WiFi e industrias | Hoy son renders marcados «Imagen de referencia» |
| Plantas de luz: confirmar redacción «a través de Interfaz de Monterrey» | Se tomó de interfaz.com.mx; conviene que ventas lo valide |

## Credenciales y servicios externos

Nada nuevo es necesario para lo construido. Siguen pendientes (de antes): WhatsApp Cloud API (token, número y plantilla
aprobada) para el aviso automático por WhatsApp. Opcionales: `VITE_GA_ID` (GA4) y `VITE_BORRADORES=1` sólo en Preview.
