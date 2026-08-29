# Spec — Vía 2 · Cartografía

**Estado:** Lista para implementación  
**Responsable:** Vía 2 · Cartografía  
**Alcance:** Las seis fases de cartografía del MVP

## Problem Statement

La plataforma necesita una experiencia cartográfica completa para seleccionar ubicaciones, consultar fuentes públicas de suministro y analizar reportes de escasez y alertas por distrito. El repositorio ya contiene un spike funcional de MapLibre con OpenFreeMap, pero todavía no existe el contrato compartido del selector de punto, las tres capas del producto, el tablero analítico, los filtros compartibles ni la integración preparada para los datos GeoJSON de Convex.

El trabajo se desarrolla en paralelo con las vías de Captura, Cuentas, Auth y Convex. Vía 2 debe terminar su territorio sin modificar módulos ajenos ni quedar bloqueada por queries que aún no han sido publicadas. La solución necesita funcionar hoy con datos de demostración claramente identificados y permitir que Convex sustituya esos datos a través de una única costura, sin reescribir los componentes del mapa.

El mapa también debe ser útil en móviles, accesible sin depender exclusivamente del canvas, cuidadoso con la ubicación de hogares y suficientemente aislado para que el peso de MapLibre no afecte rutas que no muestran mapas.

## Solution

Construir una capa cartográfica autocontenida sobre la instalación existente de MapLibre y el estilo alojado de OpenFreeMap. El spike actual se convierte en una base reutilizable que administra una sola instancia del mapa y permite registrar capas declarativas mediante un contexto privado.

La solución entrega:

- Un selector controlado de punto, reutilizable por Captura y Cuentas, con interacción táctil, marcador arrastrable e inputs accesibles.
- Un mapa público de fuentes verificadas y disponibles, con información de contacto y alternativa textual al canvas.
- Un tablero autenticado para consumidores aprobados y administradores, con heatmap de riesgo, alertas por distrito, fuentes de suministro, leyenda y filtros persistidos en la URL.
- Contratos TypeScript mínimos para puntos, bounding boxes y las tres colecciones GeoJSON.
- Fixtures ficticios que permiten terminar y demostrar Vía 2 antes de que Convex publique sus queries, siempre acompañados por una indicación visible de que son datos de demostración.
- Una configuración pública y serializable para que la vía de Captura aplique cache-on-fetch a recursos cartográficos desde su service worker.
- Carga dinámica de MapLibre y una validación de bundle que confirme que las rutas sin mapa no pagan ese coste.

Vía 2 queda terminada cuando todos sus componentes funcionan con fixtures, el selector cumple su contrato público, los filtros producen URLs compartibles, los estados de carga y error son visibles, las verificaciones automáticas pasan y los dos handoffs externos quedan documentados. La conexión real con Convex y el cacheo efectivo del service worker se completan por sus respectivos responsables.

## User Stories

