## La diferencia en una frase

Cat6 y Cat6A son categorías de cable de par trenzado definidas en la norma ANSI/TIA-568.2. Las dos llegan a 100 m por canal; la diferencia está en el ancho de banda que soportan, en la distancia a la que transmiten 10 Gb/s y en cómo se comportan con PoE de alta potencia.

| Parámetro | Cat6 | Cat6A |
| --- | --- | --- |
| Ancho de banda especificado | 250 MHz | 500 MHz |
| 1 Gb/s (1000BASE-T) | 100 m | 100 m |
| 2.5 y 5 Gb/s (802.3bz) | Normalmente 100 m | 100 m |
| 10 Gb/s (10GBASE-T) | Hasta 55 m, según condiciones de diafonía | 100 m |
| Diámetro típico (U/UTP) | Alrededor de 6 mm | Alrededor de 7.5 a 8.5 mm |
| PoE de alta potencia en mazos grandes | Más calentamiento | Mejor disipación |

> Los valores son de referencia. El diámetro y el comportamiento térmico dependen del fabricante y de la construcción del cable (U/UTP, F/UTP).

## Cuándo basta Cat6

- Puestos de trabajo de oficina y telefonía IP, donde 1 Gb/s es suficiente para la vida útil prevista.
- Ampliaciones de una instalación Cat6 existente, para no mezclar categorías en el mismo canal.
- Cámaras de videovigilancia con PoE estándar, en trayectorias que no concentran cientos de cables.

## Cuándo conviene especificar Cat6A

- **Access points WiFi 6, 6E y 7.** Sus enlaces de subida ya usan 2.5 o 5 Gb/s y la guía TIA TSB-162-A recomienda Cat6A para puntos de acceso inalámbrico.
- **PoE de alta potencia** (IEEE 802.3bt, tipos 3 y 4): iluminación, pantallas, cámaras PTZ con calefactor. En mazos grandes el cable se calienta y Cat6A, con conductores más gruesos, lo tolera mejor.
- **Backbone de cobre o enlaces entre racks** que deban llegar a 10 Gb/s.
- **Obra nueva** con vida útil esperada de 10 a 15 años, donde el costo de recablear después es mayor que la diferencia de material hoy.

## Lo que cambia en la obra

El cable Cat6A es más grueso y más rígido. Eso afecta:

1. La **ocupación de charolas y tubería**: caben menos cables por trayectoria; hay que calcularlo en el diseño, no descubrirlo en campo.
2. El **radio de curvatura** y el espacio en los organizadores del rack.
3. El **tiempo de terminación**: los jacks y patch panels Cat6A requieren más cuidado para mantener el desempeño.

Mezclar componentes de distinta categoría en un mismo canal (por ejemplo, cable Cat6A con jacks Cat6) hace que el enlace se comporte como la categoría menor.

## Cómo se comprueba

La única forma de saber que la instalación cumple su categoría es la **certificación de cada enlace** con un equipo de prueba de campo, contra los límites de la norma (enlace permanente o canal). Una prueba de continuidad sólo confirma que los hilos conectan; no mide desempeño.

El reporte de certificación es parte de la entrega: respalda la instalación y sirve como referencia cuando, años después, aparece una falla.

## Cómo decidir

- ¿Qué equipos se conectarán en los próximos 10 años, no sólo hoy?
- ¿Cuántos access points y equipos PoE de alta potencia habrá?
- ¿Las trayectorias tienen espacio para el diámetro de Cat6A?
- ¿La diferencia de costo es relevante frente al costo de la obra completa y de recablear en el futuro?

Con esas respuestas, la recomendación suele ser una combinación: Cat6A para access points, PoE de alta potencia y backbone, y Cat6 donde el uso lo permita. Se define en el levantamiento y queda documentada en el proyecto.
