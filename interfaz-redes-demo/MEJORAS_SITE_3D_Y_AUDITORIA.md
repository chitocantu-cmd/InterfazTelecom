# Mejora del apartado 3D y auditoría global (Interfaz 3.1)

Rama: `interfaz-3.1`. Nada de esto está publicado: la publicación a producción (fusión con `main`) espera autorización.

El trabajo se hizo en dos vueltas: la primera reconstruyó la escena 3D y quitó las leyendas de imagen; la segunda
(después de una nueva revisión) llevó la escena a un acabado fotográfico, rediseñó «Tipos de proyecto que ejecutamos»
y quitó también los rótulos de «caso demostrativo».

## 1. Apartado «Un site de telecomunicaciones, pieza por pieza»

### Qué se ve

**Escena (three.js: `src/three/rackScene.ts`, `src/three/rackKit.ts`, `src/three/lensPasses.ts`)**

- **Un cuarto de telecomunicaciones completo, no un rack flotando:**
  - fila de cinco racks de 42U rotulados R-01 a R-05: el central (R-03) abierto, que es el que se inspecciona, y los vecinos con puerta perforada;
  - organizadores verticales con su haz de cables y cinchos;
  - escalerilla con dos haces de cobre, canaleta de fibra, bajadas a cada organizador y varillas roscadas al plafón;
  - tierra física (conductor verde) del rack a la barra de tierra del muro;
  - piso técnico con losetas perforadas en el pasillo frío, muro, plafón y luminarias lineales.
- **Materiales con relieve real:**
  - cada frente (patch panels, switches, bandejas de fibra, NVR, UPS, tapas ventiladas, rieles) lleva un mapa de relieve calculado de su propio dibujo: los puertos, ventilas y ranuras se hunden; etiquetas y tornillos sobresalen;
  - la pintura electrostática de los gabinetes tiene microtextura (piel de naranja apenas visible y brillo que varía), como la real;
  - acero galvanizado, cobre, plástico y botas con su propio acabado.
- **Cableado documentado:** cordones con curvatura y botas en cada conector, uno de cada siete en blanco y una etiqueta de identificación en cada cordón junto al patch panel.
- **Luz:**
  - cenital fría de luminarias con sombras suaves (calculadas una vez: la escena es estática), relleno bajo y un contraluz azul que separa los racks del fondo;
  - reflejos de un entorno hecho a la medida del cuarto: las luminarias lineales se reflejan en metal, pantallas y frentes, en el mismo lugar donde están;
  - brillo sólo en lo que emite luz (LED, pantallas, luminarias); se suavizaron los halos de las marcas y del marco de enfoque.
- **Lente:**
  - profundidad de campo con la profundidad real de la escena: al inspeccionar una pieza, lo que está más cerca o más lejos se desenfoca como en una fotografía; en la vista general, apenas;
  - viñeta óptica y grano fino sobre la imagen final.
- **Composición:** el escenario va a todo el ancho de la pantalla (hasta 1600 px) y más alto en escritorio; la lista y la ficha se alinean con la retícula del contenido. Al entrar en pantalla, la cámara llega a la vista general desde un plano abierto (2.6 s).

### Interacción

| Acción | Qué pasa |
|---|---|
| Pasar el mouse sobre una pieza | Esquinas tenues alrededor de la pieza, la marca numerada se ilumina y el cursor cambia a mano. |
| Elegir una pieza (clic en la escena, en la marca o en la lista) | La cámara viaja (1.3 s) a una vista pensada para esa pieza y el foco se va a ella. Aparecen un marco con su nombre y una viñeta. La ficha cambia: descripción, «En la escena» (lo que se ve en el modelo: 1U · 24 puertos Cat6A · cordones etiquetados, etc.) y servicios de Interfaz relacionados. |
| Elegir otra vez la misma pieza | Vuelve a la vista general. |
| «Restablecer vista» | Regreso suave a la vista general; quita foco, marco y viñeta. Desactivado mientras se está en la vista general. |
| Arrastrar | Gira la cámara dentro de un rango corto (sin navegación libre ni zoom con la rueda). |
| Reposo | La cámara «respira» de forma casi imperceptible; algunos LED parpadean. |

- La ficha «En la escena» describe el equipo modelado (puertos, U, adaptadores), no una especificación de proyecto ni capacidades de la empresa. Está en los cuatro idiomas.
- **Accesibilidad:** la lista es el control principal, con teclado y lector de pantalla (`aria-pressed`); la ficha se anuncia (`aria-live`); el lienzo tiene descripción. Las marcas y marcos son decorativos.
- **Teléfono y tableta:** lista y ficha debajo del escenario; en teléfono la lista va a dos columnas para que la imagen siga a la vista.