1. Como miembro de una comunidad, quiero seleccionar en un mapa el lugar afectado por la escasez, para que mi reporte describa la ubicación correcta.
2. Como miembro de una comunidad, quiero corregir una ubicación obtenida por GPS, para que un error de precisión no coloque mi reporte en otro lugar.
3. Como usuario de teclado, quiero escribir latitud y longitud en campos accesibles, para que seleccionar una ubicación no dependa exclusivamente de arrastrar un mapa.
4. Como usuario móvil, quiero tocar el mapa para colocar un marcador, para que pueda informar una ubicación con una interacción simple.
5. Como usuario móvil, quiero arrastrar el marcador, para que pueda hacer ajustes pequeños sin repetir todo el proceso.
6. Como usuario que concedió permiso de ubicación, quiero que se conserve la precisión original mientras no corrija el punto manualmente, para que el reporte mantenga información útil del GPS.
7. Como usuario que corrige manualmente una ubicación, quiero que la precisión GPS anterior deje de atribuirse al punto corregido, para que el dato no resulte engañoso.
8. Como usuario que introduce coordenadas inválidas, quiero recibir un mensaje claro y anunciado por tecnologías de asistencia, para que pueda corregirlas.
9. Como usuario cuya ubicación parece estar fuera de El Salvador, quiero recibir una advertencia sin perder inmediatamente el punto, para que los casos cercanos a fronteras no sean bloqueados por una aproximación rectangular.
10. Como visitante, quiero ver fuentes públicas de suministro en un mapa, para que pueda encontrar ayuda cercana.
11. Como visitante, quiero ver únicamente fuentes disponibles y verificadas, para que no intente contactar una opción inactiva o no validada.
12. Como visitante, quiero consultar nombre, tipos de suministro, transporte y teléfono de una fuente, para que pueda decidir si me sirve.
13. Como visitante desde un teléfono, quiero iniciar una llamada desde el detalle de una fuente, para que pueda contactar al suministrador con pocos pasos.
14. Como visitante que no puede operar el canvas, quiero acceder a las fuentes mediante una representación textual equivalente, para que el teléfono no quede encerrado en una interacción visual.
15. Como visitante, quiero saber cuándo el mapa usa datos ficticios, para no confundir una demostración con disponibilidad real.
16. Como consumidor institucional aprobado, quiero abrir un tablero cartográfico, para analizar la situación hídrica por ubicación y periodo.
17. Como administrador, quiero acceder al mismo tablero analítico, para supervisar reportes, alertas y fuentes.
18. Como miembro o suministrador sin función analítica, quiero que el acceso al tablero respete mi rol, para que los datos internos no se expongan innecesariamente.
19. Como analista, quiero ver un heatmap ponderado por el peso decaído de cada reporte, para identificar concentraciones de escasez.
20. Como analista, quiero que un mismo peso conserve la misma intensidad al cambiar filtros o viewport, para poder comparar vistas sin que la escala cambie silenciosamente.
21. Como analista, quiero una leyenda que describa menor y mayor peso, para interpretar el heatmap sin confundirlo con los niveles agregados por distrito.
22. Como analista, quiero ver zonas en vigilancia y emergencia sobre sus centroides, para localizar alertas sin fingir que el sistema conoce polígonos administrativos.
23. Como analista con daltonismo, quiero que vigilancia y emergencia tengan etiquetas además de colores, para distinguir sus estados.
24. Como analista, quiero consultar el nombre de la zona, riesgo, reportes activos, personas afectadas y hora de cálculo, para entender el contexto de cada alerta.
25. Como analista, quiero alternar individualmente riesgo, emergencias y fuentes, para concentrarme en la información relevante.
26. Como analista, quiero filtrar por una fecha inicial y final inclusivas, para estudiar un periodo concreto.
27. Como analista, quiero que el rango inicial cubra los últimos treinta días en hora de El Salvador, para observar el efecto de una vida media de catorce días.
28. Como analista fuera de El Salvador, quiero que los límites diarios usen la zona horaria del país y no la de mi equipo, para obtener el mismo resultado que otros usuarios.
29. Como analista, quiero compartir la URL del tablero con sus fechas y capas visibles, para que otra persona abra la misma vista lógica.
30. Como analista, quiero que cambiar filtros no llene el historial del navegador, para que el botón Atrás siga siendo útil.
31. Como analista, quiero que un rango invertido se corrija o rechace claramente, para evitar una vista vacía inexplicable.
32. Como usuario del mapa, quiero que los datos se actualicen al terminar de mover el viewport, para consultar el área visible sin generar solicitudes continuas durante el gesto.
33. Como usuario del mapa, quiero ver un estado de carga mientras llega el estilo o los datos, para saber que la aplicación sigue trabajando.
34. Como usuario con una conexión inestable, quiero que un tile aislado fallido no destruya un mapa ya cargado, para seguir usando los recursos disponibles.
35. Como usuario sin acceso inicial al estilo del mapa, quiero ver un error comprensible y una acción de reintento, para recuperarme sin recargar toda la aplicación.
36. Como usuario que consulta un periodo sin resultados, quiero ver un estado vacío y no un error, para entender que la consulta fue válida.
37. Como usuario, quiero que el mapa se centre y limite alrededor de El Salvador, para no perderme accidentalmente navegando a otro continente.
38. Como usuario, quiero controles táctiles suficientemente grandes y estados anunciados, para operar el mapa desde un móvil y con tecnologías de asistencia.
39. Como desarrollador de Captura, quiero importar un selector con una firma estable, para integrar ubicación sin conocer los detalles de MapLibre.
40. Como desarrollador de Cuentas, quiero reutilizar el mismo selector al registrar una fuente, para evitar una segunda implementación de coordenadas.
41. Como desarrollador de Convex, quiero un contrato GeoJSON inequívoco para las tres queries, para entregar datos consumibles sin una transformación adicional en el cliente.
42. Como desarrollador de Convex, quiero que la convención entre `{ lat, lng }` y coordenadas GeoJSON quede explícita, para no invertir latitud y longitud.
43. Como desarrollador de Convex, quiero que el cliente filtre fixtures y datos reales mediante la misma interfaz, para que el cambio de origen no altere las capas.
44. Como desarrollador de Captura, quiero una configuración pública de recursos cartográficos cacheables, para que el service worker pueda aplicarla sin importar TypeScript del cliente.
45. Como mantenedor, quiero que MapLibre se cargue únicamente en vistas que muestran un mapa, para proteger el rendimiento del resto de la aplicación.
46. Como mantenedor, quiero que cada capa actualice su fuente en vez de reconstruir el mapa, para evitar fugas y parpadeos.
47. Como mantenedor, quiero limpiar instancia, controles, listeners, marcadores y popups al desmontar, para evitar efectos duplicados durante navegación y desarrollo.
48. Como mantenedor, quiero que los datos de usuario se inserten en popups mediante APIs DOM seguras, para evitar inyección de HTML.
49. Como mantenedor, quiero una única costura de sustitución entre fixtures y Convex, para que la integración posterior sea pequeña y revisable.
50. Como equipo, quiero que Vía 2 respete la propiedad de ficheros, para integrar ramas paralelas sin conflictos estructurales.

