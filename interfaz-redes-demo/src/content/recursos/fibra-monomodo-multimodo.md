## Dos tipos de fibra, dos usos

La fibra **multimodo** tiene un núcleo de 50 µm y transmite con fuentes de luz de menor costo (típicamente a 850 nm). La fibra **monomodo** tiene un núcleo de alrededor de 9 µm, transmite a 1310 y 1550 nm y llega mucho más lejos. La elección depende de la distancia, la velocidad que se necesita hoy y en el futuro, y el equipo que terminará cada extremo.

## Distancias de referencia

| Aplicación | OM3 | OM4 | OS2 (monomodo) |
| --- | --- | --- | --- |
| 10GBASE-SR (850 nm) | 300 m | 400 m | No aplica |
| 40GBASE-SR4 | 100 m | 150 m | No aplica |
| 100GBASE-SR4 | 70 m | 100 m | No aplica |
| 10GBASE-LR (1310 nm) | No aplica | No aplica | 10 km |

> Distancias máximas de las normas IEEE para cada aplicación. La distancia real depende de las pérdidas del enlace completo: fusiones, conectores y la calidad de la instalación.

## Cuándo conviene multimodo

- **Dentro de un edificio**: backbone entre el site principal y cuartos de distribución cercanos.
- **Centros de datos y salas de equipo**, con distancias cortas y muchos puertos, donde los transceptores multimodo suelen ser más económicos.
- Instalaciones existentes en multimodo que se amplían.

## Cuándo conviene monomodo

- **Entre edificios o naves** del mismo predio, o cuando la distancia supera unos cientos de metros.
- **Casetas, patios y perímetro**, donde las rutas son largas.
- Cuando se quiere que la planta de fibra soporte velocidades mayores en el futuro sin volver a tender cable: el ancho de banda de la monomodo no está limitado por la dispersión modal.

En la práctica, el cable monomodo suele costar lo mismo o menos que el multimodo; la diferencia está en los transceptores. Por eso muchas instalaciones nuevas entre edificios se especifican en monomodo.

## Cuántos hilos

Conviene dejar hilos de reserva. El número depende de los servicios que viajarán por el enlace (datos, CCTV, enlaces redundantes) y del crecimiento previsto. Tender un cable con más hilos cuesta poco comparado con volver a abrir la trayectoria.

## Trayectoria y protección

- **Interior**: dentro de charola o ducto, separado de cables de energía.
- **Subterránea**: por ducto, con registros y reserva de cable en cada extremo.
- **Aérea**: cable con mensajero o autosoportado, con herrajes adecuados al claro.

La trayectoria determina el tipo de cable (interior, exterior o de uso mixto) y su protección mecánica.

## Cómo se prueba

- **Prueba de pérdida (Nivel 1)**: mide la atenuación total del enlace con fuente y medidor de potencia, y se compara con el presupuesto de pérdida.
- **OTDR (Nivel 2)**: muestra cada evento a lo largo del hilo (fusiones, conectores, curvaturas) y su ubicación. Es la evidencia que permite diagnosticar una falla años después.

El entregable debe incluir las mediciones de cada hilo, la identificación de hilos y puertos, y el diagrama de la trayectoria.

## Preguntas para decidir

1. ¿Qué distancia hay entre los extremos, medida por la trayectoria real?
2. ¿Qué velocidad se necesita hoy y en cinco a diez años?
3. ¿Qué equipo terminará la fibra y qué transceptores admite?
4. ¿Hay fibra existente con la que deba ser compatible?
5. ¿La ruta es interior, subterránea o aérea?

Con esas respuestas se define el tipo de fibra, el número de hilos y el presupuesto de pérdida antes de instalar.
