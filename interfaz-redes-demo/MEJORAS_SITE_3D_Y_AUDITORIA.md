# Mejora del apartado 3D y auditoría global (Interfaz 3.1)

Rama: `interfaz-3.1`. Nada de esto está publicado: la publicación a producción (fusión con `main`) espera autorización.

## 1. Apartado «Un site de telecomunicaciones, pieza por pieza»

### Qué se mejoró

**Escena (three.js, `src/three/rackScene.ts` y `src/three/rackKit.ts`, reescritos)**

- **Materiales físicos (PBR)** en lugar del sombreado plano anterior:
  - pintura electrostática mate en los racks; acero galvanizado en rieles y escalerilla; cobre en la barra de tierra; plástico en botas y conectores;
  - reflejos suaves de un entorno de estudio (PMREM de 128 px).
- **Luz creíble**:
  - cenital fría de luminarias lineales con sombras suaves calculadas una sola vez (la escena es estática);
  - relleno bajo y un contraluz azul que separa los racks del fondo;
  - brillo (bloom) sólo para lo que emite luz: LED, pantallas, luminarias. Sin luces de colores ni brillos artificiales.
- **Un cuarto de telecomunicaciones completo, no un rack flotando**:
  - piso técnico con losetas perforadas en el pasillo frío, muro, plafón y luminarias;
  - fila de cinco racks: el central abierto, que es el que se inspecciona, y los vecinos con puerta perforada;
  - organizadores verticales con su haz de cables;
  - escalerilla con dos mazos de cable;
  - canaleta de fibra amarilla (como las reales, en un tono menos saturado);
  - bajadas a cada organizador, varillas roscadas al plafón y barra de tierra en el muro.
- **Cableado definido**:
  - patch cords como tubos con curvatura y botas en cada conector; uno de cada siete en blanco, como en un rack real;
  - nada de cables «de caricatura».
- **Composición**:
  - cámara de 30°, encuadre bajo y niebla de profundidad;
  - en escritorio, el encuadre se corre a la derecha para dejar sitio a la lista.

**Interacción**

| Acción | Qué pasa |
|---|---|
| Elegir un componente (lista o marca numerada) | La cámara viaja suavemente (1.3 s) a una vista pensada para esa pieza. Aparecen un marco de esquinas con su nombre y una viñeta que oscurece el resto. Se resaltan la marca y el elemento de la lista. La ficha cambia con su descripción y los servicios de Interfaz relacionados. |
| Elegir otra vez el mismo componente | Vuelve a la vista general (el botón de la lista funciona como interruptor). |
| «Restablecer vista» | Regreso suave a la vista inicial; quita enfoque, marco y viñeta. Desactivado mientras se está en la vista general. |
| Arrastrar | Gira la cámara dentro de un rango corto (sin navegación libre ni zoom con la rueda: la página sigue desplazándose). |
| Reposo | La cámara «respira» de forma casi imperceptible; algunos LED parpadean. |

- La vista general tiene su propia ficha («Vista general») con los servicios de racks, cableado y fibra.
- **Accesibilidad**:
  - la lista es el control principal, usable con teclado y lector de pantalla (`aria-pressed`);
  - la ficha se anuncia (`aria-live`);
  - el lienzo tiene descripción.
- **Diseño**:
  - en escritorio, lista y ficha flotan sobre la escena como paneles translúcidos;
  - en teléfono y tableta van debajo. En teléfono, la lista va a dos columnas para que la imagen siga a la vista mientras se elige.

### ¿3D real o 2.5D?

**Las dos, según el equipo:**

- **3D real (WebGL)** en escritorio con puntero fino, pantalla ≥ 1024 px, sin «reducir movimiento» y con un equipo que no sea modesto.
  - Se descarga sólo al acercarse a la sección (no pesa en la carga inicial).
  - Se detiene fuera de pantalla.
- **Vistas fijas de la misma escena** (`src/assets/img/site3d/`) en teléfonos, tabletas, equipos modestos, navegadores sin WebGL y con «reducir movimiento»:
  - son 8 imágenes renderizadas desde la escena real: la vista general y una por componente, con las esquinas del marco y la viñeta;
  - al elegir un componente, la imagen cambia con una transición suave; lista, ficha y servicios funcionan igual;
  - cada imagen pesa de 6 a 84 KB según el tamaño, con versiones de 400/640/1024/1320 px.
  - Se regeneran con `node tools/site3d-stills.mjs <url>` y `python tools/variantes.py`.

### Rendimiento (medido con la GPU real, Intel UHD en Windows, compilación de producción)

| | Primera versión 3.1 | Ahora |
|---|---|---|
| Bloqueo al generar el entorno de reflejos | 442 ms | 0 (ninguna llamada de WebGL pasa de 16 ms) |
| Primer cuadro | ~140 ms | 10 ms |
| Tarea más larga del armado | 531 ms | ~80 ms |

**Causa.** En Windows (ANGLE/Direct3D), el proceso de la GPU sigue creando los shaders después de que la compilación en paralelo se da por terminada. La primera consulta síncrona que llega mientras tanto congela la página.

**Solución** (documentada en el código):

1. Compilar en paralelo.
2. Esperar sin bloquear a una señal (fence) de la GPU.
3. Usar cada programa por primera vez, uno por turno, en un destino de 1 × 1 px. Se hace con la escena, con las sombras, con el entorno y con cada pase del postproceso.