## Implementation Decisions

### Propiedad y límites

- Vía 2 es responsable de la base cartográfica, el selector de punto, las tres capas, tipos y colores de riesgo, fixtures, mapa público, tablero analítico y configuración pública de cache del mapa.
- El spike existente se absorbe dentro de la nomenclatura y organización acordadas para Cartografía. La URL pública del mapa no cambia.
- Vía 2 crea el contenido del tablero dentro del grupo autenticado, mientras Cuentas conserva la responsabilidad del layout, navegación y guard de roles.
- Vía 2 consume contratos de Convex; no implementa schema, queries, mutations ni algoritmo de riesgo.
- Vía 2 publica configuración para cache; Captura conserva la responsabilidad exclusiva del service worker.
- La implementación no modifica el layout raíz, los estilos globales, la configuración de Next, las dependencias ni otros territorios compartidos.

### Runtime cartográfico

- Se conserva MapLibre ya instalado; no se agrega un wrapper React ni otra dependencia cartográfica.
- Se conserva el estilo alojado de OpenFreeMap para el MVP. No se incorpora PMTiles, bucket, Git LFS ni pipeline de tiles en esta entrega.
- El worker de MapLibre continúa servido localmente mediante el mecanismo de copia existente.
- La base del mapa administra exactamente una instancia de MapLibre y la expone a las capas mediante un contexto privado del módulo.
- La instancia se elimina al desmontar, junto con observadores, listeners, popups y marcadores creados por los componentes.
- Las capas se registran cuando el estilo está listo y actualizan datos mediante la fuente GeoJSON existente, sin recrear el mapa.
- El árbol que importa MapLibre se carga dinámicamente con renderizado de servidor desactivado.
- Las rutas sin mapa no importan MapLibre directa ni indirectamente.

### Geografía y viewport

