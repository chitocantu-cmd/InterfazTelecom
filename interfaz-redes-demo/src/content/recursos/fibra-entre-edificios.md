## Cuándo el cobre deja de servir

En un mismo edificio, el cableado de cobre resuelve casi todo hasta los 100 m del canal. Entre edificios aparecen tres problemas que el cobre no resuelve bien:

- **Distancia.** Una oficina, una nave y una caseta de acceso suelen estar a más de 100 m entre sí.
- **Diferencias de potencial.** Cada edificio tiene su propia tierra eléctrica. Un cable de cobre entre ambos puede conducir corrientes entre tierras y sobretensiones por descargas atmosféricas, que terminan en los switches.
- **Exposición.** El tramo exterior queda expuesto a humedad, temperatura, roedores y trabajos de obra.

La fibra óptica no conduce electricidad, no la afecta la interferencia de motores o líneas de energía y alcanza distancias que el cobre no puede. Por eso es la opción habitual para unir edificios dentro de un mismo predio.

## Monomodo o multimodo

| Criterio | Multimodo (OM3 / OM4) | Monomodo (OS2) |
| --- | --- | --- |
| 10 Gb/s (10GBASE-SR / -LR) | 300 m (OM3) / 400 m (OM4) | 10 km |
| Ópticas (transceptores) | Más económicas a corta distancia | Algo más costosas, mucho más alcance |
| Crecimiento a velocidades mayores | Limitado por distancia | Margen amplio |

Para enlaces dentro de un predio de unos cientos de metros, ambas pueden servir. Cuando la distancia se acerca a los límites del multimodo o se espera crecer en velocidad, conviene monomodo. La decisión se toma con la distancia real de la ruta, no con la del plano. Más detalle en la guía *Fibra monomodo y multimodo: cómo seleccionar una solución*.

## La ruta: subterránea, aérea o por fachada

- **Subterránea, por ducto.** Es la más protegida. Requiere ducto con registros a distancias que permitan jalar el cable sin dañarlo, y pendientes que eviten acumular agua.
- **Aérea.** Se usa cuando no hay ducto y construirlo no es viable. Requiere un cable diseñado para ese tendido, con soporte o mensajero, y respetar las alturas y separaciones de otras líneas.
- **Por fachada o estructura.** Para tramos cortos entre edificios contiguos, en tubería o charola exterior.

En los tres casos el cable debe ser de **planta externa** (resistente a humedad y rayos UV) o de uso interior/exterior; uno de interior se degrada en el exterior. Si hay riesgo de roedores o de daños por obra, se especifica cable armado.

## Cuántos hilos instalar

El costo del tendido —ducto, mano de obra, permisos— es muy superior al de los hilos adicionales. Por eso se instalan más hilos de los que se usan hoy: para separar redes (datos, CCTV, control de acceso), para tener respaldo si un hilo se daña y para crecer sin volver a tender. Es común dejar al menos el doble de los que se necesitan al arrancar.

## Empalmes, conectores y pérdidas

En cada extremo, la fibra termina en una charola o distribuidor dentro del rack, normalmente con empalmes por fusión a pigtails. Cada empalme y cada conector agregan pérdida. La norma ANSI/TIA-568.3 admite hasta 0.3 dB por empalme y 0.75 dB por par de conectores; un buen empalme por fusión queda bastante por debajo. Con esos valores se calcula el presupuesto de pérdida del enlace, que debe quedar dentro de lo que toleran los transceptores elegidos.

## Cómo se comprueba

- **Nivel 1:** medición de pérdida y longitud de cada hilo con fuente y medidor de potencia, comparada con el presupuesto calculado.
- **Nivel 2:** traza con OTDR, que muestra dónde está cada empalme, conector o evento y cuánto pierde.

El entregable es el reporte por hilo, junto con el plano de la ruta y la identificación de cada hilo en ambos extremos.

## Cuándo considerar un enlace inalámbrico

Si no hay ducto, construirlo es costoso o la conexión se necesita antes de que la obra lo permita, un enlace inalámbrico punto a punto con línea de vista puede unir los edificios. Es más rápido de instalar, pero depende de la línea de vista y del clima, y tiene menos capacidad de crecimiento que la fibra. En algunos proyectos se usa como respaldo de la fibra o como solución temporal.

## Qué se define en el levantamiento

Distancia real de la ruta, tipo de tendido posible, número de hilos, tipo de fibra, ubicación de los distribuidores en cada edificio, protección del cable y método de prueba. Con esos datos la propuesta compara opciones con el mismo alcance.
