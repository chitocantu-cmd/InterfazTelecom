## Por qué importan los detalles

Un cableado estructurado se instala una vez y se usa durante diez o quince años. Casi todas las fallas que aparecen después —enlaces que se caen, puertos que no negocian la velocidad, cámaras que se reinician— se originan en decisiones de obra que no se ven cuando la red se entrega. Estos son los errores más frecuentes y cómo evitarlos.

## 1. Pasarse de la distancia del canal

La norma ANSI/TIA-568 limita el canal de cobre a **100 m**: hasta 90 m de enlace permanente (del patch panel a la roseta) y 10 m en total de cordones de parcheo en ambos extremos. En naves y bodegas es fácil pasarse sin darse cuenta, sobre todo cuando la ruta real sube a la charola, rodea columnas y baja al punto.

**Cómo evitarlo:** medir la trayectoria real en el levantamiento, no la distancia en línea recta del plano. Si un punto queda fuera de rango, se resuelve con un cuarto de telecomunicaciones intermedio o con fibra óptica, no con un cable más largo.

## 2. Mezclar categorías en un mismo canal

Un cable Cat6A terminado en jacks Cat6, o un patch panel Cat5e en una instalación Cat6, hace que todo el enlace se comporte como la categoría menor. Pasa en ampliaciones, cuando se usa el material que había en almacén.

**Cómo evitarlo:** especificar la categoría para todos los componentes del canal (cable, jacks, patch panel y cordones) y, de preferencia, del mismo fabricante.

## 3. Destrenzar de más al terminar

Los pares trenzados controlan la diafonía. La norma pide que, al terminar, el destrenzado no pase de **13 mm**. Pelar de más la cubierta y destrenzar para "acomodar" los hilos es una de las causas más comunes de enlaces que no pasan la certificación.

## 4. Apretar los cinchos y doblar el cable

Un cincho plástico apretado deforma la geometría del cable, igual que un doblez cerrado. Como referencia, el radio de curvatura mínimo de un cable UTP de cuatro pares es de **cuatro veces su diámetro**.

**Cómo evitarlo:** usar cintas de velcro en los mazos, organizadores en el rack y prever el espacio para que las curvas sean amplias. Con Cat6A, que es más grueso, esto se calcula desde el diseño.

## 5. Saturar charolas y tuberías

Meter más cables de los que caben dificulta las ampliaciones, aumenta el calentamiento con PoE y maltrata los cables al jalarlos. En tubería, la referencia habitual es no pasar de **40 % de ocupación** cuando hay más de dos cables.

## 6. Cables sobre el plafón o junto a la línea eléctrica

El cable de datos debe ir soportado en charola, ganchos o tubería, no apoyado sobre el plafón ni amarrado a tuberías de otras instalaciones. También debe mantenerse separado de los conductores de energía, motores y balastros, según la norma ANSI/TIA-569 y las indicaciones del fabricante.

## 7. Dejar el rack sin tierra

Racks, charolas y equipos deben conectarse al sistema de puesta a tierra de telecomunicaciones (ANSI/TIA-607). Sin él, las diferencias de potencial y las descargas terminan en los equipos activos.

## 8. No etiquetar ni documentar

Sin etiquetas en ambos extremos y sin un registro de qué puerto corresponde a qué punto, cada cambio empieza con una búsqueda. La norma ANSI/TIA-606 define cómo identificar puntos, paneles, racks y trayectorias.

**Qué pedir al recibir la obra:** etiquetado en ambos extremos, planos con la ubicación de cada punto y una tabla de puertos actualizada.

## 9. Probar continuidad en lugar de certificar

Un probador de continuidad sólo indica que los ocho hilos están conectados en el orden correcto. No mide pérdida de inserción, diafonía ni pérdida de retorno, que son las que determinan si el enlace soporta la velocidad para la que se instaló.

**Cómo evitarlo:** certificar cada enlace con un equipo de campo contra la categoría especificada y entregar el reporte de resultados por punto.

## 10. Cordones de parcheo improvisados

Los cordones armados en sitio con cable sólido y conectores sueltos son una fuente frecuente de fallas intermitentes. Conviene usar cordones de fábrica, de la misma categoría que el resto del canal.

## Cómo se previenen en un proyecto

La mayoría de estos errores se evitan antes de la obra: con un levantamiento que mida trayectorias reales, un diseño que calcule ocupación y distancias, una lista de materiales cerrada por categoría y una entrega con certificación y documentación. Si va a ampliar o rehacer una instalación, una certificación del cableado existente indica qué se puede conservar.