- El centro inicial aproximado es latitud `13.7942`, longitud `-88.8965`.
- Los límites de navegación aproximados abarcan desde longitud `-90.2`, latitud `12.8`, hasta longitud `-87.6`, latitud `14.6`.
- Estos límites son una restricción de navegación del MVP, no una afirmación de límites administrativos oficiales.
- El mapa usa un zoom inicial cercano a `8`, un mínimo cercano a `7` y un máximo de `18`; en pantallas pequeñas puede ajustar los límites completos en lugar de depender de un zoom fijo.
- Las consultas de datos reciben el bounding box al cargar el mapa y después de cada evento de fin de movimiento.
- El viewport no se serializa en la URL. Fechas y visibilidad de capas sí se serializan.

### Contratos de datos

- La UI usa puntos con propiedades nominales `lat` y `lng`.
- GeoJSON usa coordenadas en orden longitud, latitud.
- El contrato compartido define un bounding box con oeste, sur, este y norte.
- Las tres respuestas de datos son colecciones GeoJSON de puntos directamente consumibles por MapLibre.
- Los puntos de riesgo incluyen identificador del reporte, peso decaído y fecha de creación.
- Las alertas incluyen identificador y nombre de zona, nivel de vigilancia o emergencia, riesgo, reportes activos, personas afectadas y fecha de cálculo.
- Las fuentes incluyen identificador, nombre del lugar, tipos de suministro, disponibilidad de transporte, teléfono público, disponibilidad y verificación.
- Las fuentes públicas se filtran de manera defensiva en el cliente para exigir disponibilidad y verificación, aunque Convex también deba cumplir ese contrato.
- El módulo de datos entrega las tres colecciones, estado de carga, origen y error opcional mediante una única interfaz.
- El origen distingue datos de demostración y datos de Convex.

### Datos de demostración e integración con Convex

- Los fixtures contienen exclusivamente datos ficticios y cubren distintos pesos, fechas, niveles, tipos de suministro, visibilidad y viewports.
- Las vistas muestran de forma visible “Datos de demostración” mientras el origen sea fixture.
- Una sola costura de datos aplica rango, bounding box y reglas de exposición antes de entregar colecciones a las capas.
- Cuando Convex publique las tres queries, se sustituye el cuerpo de esa costura por consultas reactivas. Las capas, selector y vistas conservan sus interfaces.
- El compañero de Convex debe devolver GeoJSON ya transformado y coordenadas residenciales redondeadas según la política de privacidad del producto.
- La ausencia temporal de queries no se oculta mediante referencias de función inventadas ni llamadas que fallen en ejecución.

### Selector de punto

- El selector conserva la firma pública acordada: valor opcional, callback de cambio y centro inicial opcional.
- Es un componente controlado: el marcador representa el valor recibido y toda interacción comunica un nuevo valor al padre.
- Permite seleccionar mediante toque o clic, arrastrar el marcador y editar coordenadas mediante inputs numéricos accesibles.
- Los inputs admiten edición parcial como borrador y solo emiten un punto cuando ambas coordenadas son números globalmente válidos.
- Los errores de coordenadas se anuncian con `aria-live`.
- Un punto globalmente válido fuera de los límites aproximados se conserva y genera una advertencia, en vez de rechazarse como si el rectángulo fuera la frontera oficial.
- Una selección manual elimina la precisión GPS anterior.
- Un cambio externo del valor resincroniza marcador e inputs.
- El centro inicial solo se usa cuando todavía no existe valor.
- El selector no solicita geolocalización; Captura obtiene el GPS y entrega punto y precisión.
- La firma no admite borrar el valor. Un input temporalmente vacío conserva la última selección válida hasta que el borrador vuelva a ser válido.

### Mapa público

- El mapa público muestra fuentes verificadas y disponibles.
- No muestra puntos residenciales de reportes ni el heatmap de riesgo.
- Cada fuente se representa mediante una capa nativa de MapLibre, evitando marcadores DOM.
- El MVP no agrupa fuentes. El techo conocido es el solapamiento con cientos de puntos; el upgrade path es activar clustering en la fuente GeoJSON.
- El popup muestra nombre, tipos de suministro, transporte y teléfono.
- El teléfono ofrece una acción de llamada cuando puede normalizarse de forma segura.
- La misma información accionable se presenta en una alternativa textual accesible; el canvas no es la única vía para encontrar y llamar a una fuente.