## 2. Leyendas de «imagen de referencia»

Se quitaron de toda la interfaz visible, en los cuatro idiomas:

- **Escena 3D:** «Representación ilustrativa: no corresponde a un proyecto ni a equipos de un fabricante específico».
- **Etiquetas «Imagen de referencia» sobre las imágenes:**
  - portada y recorrido;
  - escenario de soluciones y sección de campo;
  - encabezados de páginas interiores;
  - fichas de servicio e industria;
  - proyectos (incluida «Imagen de referencia, no corresponde a este caso»).
- **Pie de página:** «Las visualizaciones 3D del sitio son imágenes de referencia…».
- **Notas del recorrido y del diagrama de red:** se quitó «Imágenes de referencia» y «Diagrama de referencia». Se conserva lo útil: «Las anotaciones señalan componentes típicos de cada solución» y «Cada red se diseña según el levantamiento en sitio».

**Aclaración interna (no se publica).**

- Las imágenes marcadas con `ref: true` en `src/data/media.ts` son visualizaciones generadas (renders), no fotografías de obras de Interfaz.
- No deben usarse como evidencia de proyectos.
- Las fotografías reales del equipo están en «Nuestro equipo en campo».

Se mantienen, porque no son leyendas de imagen sino veracidad del contenido:

- la etiqueta «Caso demostrativo» y la nota de la página de proyectos;
- la aclaración de industrias («no corresponde a proyectos de clientes específicos»);
- «Marcas que integramos… no representa alianza»;
- el aviso del explorador («orientación inicial, no un diagnóstico»).

## 3. Auditoría global: hallazgos y correcciones

**Revisión:**

- todas las páginas a 1440 y 390 px (capturas completas), en español;
- consola en cada ruta;
- desbordes horizontales (ninguno);
- hidratación (63 rutas × 2 anchos, sin avisos);
- pruebas de navegador.

| Hallazgo | Corrección |
|---|---|
| La escena 3D congelaba la página hasta medio segundo al cargarse en Windows | Ver «Rendimiento» |
| En el teléfono, «Restablecer vista» se partía en dos líneas sobre la imagen | Botón en una línea; la indicación «Arrastra para girar» sólo aparece cuando hay 3D |
| En el teléfono, al elegir un componente al final de la lista, la imagen quedaba fuera de pantalla | Lista a dos columnas en teléfono |
| Sin 3D, la sección mostraba la misma foto para todos los componentes | Vistas fijas por componente, renderizadas de la escena real |
| Las vistas de patch panel, switch y organizadores se parecían demasiado sin el marco | Las vistas fijas conservan las esquinas del marco (sin texto, sirven en cualquier idioma) |
| Mezcla de «tú» y «usted» dentro de un mismo bloque: «Hablemos de **tu** próximo proyecto» + «Cuént**enos**…»; el explorador con título en tú y preguntas en usted; la portada con título en tú y «¿No **sabe** por dónde empezar?» | Portada, menú de soluciones y explorador unificados en «tú», que es la voz de los títulos dictados en los briefs |
| Centro técnico: nueve filtros, todos en «0», encima del aviso de que aún no hay guías | Los filtros sólo aparecen cuando hay artículos y sólo con las categorías que tienen alguno |
| Descripción para buscadores de «WiFi empresarial» demasiado corta (104 caracteres) | Nueva descripción de 146 caracteres |
| Canaleta de fibra en amarillo muy saturado | Tono más sobrio y acabado mate |

**Sin problemas:**

- navegación y menú;
- cotizador y recepción de cotizaciones (sin cambios en el backend ni en destinatarios);
- idiomas y rutas;
- formularios;
- consola limpia (los únicos 404 en local son la consulta a `/api/cotizacion`, que en local no existe y en Vercel sí).

## 4. Verificación

- `npm run typecheck`: sin errores.
- `npm run lint`: sin errores. Los 27 avisos son anteriores: aserciones `!`.
- `npm run build`: 140 páginas prerenderizadas + 404, sitemap y robots.
- `npm run check:hydration`: sin avisos.
- `npx playwright test`: 201 pruebas pasan en escritorio y móvil (29 omitidas por diseño: sólo aplican a un ancho o al sitio publicado).
  - «el header cabe en laptops» (20 cargas de página) agotaba los 30 s con toda la suite en paralelo; sola pasa en 10 s. Ahora está marcada como lenta.
  - Prueba nueva: el sitio no muestra leyendas de «imagen de referencia».
  - Prueba ampliada de la sección 3D: vista general inicial, elección, imagen fija por componente sin 3D y restablecer.

## 5. Pendiente

- **Publicar** (fusión de `interfaz-3.1` con `main`): requiere autorización.
- **Decisión global tú/usted** (pendiente con la empresa desde 2.0).
  - Portada y explorador ya están en «tú».
  - Cotizador, contacto, servicios, nosotros, aviso de privacidad y 404 siguen en «usted».
  - Si se elige una sola voz, es un cambio de textos acotado (`src/i18n/messages/es.ts`).
- **Fotografías reales de proyectos** para sustituir los renders de proyectos e industrias.
- **Revisión lingüística** de inglés, coreano y chino (siguen sin indexar).
- **Guías del centro técnico:** revisión por ingeniería antes de publicarse.
- **Longitud de la portada en teléfono** (unas 24 pantallas): si se busca una portada más corta, el recorrido de cuatro capítulos es el primer candidato a condensar.