### ¿3D real o 2.5D?

**Las dos, según el equipo:**

- **3D real (WebGL)** en escritorio con puntero fino, pantalla ≥ 1024 px, sin «reducir movimiento» y con un equipo que no sea modesto. Se descarga sólo al acercarse a la sección y se detiene fuera de pantalla.
- **Vistas fijas de la misma escena** (`src/assets/img/site3d/`) en teléfonos, tabletas, equipos modestos, navegadores sin WebGL y con «reducir movimiento»:
  - 8 imágenes renderizadas de la escena real (vista general y una por pieza), con desenfoque, esquinas del marco y viñeta;
  - al elegir una pieza la imagen cambia con una transición suave; lista, ficha y servicios funcionan igual;
  - de 5 a 66 KB cada una, con versiones de 400/640/1024/1320 px. Se regeneran con `node tools/site3d-stills.mjs <url>` y `python tools/variantes.py`.

### Rendimiento (GPU real: Intel UHD en Windows, compilación de producción)

| | Inicio de 3.1 | Primera vuelta | Ahora |
|---|---|---|---|
| Bloqueo al generar el entorno de reflejos | 442 ms | 0 | 0 (ninguna llamada de WebGL pasa de 16 ms) |
| Primer cuadro | ~140 ms | 10 ms | ~15 ms |
| Tarea más larga del armado | 531 ms | ~80 ms | ~88 ms |
| Movimientos de cámara | — | — | mediana 17 ms por cuadro (60 cps); en esta GPU integrada parte de los cuadros va a 30 cps |

- **Sin bloqueos en Windows.** El proceso de la GPU sigue creando los shaders después de que la compilación en paralelo se da por terminada; la primera consulta síncrona que llega mientras tanto congela la página. Solución, documentada en el código: compilar en paralelo, esperar sin bloquear a una señal (fence) de la GPU y usar cada programa por primera vez, uno por turno, en un destino de 1 × 1 px (escena, sombras, entorno y cada pase del postproceso).
- **Texturas por pasos.** El relieve y la pintura se generan antes de armar los racks, cada uno en su propio paso. La perforación de las tapas se dibuja como patrón y la microtextura, con ruido escalado (antes eran miles de figuras; la tarea más larga bajó de 165 a 88 ms).
- **Costo de la lente.** Comparado sin profundidad de campo, cuesta unos 6 cuadros de cada 70 durante un movimiento de cámara en esta GPU; los píxeles enfocados no hacen trabajo extra. En reposo la escena va estable.
- El módulo 3D (three.js y la escena) pesa 154 KB comprimido y sólo se descarga en escritorio, al acercarse a la sección.

## 2. Leyendas fuera de la interfaz

Se quitaron de toda la interfaz visible, en los cuatro idiomas:

- **Escena 3D:** «Representación ilustrativa: no corresponde a un proyecto ni a equipos de un fabricante específico».
- **«Imagen de referencia»** sobre las imágenes: portada, recorrido, escenario de soluciones, sección de campo, encabezados de páginas interiores, fichas de servicio e industria y proyectos (incluida «Imagen de referencia, no corresponde a este caso»).
- **«Caso demostrativo» / «Casos demostrativos»:** en la línea de datos de cada proyecto, en la nota de la página de proyectos, en el texto de la sección de la portada, en el dato «Estado» del detalle y al inicio de las descripciones para buscadores.
- **Avisos similares:** el del pie de página («Las visualizaciones 3D del sitio son imágenes de referencia…»), el de industrias («no corresponde a proyectos de clientes específicos») y la nota final del recorrido. En el diagrama de red se quitó «Diagrama de referencia» y queda «Cada red se diseña según el levantamiento en sitio».

**Cómo se mantiene la veracidad sin leyendas:**

- Los proyectos se presentan como lo que son: **tipos de proyecto** («Tipos de proyecto que ejecutamos»), con el problema, el alcance y las tecnologías de cada tipo de intervención.
- No muestran cliente, ubicación, fecha, resultados ni galería; el recuadro «Resultados… cuando el caso esté autorizado» se quitó y «Servicios implementados» pasó a «Servicios que intervienen».
- Siguen sin indexarse en buscadores y fuera del sitemap. Sólo un proyecto con estado «autorizado» (real, con permiso del cliente) mostraría cliente, datos y resultados.

**Aclaración interna (no se publica):**

- Las imágenes con `ref: true` en `src/data/media.ts` son visualizaciones generadas (renders), no fotografías de obras de Interfaz. No deben usarse como evidencia de proyectos.
- Los proyectos con estado «demostrativo» (`src/data/content.ts`) describen tipos de intervención, no proyectos de un cliente.
- Las fotografías reales del equipo están en «Nuestro equipo en campo».

