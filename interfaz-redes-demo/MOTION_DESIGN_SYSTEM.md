# Sistema de movimiento · Interfaz 3.0

Cómo se mueve el sitio, con qué herramientas, y cómo agregar o cambiar una animación sin romper la carga, la
accesibilidad ni el cotizador.

## Principios

1. **El contenido no depende del movimiento.** Todo texto, enlace y botón está en el HTML prerenderizado y funciona
   sin JavaScript. La animación sólo lo presenta: nada se oculta en el HTML esperando a que una animación lo muestre
   (las entradas «armadas» se aplican después de hidratar y sólo a lo que está debajo de la pantalla).
2. **Nunca bloquea.** No hay pantalla de carga. Los botones del hero son clicables desde el primer cuadro.
3. **Tres niveles de experiencia** (`src/motion/experience.ts`, `useExperience()`):

   | Nivel | Cuándo | Qué se ve |
   | --- | --- | --- |
   | `full` | ≥ 1024 px, mouse, ≥ 4 núcleos, ≥ 4 GB, sin ahorro de datos | Recorrido fijo con GSAP, escena 3D, parallax, botones magnéticos, vista previa de proyectos |
   | `lite` | Teléfono, tableta, equipo modesto o ahorro de datos | Las mismas secciones con fotografía y CSS: capítulos apilados, rack en foto, sin parallax |
   | `reduced` | «Reducir movimiento» del sistema | Como `lite`, sin desplazamientos ni cámara; transiciones casi instantáneas |

   Para revisar cada nivel: `?experiencia=full`, `?experiencia=lite` o `?experiencia=reduced` en la dirección.
   Sin WebGL, la escena 3D queda en su versión fotográfica; si el contexto WebGL se pierde, también.
4. **Una sola fuente de tokens.** Duraciones, curvas y escalonado en `src/motion/tokens.ts`; `src/index.css` repite los
   mismos valores como variables (`--ease-*`, `--dur-*`). No se inventan curvas por componente.
5. **Sin secuestrar el desplazamiento.** No hay smooth-scroll artificial (Lenis no se usó: rompería el «buscar en la
   página», las anclas y el desplazamiento del teclado). El recorrido usa `position: sticky` y la rueda del mouse nunca
   se captura (la escena 3D gira sólo al arrastrar).

## Bibliotecas y por qué

| Herramienta | Uso | Carga |
| --- | --- | --- |
| CSS (keyframes, transiciones, `clip-path`) | Hero, titulares, entradas al desplazarse, máscaras de imagen, paneles, transición de páginas | Siempre (en el CSS) |
| Motion (`motion/react`) | Mega menú, menú móvil, componentes que ya lo usaban (cotizador, explorador) | Ya existía; funciones cargadas aparte |
| GSAP 3.15 + ScrollTrigger | Línea de tiempo del recorrido «De la conexión a la operación» atada al desplazamiento | `journey-motion.ts`, sólo en `full` (≈ 46 KB gzip) |
| three.js 0.186 | Escena «Explora una instalación» (rack, escalerilla, canaleta, cableado) | `three/rackScene.ts`, sólo en `full` con WebGL y al acercarse a la sección (≈ 144 KB gzip) |
| Canvas 2D | Conexiones que convergen en la escena final | En el paquete de la página; dibuja sólo en pantalla |

No se usaron React Three Fiber ni Drei: la escena es una sola, imperativa, con ciclo de vida propio (dibujo bajo
demanda, liberación de memoria) y la librería de piezas ya existía en `tools/renders/lib.js`. Tampoco se añadieron
Rive ni Lottie (no hubo animaciones que lo justificaran). GSAP usa su licencia estándar sin costo; no se usan
plugins de pago ni servicios externos.

## Tokens (`src/motion/tokens.ts`)

| Token | Valor | Uso |
| --- | --- | --- |
| `DURATION.micro` | 0.16 s | hover, foco, presionar |
| `DURATION.base` | 0.24 s | cambios de estado (abrir, cambiar de pestaña) |
| `DURATION.editorial` | 0.7 s | entradas de texto e imagen |
| `DURATION.cinematic` | 1.2 s | apertura del hero, cambios de capítulo, máscaras grandes |
| `EASE.out` / `--ease-out` | cubic-bezier(0.2, 0.7, 0.2, 1) | microinteracciones |
| `EASE.emph` / `--ease-emph` | cubic-bezier(0.16, 1, 0.3, 1) (= `expo.out` en GSAP) | entradas editoriales y cinematográficas |
| `EASE.inOut` / `--ease-inout` | cubic-bezier(0.65, 0, 0.35, 1) (= `power2.inOut`) | cámara y cambios de escena |
| `STAGGER.words` | 55 ms | titulares palabra por palabra |
| `STAGGER.items` | 80 ms | listas y grupos |

Sólo se animan `transform`, `opacity` y `clip-path` (y `flex-grow` en los paneles de industrias).

## Componentes y utilidades (`src/motion/`)

