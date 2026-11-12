# Requerimientos de RoomyCampus

Estado evaluado contra el prototipo local. **Implementado** significa que la interacción funciona en este navegador; no implica que exista un servicio real o una operación comercial.

## Funcionales

| ID | Requerimiento | Estado | Dónde comprobar |
|---|---|---|---|
| RF-01 | Portada con entrada a vista estudiante y panel gerencial | Implementado | `/` |
| RF-02 | Restringir acceso estudiante a correo `@espol.edu.ec` | Simulado, validación local | `/app`; rechaza otros dominios, sin backend de identidad |
| RF-03 | Mapa con propiedades y sectores próximos al campus | Implementado con datos iniciales referenciales | `/app`; polígonos trazados y pintados en el mapa |
| RF-04 | Descargar polígonos OSM, accesos etiquetados y rutas OSRM | Implementado como generador opcional; requiere red | `npm run data:campus`; rutas viales, no peatonales |
| RF-05 | Filtrar por precio, modalidad y servicio disponible | Implementado | `/app` |
| RF-06 | Ver ficha, fotos, servicios, total mensual, ubicación, reseñas y verificación | Implementado con datos de muestra | Abrir una tarjeta |
| RF-07 | Guardar favoritos y solicitar visita | Implementado, persistencia local; confirmación simulada | `/app` y sección de visitas |
| RF-08 | Contactar arrendador y limitar Basic a tres contactos | Simulado; no envía comunicaciones | Detalle de propiedad y selector de planes |
| RF-09 | Simular pago y suscripción Pro | Simulado; no captura ni procesa pagos | Detalle → alcanzar límite Basic |
| RF-10 | Compartir cambios de ocupación y calendario entre pestañas | Implementado en `localStorage` del mismo navegador | Reservar una propiedad y abrir `/admin` |
| RF-11 | Revisar, aprobar o rechazar propiedades | Implementado como flujo de demo | `/admin` → Bandeja de verificación |
| RF-12 | Analítica de demanda y mediana de precio por m² | Gráficos implementados con series sintéticas | `/admin` → Analítica |
| RF-13 | Exportar indicadores a CSV | Implementado | `/admin` → Exportar datos |
| RF-14 | Calendario acelerado, ocupación simulada, fraude, aprobación y reinicio | Implementado | Botón Demo o `Shift+D` |
| RF-15 | Inicialización determinista y API para guion | Implementado; los datos son fijos y el store queda expuesto | `/app?guion`, `/admin?guion`, `window.__ROOMYCAMPUS__` |

## No funcionales

| ID | Requerimiento | Estado | Detalle |
|---|---|---|---|
| RNF-01 | Interfaz en español ecuatoriano | Implementado | Copys, precios USD y fechas en `es-EC` |
| RNF-02 | Diseño móvil 390 × 844 y panel de escritorio 1440 × 900 | Implementado y responsive | Verificar en Chrome DevTools |
| RNF-03 | React, TypeScript y Vite | Implementado | Aplicación y build de TypeScript |
| RNF-04 | Mapa de Leaflet y teselas OpenStreetMap | Implementado | Internet necesario para teselas |
| RNF-05 | Recharts, Zustand, react-router y lucide-react | Implementado | Gráficas, estado, rutas e iconos |
| RNF-06 | Persistencia y sincronización local entre pestañas | Implementado | `localStorage`; no hay servidor ni sincronización multi-dispositivo |
| RNF-07 | Transparencia de datos supuestos | Implementado | Etiquetas y documentación separan datos OSM de muestras |
| RNF-08 | Generación cartográfica robusta | Implementado con errores explícitos | Una descarga fallida no sobrescribe la geometría existente |
| RNF-09 | Seguridad real, datos personales y pagos | No implementado | No hay autenticación, backend, almacenamiento financiero ni datos personales reales |
| RNF-10 | Accesibilidad y publicación de producción | Parcial | Estados y foco básico; faltan auditoría WCAG, política de privacidad, infraestructura y pruebas de producción |

## Datos que nunca deben presentarse como verificados

- Propiedades, arrendadores, fotografías, correos, reseñas, comentarios, costos, áreas y disponibilidad del catálogo.
- El KPI de estudiantes, la demanda histórica, los precios por m² y el escenario ×2,7/+12 %.
- Tiempos de caminata y ubicación puntual de las propiedades de muestra.
- Los dos accesos del archivo base y los cuatro polígonos aproximados iniciales.
- Los documentos y señales antifraude de las publicaciones ficticias.

El generador puede sustituir la geometría de ejemplo por datos cartográficos disponibles en OSM y rutas viales de OSRM. La cobertura de sectores y la etiqueta `approximate` se deben revisar antes de usar los resultados fuera de una demostración.
