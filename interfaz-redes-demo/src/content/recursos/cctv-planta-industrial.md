## Empezar por el objetivo de cada cámara

Una cámara no «vigila un área» en general: cumple un objetivo concreto. La norma IEC 62676-4 propone niveles de detalle medidos en píxeles por metro sobre el objetivo:

| Objetivo | Para qué sirve | Referencia aproximada |
| --- | --- | --- |
| Detección | Saber que hay una persona o vehículo | 25 px/m |
| Observación | Ver qué hace | 62 px/m |
| Reconocimiento | Reconocer a alguien conocido | 125 px/m |
| Identificación | Identificar sin lugar a dudas | 250 px/m |

Definir el objetivo de cada punto determina la resolución, el lente y la distancia de montaje. Una cámara de identificación en un acceso no se parece a una de detección en un perímetro.

## Lista de verificación

### Zonas y riesgos

- Accesos peatonales y vehiculares, andenes, almacenes de valor, perímetro, estacionamientos y áreas de proceso.
- Qué evento importa en cada zona: entrada no autorizada, robo, accidente, maniobra.
- Horarios: muchas zonas son críticas de noche.

### Iluminación

- Contraluz en accesos y andenes (cámaras con amplio rango dinámico, WDR).
- Iluminación nocturna existente o infrarrojo integrado, y su alcance real.
- Reflejos en superficies metálicas o pisos pulidos.

### Ambiente y montaje

- Polvo, humedad, lavado a presión o atmósferas corrosivas: grado de protección del gabinete (por ejemplo IP66/IP67) y resistencia a impactos (IK10) donde aplique.
- Vibración de la estructura, temperatura bajo techo de lámina y en exterior.
- Altura y punto de montaje accesible para mantenimiento, sin interferir con grúas o montacargas.

### Red

- Segmento de red (VLAN) dedicado a CCTV, separado de producción y oficinas.
- **Presupuesto PoE** por switch, considerando cámaras PTZ o con calefactor.
- Distancias: más de 90 m de cobre requieren fibra o un switch intermedio; casetas y postes lejanos pueden conectarse por fibra o enlace inalámbrico.
- Ancho de banda total hacia el grabador.

### Grabación y retención

- Días de grabación requeridos por la operación o por el área de seguridad.
- El almacenamiento se calcula con número de cámaras, resolución, compresión (H.264/H.265), cuadros por segundo y horas de movimiento.
- Redundancia de discos y respaldo de energía del grabador.

### Usuarios y acceso remoto

- Quién ve cámaras en vivo, quién revisa grabaciones y quién exporta evidencia.
- Usuarios individuales (no compartidos), contraseñas cambiadas de fábrica y acceso remoto controlado.
- Bitácora de exportaciones de video.

### Integración

- Control de acceso: revisar el evento de una puerta junto con su video.
- Detección perimetral o de intrusión asociada a la cámara que cubre cada zona.

### Aspectos legales

En México, el video de personas es un dato personal. Las áreas videovigiladas suelen requerir un aviso de privacidad visible y una política de uso y conservación del video. Conviene revisarlo con el área legal de la empresa antes de la puesta en marcha.

### Mantenimiento

- Limpieza de domos y lentes, revisión de enfoque y de la grabación.
- Alertas cuando una cámara deja de grabar o un disco falla.

## Qué preparar antes del levantamiento

1. Plano de la planta con las zonas críticas marcadas.
2. Inventario del sistema actual: cámaras, grabadores y días de grabación.
3. Quiénes usarán el sistema y desde dónde.
4. Restricciones de horario y permisos de trabajo en altura.

Con esto, el diseño de cobertura se hace sobre plano, punto por punto, antes de cotizar equipo.
