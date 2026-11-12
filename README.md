# RoomyCampus

Prototipo interactivo de alojamientos universitarios para estudiantes de ESPOL en Guayaquil. Permite explorar habitaciones y suites de ejemplo, comparar el costo mensual desglosado y mostrar cómo cambian la disponibilidad y los indicadores de gestión durante el calendario académico.

> **Es un prototipo académico, no un servicio de alquiler en producción.** Los usuarios, propietarios, propiedades, fotografías, precios, reseñas, direcciones puntuales, visitas, contactos, pagos y estadísticas son de demostración. El inicio de sesión no autentica contra un servidor ni reserva o cobra dinero real. Las áreas iniciales del mapa y algunos accesos son referenciales; no representan límites oficiales ni garitas verificadas.

## Requisitos

- Node.js 22 LTS y npm.
- Python 3.12 o superior para generar datos cartográficos y ejecutar las pruebas Python.
- Acceso a internet para las teselas de OpenStreetMap, las fotos de ejemplo, Inter desde Google Fonts y la generación opcional de datos OSM/OSRM.
- Playwright y Chromium son opcionales para automatizar la revisión; el prototipo se puede abrir directamente en Chrome.

## Instalar y ejecutar

Desde la carpeta del proyecto:

```powershell
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente <http://localhost:5173/>. En Windows, el proyecto puede invocar el Python Launcher `py -3`; si no lo tienes, instala Python 3.12+ y usa `python`/`python3` en tus propias pruebas. El lanzador del proyecto verifica la versión y muestra errores en lugar de ignorarlos.

## Publicar en GitHub Pages

El workflow [deploy-pages.yml](./.github/workflows/deploy-pages.yml) compila y publica automáticamente el sitio cuando hay cambios en `main` o al ejecutarlo manualmente desde GitHub Actions. En este repositorio el sitio queda en:

<https://josivan111axp.github.io/RoomyCampus-App/>

Para habilitarlo en GitHub:

1. Abre **Settings → Pages** del repositorio.
2. En **Build and deployment → Source**, selecciona **GitHub Actions**.
3. Envía los cambios a la rama `main` (o inicia **Deploy RoomyCampus to GitHub Pages** en la pestaña **Actions**).
4. Espera a que los trabajos `build` y `deploy` terminen correctamente y abre la URL indicada en **Settings → Pages**.

El workflow define la ruta base `/RoomyCampus-App/` para los recursos del sitio. En el build de producción, la navegación usa rutas con hash para que la portada, `/app` y `/admin` funcionen directamente en el hosting estático; el servidor local conserva sus rutas normales. En Pages, las rutas se ven como `/#/app` y `/#/admin`. El modo de guion está disponible con `/#/app?guion` o `/#/admin?guion`.

Comprobaciones locales:

```powershell
npm run build
npm run lint
npm test
py -3 -m unittest discover -s tests
```

## Recorridos del prototipo

| Vista o función | Dónde verla |
|---|---|
| Portada con accesos diferenciados | `/` |
| Iniciar sesión de estudiante (correo `@espol.edu.ec`) | `/app` |
| Crear cuenta de estudiante de demostración | `/registro`; solicita nombre y correo institucional, sin contraseña ni backend |
| Mapa y catálogo ampliado, filtros y orden por precio, calificación o cercanía | `/app`, después del acceso |
| Detalle, desglose de costos, favoritos y visita con fecha seleccionada | Selecciona una tarjeta del mapa o de la lista |
| Contactar al administrador del alojamiento | Detalle → Contactar; el mensaje simulado aparece en `/propietario` → Mensajes |
| Calendario compacto de citas | `/app` → sección “Visitas”; elige un día para consultar sus solicitudes |
| Plan Basic / Pro y pago de demostración | Intenta contactar después de alcanzar el límite Basic |
| Panel gerencial | `/admin`; usa el botón “Entrar como administrador de demo” (`admin@roomycampus.ec`) |
| Páginas de resumen, monitoreo, verificación y analítica | `/admin`; cada opción lateral abre su propia vista explicativa |
| Panel de administrador del alojamiento | `/propietario`; cuenta demo `alojamiento@roomycampus.ec` |
| Comentarios, alertas, consultas y agenda de residentes | `/propietario` → Comentarios y alertas, Mensajes o Visitas |
| Revisión y rechazo de un anuncio sospechoso | Panel → Bandeja de verificación → anuncio reportado |
| Analítica de demanda y precio por m²; exportación CSV | Panel gerencial |
| Control de calendario, ocupación, anuncios y reinicio | Botón flotante “Demo” o atajo `Shift+D` |
| Estado determinista para grabación automatizada | `/app?guion`, `/admin?guion` o `/propietario?guion`; consulta `window.__ROOMYCAMPUS__` |

Para revisar el diseño móvil, abre Chrome DevTools → Device Toolbar → **iPhone 14** (390 × 844) y visita `/app`. La vista administrativa se adapta a pantallas estrechas; su diseño de escritorio está optimizado para 1440 × 900.

## Datos de mapa

El mapa usa teselas de OpenStreetMap y comienza con polígonos y puntos **referenciales** incluidos en `src/data/campus.generated.ts`. Para intentar descargar límites de barrio y accesos de OpenStreetMap, y calcular rutas viales con el servidor público de OSRM:

```powershell
npm run data:campus
```

El generador consulta Nominatim/Overpass para identificar áreas y accesos, y OSRM para rutas **en vehículo**. Vía a la Costa no tiene un límite de barrio identificable en estos datos: el generador utiliza un corredor aproximado derivado de una vía OSM y lo etiqueta como referencial. Si no encuentra una geometría o un acceso, explica el motivo y conserva intactos los datos existentes. Los datos generados no verifican que un acceso sea una garita oficial; compruébalo antes de cualquier uso real. Las distancias a pie de las propiedades de muestra son aproximaciones independientes, no rutas peatonales calculadas por OSRM.

## Panel flotante de demo

| Acción | Efecto |
|---|---|
| Avanzar 1, 3 o 10 días | Cambia la fecha académica; al entrar a matrícula se negocia automáticamente una propiedad de ejemplo |
| Ir a semana de matrícula | Lleva el calendario al día 21; simula demanda ×2,7 y precios +12 % |
| Ocupar 3 propiedades | Cambia hasta tres propiedades disponibles a ocupadas |
| Inyectar anuncio sospechoso | Añade un caso ficticio a la bandeja antifraude |
| Aprobar siguiente pendiente | Aprueba y publica la siguiente propiedad normal pendiente |
| Reiniciar datos de demo | Restaura inventario, calendario, favoritos y visitas iniciales |

El estado se guarda en el navegador y se sincroniza entre pestañas mediante `localStorage`. Los accesos y cuentas de los tres roles son simulados y se mantienen por pestaña; no hay contraseñas, servicio de identidad ni mensajes reales. Las solicitudes de contacto y visitas se comparten localmente para demostrar el panel del alojamiento. En modo `?guion`, el estado inicial se restablece y se expone el store y sus acciones en `window.__ROOMYCAMPUS__` para preparar tomas repetibles.

## Documentación adicional

- [FLUJOS.md](./FLUJOS.md): recorridos de presentación y grabación paso a paso.
- [REQUISITOS.md](./REQUISITOS.md): alcance funcional y no funcional, con estado real frente a simulación.