| Pieza | Qué hace | Dónde se usa |
| --- | --- | --- |
| `SplitWords` | Titular palabra por palabra desde detrás de una máscara. Divide sólo por espacios: el coreano conserva palabras; el chino entra como un bloque (nunca carácter por carácter). `mode="load"` corre al cargar (CSS); `mode="view"` al entrar en pantalla | Hero, títulos de sección, páginas interiores |
| `useReveal` | Arma `[data-reveal="rise" \| "mask" \| "line" \| "words"]` debajo de la pantalla y les pone `.is-in` al verse | Secciones de la portada, escena final |
| `CoverBox` + `Callout` | Caja con la proporción de la foto que la cubre como `object-fit: cover`; las anotaciones van en coordenadas de la foto (0–1) y siempre señalan el mismo punto | Hero, recorrido |
| `useCursorParallax` | Escribe `--mx/--my` (−1…1) una vez por cuadro; las capas `.hero3-depth` y `.hero3-fore` se mueven con profundidad distinta | Hero (sólo `full`) |
| `useMagnetic` | El botón se inclina unos píxeles hacia el cursor (sólo `full`, nunca en formularios) | CTA del hero y de la escena final |
| `useConvergence` | Canvas de conexiones que convergen con pulsos; se detiene fuera de pantalla | Escena final (`FinalCTA`) |

## Escenas

### Hero (`components/home/Hero.tsx`)
Coreografía en CSS (corre con el HTML prerenderizado): header y logotipo (0–500 ms) → la escena se abre como una
compuerta `.hero3-scene` (`clip-path`, 120–1620 ms) y la cámara se asienta `.hero3-zoom` → titular palabra por palabra
(desde 280 ms) → texto y botones (620–820 ms) → índice de capítulos (1150 ms) → anotaciones (1500–2000 ms). En el
teléfono se usa un recorte vertical de la foto (`aisleTall`), precargado igual que la horizontal en escritorio.

### Recorrido (`Journey.tsx` + `journey-motion.ts`)
Cuatro capítulos (`src/data/journey.ts`: foto, encuadre, anotaciones y servicios; textos en los diccionarios).
En `full`, la sección recibe `.journey-stage`: la pista mide 85 vh por capítulo + una pantalla y `.journey-sticky`
queda fijo con `position: sticky` (no se usa el «pin» de GSAP, que movería nodos administrados por React). La línea de
tiempo (scrub 0.7) avanza la cámara sobre cada foto, abre el capítulo siguiente con una máscara desde abajo y, en el
último, aleja la cámara y dibuja la red sobre la fachada. Textos, anotaciones e índice cambian con clases (CSS), no
cuadro por cuadro. Cada capítulo publica su posición (`data-scroll-to`) para que los enlaces del hero y del índice
lleguen al punto exacto. En los demás niveles los capítulos se apilan (foto, leyenda numerada en el teléfono, texto).

### Explorador de soluciones (`ServicesStage.tsx`)
Pestañas accesibles (clic, flechas, Inicio/Fin; con mouse también al pasar con 140 ms de pausa). La foto nueva entra
con `clip-path` sobre la anterior (`.sv-layer.is-current` / `.is-prev`), el titular por palabras y el CTA cotiza ese
servicio (`/contacto?servicio=…`). En el teléfono sólo se descargan la foto activa y la anterior.

### Explora una instalación (`RackExplorer.tsx` + `three/`)
La lista de componentes es el control accesible; la escena 3D acompaña. `three/rackKit.ts` adapta las piezas de
`tools/renders/lib.js` (texturas procedurales sin marcas ni especificaciones escritas, cordones unidos en una
geometría por rack). `three/rackScene.ts`: dibujo bajo demanda (sólo mientras se mueve la cámara, se arrastra o cambia
un LED; nunca fuera de pantalla ni con la pestaña oculta), DPR ≤ 1.75, órbita limitada al arrastrar, enfoque y
resaltado por componente, marcas numeradas que no se amontonan, y `dispose()` que libera geometrías, texturas y el
contexto WebGL al salir.

### Industrias, proyectos y escena final (`Sections.tsx`)
Paneles que se expanden (`flex-grow`; en el teléfono, acordeón), lista editorial de proyectos con vista previa que
sigue al cursor (`full`), y la escena final con conexiones que convergen en el llamado a la acción. `FinalCTA` es la
misma en la portada, Soluciones, Industrias, Proyectos y Nosotros.

### Transición entre páginas (`index.css`, `App.tsx`)
Al navegar (no al abrir el sitio) la página nueva sube y se descubre con una máscara (0.55 s); header y logotipo no se
mueven. Mientras se descarga una página, una línea recorre el borde del header (`.route-progress`). Atrás, adelante,
recargar y enlaces directos funcionan igual; el foco pasa al contenido.

## Reglas para agregar una animación

1. ¿Ayuda a entender o a decidir? Si sólo decora, no va.
2. Usar los tokens; si hace falta una curva nueva, agregarla a `tokens.ts` y a `index.css`.
3. Animar sólo `transform`, `opacity` o `clip-path`. Nada de `top/left/width` en bucle.
4. El estado final debe estar en el HTML (o aplicarse sin JavaScript). Si se oculta algo para animarlo, hacerlo
   después de hidratar y sólo fuera de pantalla (`useReveal`).
5. Animaciones continuas: sólo en pantalla (IntersectionObserver) y pausadas con la pestaña oculta.
6. GSAP: siempre dentro de `gsap.context()` y devolver `ctx.revert()` en la limpieza. Cargarlo con `import()`.
7. Respetar los tres niveles: probar con `?experiencia=lite` y `?experiencia=reduced`.
8. Texto que se anima, traducible: viene de los diccionarios, nunca dentro de un canvas o una imagen.
9. Correr `npm run check:hydration` y las pruebas e2e (`describe('Interfaz 3.0')`).