### Tablero analítico

- El tablero está destinado a consumidores aprobados y administradores. El guard efectivo pertenece a Cuentas.
- Muestra las tres capas: riesgo, alertas y fuentes.
- Los controles permiten alternar cada capa de manera independiente.
- El rango inicial representa los últimos treinta días.
- Los extremos del rango son inclusivos y se interpretan en hora de El Salvador, `UTC-06:00`, sin depender de la zona horaria del navegador.
- Las fechas usan controles nativos.
- El estado se persiste en query parameters. Los valores por defecto pueden omitirse, pero su significado es estable.
- Los cambios usan reemplazo de navegación sin desplazamiento, de modo que no añaden una entrada de historial por cada toggle.
- Un rango invertido se normaliza o se presenta como error claro; nunca produce silenciosamente una vista vacía.

### Capa de riesgo

- Usa el heatmap nativo de MapLibre y toma el peso de las propiedades GeoJSON.
- La escala visual es fija entre filtros y viewports: peso `0` equivale a intensidad `0`, peso `5` a `0.25`, peso `20` a `0.65` y peso `60` o superior a `1`.
- La escala no se normaliza contra el máximo visible.
- La rampa transita de transparente a azul claro, amarillo, naranja y rojo.
- La leyenda usa “Menor peso” y “Mayor peso”; no inventa categorías oficiales de riesgo por reporte.

### Capa de emergencias

- Representa cada zona mediante un círculo graduado sobre su centroide.
- No dibuja polígonos aproximados.
- El tamaño refleja riesgo y el color refleja vigilancia o emergencia.
- Las alertas muestran texto además de color.
- El detalle presenta zona, nivel, riesgo, reportes activos, personas afectadas y fecha de cálculo.

### Capa de fuentes

- Usa capas GeoJSON nativas, no marcadores DOM.
- Emplea un color visualmente distinto de vigilancia y emergencia.
- El detalle se construye mediante nodos DOM y contenido textual, sin interpolar HTML.
- El teléfono se normaliza a caracteres telefónicos permitidos antes de formar una URL de llamada. Un valor no normalizable se muestra como texto sin enlace.

### Colores y leyenda

- El nivel normal usa azul oscuro `#0369a1`.
- Vigilancia usa ámbar oscuro `#b45309`.
- Emergencia usa rojo oscuro `#b91c1c`.
- Estos colores constituyen el contrato semántico de Vía 2 y pueden ser consumidos por badges de otras vías.
- Las fuentes usan una familia turquesa o azul claramente distinta de los colores de alerta.
- Ningún significado depende exclusivamente del color.

### Carga, errores y estados vacíos

- La carga inicial del estilo muestra un estado anunciado de “Cargando mapa…”.
- Un fallo antes de que el estilo esté listo presenta un error fatal y una acción de reintento que recrea la instancia.
- Un error de tile después de la carga no destruye el mapa completo.
- Un fallo de datos conserva el mapa base y presenta un banner de datos.
- Una colección vacía es un resultado válido y muestra un estado vacío, no un error.
- El estado de demostración permanece visible mientras se usen fixtures.

### Accesibilidad

- Cada mapa tiene un nombre accesible acorde con su propósito.
- Los controles táctiles tienen un objetivo mínimo de 44 px.
- El selector ofrece inputs como alternativa al canvas.
- Los estados y errores relevantes usan regiones vivas.
- Las alertas incluyen etiquetas textuales.
- El mapa público proporciona una representación textual de las fuentes visibles.
- La leyenda explica la codificación del heatmap.
- Los controles admiten navegación por teclado y foco visible conforme a los estilos disponibles, sin modificar los estilos globales desde Vía 2.

### Seguridad y privacidad