Se mantienen, porque no son leyendas de imagen sino información útil o necesaria: «Marcas que integramos… no representa alianza, certificación ni distribución oficial» y el aviso del explorador («orientación inicial, no un diagnóstico»).

## 3. Revisión del sitio: hallazgos y correcciones

**Revisión:** todas las páginas a 1440 y 390 px (capturas completas), consola en cada ruta, desbordes horizontales (ninguno), hidratación (63 rutas × 2 anchos) y pruebas de navegador.

| Hallazgo | Corrección |
|---|---|
| «Tipos de proyecto que ejecutamos»: al pasar el mouse sobre cada título aparecía una imagen flotante encima del texto | Índice editorial: cada proyecto con su imagen fija en su marco, retícula asimétrica (7/5, 5/7) en escritorio, número, título y sector. Al pasar el mouse la imagen sólo se acerca un poco dentro de su marco y el título cambia de color; nada flota encima. |
| La escena 3D congelaba la página hasta medio segundo al cargarse en Windows | Ver «Rendimiento» |
| Entre 900 y 1023 px la escena 3D se corría a la derecha aunque la lista no estuviera encima | El encuadre se corre sólo cuando la lista va sobre la escena (≥ 1024 px) |
| En el teléfono, «Restablecer vista» se partía en dos líneas y al elegir una pieza la imagen quedaba fuera de pantalla | Botón en una línea; lista a dos columnas |
| Sin 3D, la sección mostraba la misma foto para todos los componentes | Vistas fijas por componente, renderizadas de la escena real |
| Página 404 con sólo dos botones | Ahora también lleva a cada frente técnico (con su descripción) y a WhatsApp |
| Mezcla de «tú» y «usted» dentro de un mismo bloque (portada, explorador, cierre) | Portada, menú de soluciones y explorador unificados en «tú», la voz de los títulos dictados en los briefs |
| Centro técnico: nueve filtros, todos en «0» | Los filtros sólo aparecen cuando hay artículos y sólo con categorías que tienen alguno |
| Descripción para buscadores de «WiFi empresarial» demasiado corta | Nueva descripción de 146 caracteres |

**Sin cambios y verificado:** navegación y menú, cotizador y recepción de cotizaciones (sin cambios en el backend ni en destinatarios), idiomas y rutas, formularios, responsive. Consola limpia (los únicos 404 en local son la consulta a `/api/cotizacion`, que en local no existe y en Vercel sí).

## 4. Verificación

- `npm run typecheck`: sin errores.
- `npm run lint`: sin errores (34 avisos de aserciones `!`, el mismo estilo que ya usaba el proyecto en el código de canvas).
- `npm run build`: 140 páginas prerenderizadas + 404, sitemap y robots, sin avisos de descripciones.
- `npm run check:hydration`: sin avisos.
- `npx playwright test` (escritorio y móvil): 201 pasan, 0 fallan (29 omitidas por diseño: sólo aplican a un ancho o al sitio publicado). Las pruebas que recorren muchas páginas seguidas (el header en 5 anchos y los desbordes en 6 anchos) quedaron marcadas como lentas: solas pasan en 10–18 s, pero con toda la suite en paralelo rebasaban el límite de 30 s.
  - el sitio no muestra «imagen de referencia», «representación ilustrativa» ni «caso demostrativo» (portada, servicio, proyectos, detalle de proyecto, industrias);
  - el detalle de un tipo de proyecto no muestra cliente, estado ni resultados y sigue sin indexarse;
  - sección 3D: vista general inicial, elección, imagen fija por componente sin 3D y restablecer.

## 5. Pendiente

- **Publicar** (fusión de `interfaz-3.1` con `main`): requiere autorización.
- **Decisión global tú/usted** (pendiente con la empresa desde 2.0). Portada y explorador ya están en «tú»; cotizador, contacto, servicios, nosotros, aviso de privacidad y 404 siguen en «usted». Unificar es un cambio de textos acotado (`src/i18n/messages/es.ts`).
- **Fotografías reales de proyectos** (con permiso del cliente) para publicar proyectos «autorizados» con cliente, datos y resultados, y para sustituir los renders de proyectos e industrias.
- **Revisión lingüística** de inglés, coreano y chino (siguen sin indexar), incluidas las fichas «En la escena».
- **Guías del centro técnico:** revisión por ingeniería antes de publicarse.
- **Longitud de la portada en teléfono** (unas 24 pantallas): si se busca una portada más corta, el recorrido de cuatro capítulos es el primer candidato a condensar.
