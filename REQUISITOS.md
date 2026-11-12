# Requerimientos de RoomyCampus

Estado evaluado contra el prototipo local. **Implementado** significa que la interacción funciona en este navegador; no implica que exista un servicio real o una operación comercial.

## Funcionales

| ID | Requerimiento | Estado | Dónde comprobar |
|---|---|---|---|
| RF-01 | Portada con acceso a estudiante, administración gerencial y alojamiento | Implementado con destinos diferenciados | `/` |
| RF-02 | Inicio de sesión y registro de cuenta estudiantil con correo `@espol.edu.ec` | Simulado, validación local | `/app` y `/registro`; sin contraseña ni backend |
| RF-03 | Mapa y catálogo ampliado de propiedades próximas al campus | Implementado con datos iniciales referenciales | `/app`; propiedades sintéticas y sectores referenciales |
| RF-04 | Descargar polígonos OSM, accesos etiquetados y rutas OSRM | Implementado como generador opcional; requiere red | `npm run data:campus`; rutas viales, no peatonales |
| RF-05 | Filtrar por búsqueda, precio, modalidad y servicio; ordenar por precio, calificación o cercanía | Implementado y cubierto por pruebas unitarias | `/app` |
| RF-06 | Ver ficha, fotos, servicios, total mensual, ubicación, reseñas y verificación | Implementado con datos de muestra | Abrir una tarjeta |
| RF-07 | Guardar favoritos, agendar visitas con fecha y consultar un calendario compacto | Implementado, persistencia local; confirmación simulada | `/app` → Visitas |
| RF-08 | Enviar una solicitud de contacto al administrador del alojamiento y limitar Basic a tres contactos | Solicitud simulada, compartida localmente entre pestañas; no envía comunicaciones | Detalle → Contactar; `/propietario` → Mensajes |
| RF-09 | Simular pago y suscripción Pro | Simulado; no captura ni procesa pagos | Detalle → alcanzar límite Basic |
| RF-10 | Compartir cambios de ocupación y calendario entre pestañas | Implementado en `localStorage` del mismo navegador | Reservar una propiedad y abrir `/admin` |
| RF-11 | Revisar, aprobar o rechazar propiedades | Implementado como flujo de demo | `/admin` → Bandeja de verificación |
| RF-12 | Ver páginas explicativas de resumen, mapa, verificación y analítica | Implementado con navegación interna; no altera la ruta del navegador | Menú lateral en `/admin` |
| RF-13 | Panel para administradores de alojamiento con propiedades, mensajes, agenda, opiniones y alertas | Implementado con datos sintéticos y solicitudes locales | `/propietario`; acceso demo `alojamiento@roomycampus.ec` |
| RF-14 | Analítica de demanda y mediana de precio por m² | Gráficos implementados con series sintéticas | `/admin` → Analítica |
| RF-15 | Exportar indicadores a CSV | Implementado | `/admin` → Exportar datos |
| RF-16 | Calendario acelerado, ocupación simulada, fraude, aprobación y reinicio | Implementado | Botón Demo o `Shift+D` |
| RF-17 | Inicialización determinista y API para guion | Implementado; los datos son fijos y el store queda expuesto | `/app?guion`, `/admin?guion`, `/propietario?guion`, `window.__ROOMYCAMPUS__` |

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
| RNF-09 | Seguridad real, datos personales, mensajería y pagos | No implementado | Los perfiles y mensajes son de demo; no hay autenticación, backend, almacenamiento financiero ni envío real |
| RNF-10 | Accesibilidad y publicación de producción | Parcial | Estados y foco básico; faltan auditoría WCAG, política de privacidad, infraestructura y pruebas de producción |

## Datos que nunca deben presentarse como verificados

- Propiedades, arrendadores, fotografías, correos, reseñas, comentarios, costos, áreas y disponibilidad del catálogo.
- El KPI de estudiantes, la demanda histórica, los precios por m² y el escenario ×2,7/+12 %.
- Tiempos de caminata y ubicación puntual de las propiedades de muestra.
- Los dos accesos del archivo base y los cuatro polígonos aproximados iniciales.
- Los documentos y señales antifraude de las publicaciones ficticias.

El generador puede sustituir la geometría de ejemplo por datos cartográficos disponibles en OSM y rutas viales de OSRM. La cobertura de sectores y la etiqueta `approximate` se deben revisar antes de usar los resultados fuera de una demostración.