- Los popups usan creación de nodos, `textContent`, atributos y listeners controlados; los datos de backend nunca se pasan a una API de HTML crudo.
- Los teléfonos se validan antes de formar enlaces.
- El mapa público no expone puntos residenciales de reportes.
- El contrato de Convex exige redondear los puntos de riesgo antes de enviarlos a clientes que puedan ver el heatmap.
- El teléfono de una fuente se considera público únicamente bajo el consentimiento gestionado por la vía correspondiente.

### Cache cartográfico

- OpenFreeMap produce un conjunto abierto de URLs de tiles; no se intenta enumerarlas para precache.
- Vía 2 publica una configuración JavaScript estática y serializable dentro del territorio público de tiles.
- Captura carga esa configuración desde su service worker y aplica cache-on-fetch a orígenes y patrones cartográficos permitidos.
- El cache solo puede hacer disponibles recursos que el dispositivo haya visitado previamente; no equivale a un paquete offline completo del país.
- Existe una duplicación intencional mínima entre la URL usada por la aplicación y la configuración pública porque un service worker estático no puede importar TypeScript del cliente.
- El techo de esa duplicación y su upgrade path quedan documentados: generar ambas salidas desde una configuración común cuando el proyecto incorpore un pipeline que lo justifique.

### Rendimiento

- MapLibre se carga dinámicamente y queda aislado de rutas que no renderizan mapas.
- El árbol del mapa no se importa desde layout, header ni navegación.
- No se agrega un analizador de bundle.
- El build de producción y la inspección de chunks verifican el aislamiento y registran el tamaño real.
- OpenFreeMap evita incluir un archivo PMTiles de decenas de megabytes dentro del artefacto.
- La navegación no precarga de forma deliberada el módulo pesado del mapa.

### Secuencia de implementación

1. **Contrato y base:** publicar tipos, colores, configuración de tiles y selector con su firma final; absorber el spike en la base reutilizable. Completo cuando Captura y Cuentas pueden importar el selector y el mapa base carga y se limpia correctamente.
2. **Selector real:** añadir toque, drag, inputs, validación, advertencia geográfica y sincronización controlada. Completo cuando todos los caminos emiten el mismo contrato de punto y la precisión se elimina al corregir manualmente.
3. **Datos y capas:** crear la costura de datos, fixtures, heatmap, alertas, fuentes, popups y leyenda. Completo cuando las tres capas funcionan de forma independiente con fixtures y no reconstruyen el mapa al cambiar datos.
4. **Vistas:** terminar mapa público y tablero, incluidos alternativa textual, filtros URL, rango y toggles. Completo cuando las URLs son compartibles y cada vista expone únicamente la información definida para su audiencia.
5. **Cache y resiliencia:** publicar configuración del cache y completar estados de carga, error, retry y vacío. Completo cuando Captura dispone de un contrato consumible y el mapa se recupera de un fallo inicial sin tratar cada tile fallido como fatal.
6. **Rendimiento y cierre:** ejecutar check de lógica, lint y build; inspeccionar chunks y documentar handoffs. Completo cuando todas las verificaciones pasan o los fallos ajenos quedan identificados con evidencia.

## Testing Decisions

- Las pruebas observan comportamiento externo: colecciones resultantes, parámetros de URL, callbacks emitidos, información visible y aislamiento del bundle. No afirman nombres de fuentes MapLibre, orden de efectos ni detalles internos del contexto.
- Se prefiere una única costura alta de lógica pura para fechas, bounding box, exposición de fuentes y conversión de coordenadas. Es la misma costura que después alimentará fixtures o respuestas de Convex.
- El check mínimo usa las herramientas integradas de Node, sin framework ni dependencia nueva.
- El check verifica que un rango incluye ambos extremos.
- El check verifica el comportamiento acordado para un rango invertido.
- El check verifica que el bounding box conserva puntos interiores y elimina exteriores.
- El check verifica que una fuente no disponible o no verificada no se expone.
- El check verifica que las coordenadas GeoJSON en orden longitud, latitud se convierten correctamente a un punto de UI.
- Si el runtime disponible ejecuta TypeScript nativamente, el check consume directamente el módulo de lógica. De lo contrario, se usa un módulo JavaScript importable sin duplicar el algoritmo.
- La integración visual se comprueba con fixtures que cubren fechas actuales y antiguas, pesos bajos y altos, vigilancia, emergencia, fuentes válidas e inválidas y puntos fuera del viewport.
- El selector se comprueba desde su interfaz pública: cambio por mapa, cambio por drag, edición válida, edición inválida, sincronización externa y eliminación de precisión tras corrección manual.
- Los filtros se comprueban desde la URL observable: defaults, fechas, toggles, rango invertido y reemplazo sin desplazamiento.
- Los popups se revisan con texto que contenga caracteres especiales para confirmar que se presenta como texto y no como HTML.
- Los teléfonos se revisan con formatos válidos e inválidos para confirmar cuándo existe acción de llamada.
- Los estados de carga, error fatal, retry, error de datos y vacío se verifican como estados distinguibles.
- El build de producción es la prueba de integración principal para límites cliente/servidor, importación dinámica, tipos y rutas.
- ESLint valida las reglas estáticas existentes del repositorio.
- La inspección de chunks confirma que MapLibre no forma parte del código cargado por rutas sin mapa.
- El proyecto no contiene prior art de pruebas de cartografía. Se usa `node:test` y `node:assert` por ser la costura más pequeña y por coincidir con la estrategia sin framework definida en la documentación del proyecto.

## Out of Scope

- Implementar o modificar schema, queries, mutations, cron o algoritmo de riesgo en Convex.
- Sustituir al responsable de Convex en la generación de los tres contratos GeoJSON.
- Implementar guards de rol, navegación o layout autenticado.
- Modificar configuración de Clerk o providers.
- Implementar o editar el service worker.
- Garantizar funcionamiento offline completo del mapa antes de que Captura consuma la configuración publicada.
- Precargar todos los tiles de El Salvador.
- Introducir PMTiles, almacenamiento R2/S3, Git LFS o pipeline de generación cartográfica.
- Añadir clustering de fuentes en el MVP.
- Añadir polígonos administrativos o point-in-polygon.
- Geocodificación, búsqueda por dirección o catálogo de cantones.
- Solicitar geolocalización dentro del selector.
- Mostrar el heatmap de reportes residenciales en el mapa público.
- Calibrar coeficientes del algoritmo de riesgo.
- Añadir un framework de pruebas, wrapper React para MapLibre o analizador de bundle.
- Modificar tokens o estilos globales pertenecientes a otra vía.
- Afirmar que los fixtures representan disponibilidad o emergencias reales.

## Further Notes

- El repositorio ya contiene MapLibre, un worker servido localmente, un estilo de OpenFreeMap y un mapa básico funcional. Esta implementación evoluciona ese trabajo en lugar de instalar una segunda solución.
- La versión instalada de MapLibre es la autoridad para esta entrega. Una actualización de versión requiere coordinación con el dueño de dependencias y queda fuera de esta spec.
- El backend actual aún no ofrece el modelo ni las queries descritas por la arquitectura de aguaSOS. Vía 2 avanza con fixtures y entrega el contrato preciso al responsable de Convex.
- Handoff a Convex: publicar colecciones GeoJSON de riesgo, alertas y fuentes con las propiedades acordadas, filtros por bounding box y fechas, reglas de privacidad y fuentes disponibles/verificadas.
- Handoff a Captura: cargar la configuración pública de cache desde el service worker y aplicar cache-on-fetch a los recursos cartográficos permitidos.
- Handoff a Cuentas: permitir el tablero a consumidores aprobados y administradores, e integrar su navegación dentro del layout autenticado.
- Handoff a Captura y Cuentas: consumir el selector mediante su firma estable; la solicitud de GPS y la persistencia del formulario permanecen fuera del selector.
- La dependencia de OpenFreeMap implica disponibilidad, CORS y política operativa de un tercero. El upgrade path es alojar un estilo y tiles propios sin alterar los contratos de las capas.
- Los coeficientes visuales del heatmap acompañan la heurística actual de riesgo, todavía no calibrada con datos de campo. Si cambia la escala del backend, se ajusta la escala visual centralizada y su leyenda.
