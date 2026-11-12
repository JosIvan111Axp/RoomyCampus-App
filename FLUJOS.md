# Flujos de demo de RoomyCampus

Los flujos usan cuentas y datos ficticios. El panel “Demo” se abre con el botón flotante o `Shift+D`; se puede cerrar con el botón `×` o el mismo atajo.

## 1. Buscar alojamiento (móvil)

1. Abre `/registro` para crear una cuenta simulada con nombre y correo ESPOL, o `/app` para iniciar sesión. No se usa contraseña ni backend.
2. Usa el mapa, el buscador y los filtros de modalidad, presupuesto o Wifi. Ordena el catálogo por menor precio, calificación o tiempo a pie.
3. Selecciona una propiedad. Revisa la renta, cada servicio, el total mensual, el arrendador y la ruta referencial.
4. Guarda la propiedad o agenda una visita para una fecha futura. La fecha seleccionada aparece en el pequeño calendario de la sección **Visitas**.
5. Contacta al administrador del alojamiento y envía una consulta de demostración. La solicitud queda visible en el panel `/propietario`.

## 2. Compartir ocupación con gerencia

1. Abre una propiedad disponible en `/app`.
2. Pulsa **Reservar habitación · acción de demo**.
3. Abre `/admin` en otra pestaña. La propiedad aparecerá ocupada y el indicador de ocupación se recalculará.

La ocupación se comparte por `localStorage` del mismo navegador; no se sincroniza entre dispositivos ni perfiles del navegador.

## 3. Mostrar estacionalidad

1. Abre el panel flotante **Demo** y pulsa **Ir a semana de matrícula**.
2. En la app móvil verás la fecha académica, el indicador de alta demanda, el factor estimado ×2,7 y el ajuste ilustrativo de precios.
3. Una propiedad disponible pasa a negociación al entrar a la semana de matrícula.
4. En `/admin`, el mapa y el cuadro de mando reflejan inventario y ocupación.
5. Ajusta la velocidad ×1/×3/×10 y avanza el calendario para mostrar el paso de días.

## 4. Revisar una alerta antifraude

1. Abre `/admin` y elige **Verificación** en el menú lateral.
2. Selecciona el anuncio marcado como reportado.
3. Revisa el aviso, el perfil ficticio y la lista sugerida de comprobaciones.
4. Pulsa **Rechazar publicación** y confirma el rechazo. El anuncio sale del mapa y aparece la notificación de demo.
5. Usa **Reiniciar datos de demo** antes de repetir el flujo.

## 6. Administrar un alojamiento

1. Abre `/propietario` y entra con `alojamiento@roomycampus.ec` o con el acceso directo de demostración.
2. En **Resumen** revisa las solicitudes nuevas, visitas y alertas.
3. En **Mensajes**, abre la consulta enviada desde una ficha de estudiante y márcala atendida.
4. En **Comentarios y alertas**, revisa las opiniones y reportes ficticios de residentes.
5. En **Visitas**, consulta las solicitudes del calendario por fecha.

Las cuentas, mensajes, comentarios, propiedades y alertas son datos locales de demo; no representan una comunicación real.

## 7. Aprobar una propiedad y exportar

1. Abre el panel flotante y pulsa **Aprobar siguiente pendiente**. Se publica la propiedad de ejemplo no reportada.
2. En el panel gerencial, pulsa **Exportar datos**. Se descarga `roomycampus-indicadores-demo.csv`.
3. El CSV contiene inventario, estado, renta, servicios, total mensual, área y precio por m².

## 8. Repetir tomas de video

1. Abre directamente `/app?guion`, `/admin?guion` o `/propietario?guion`.
2. El modo guion reinicia el estado y, si entraste directamente al panel, abre su usuario administrador de demostración.
3. El estado y las acciones para avanzar calendario, inyectar fraude, aprobar propiedades, ocupar inventario y reiniciar quedan disponibles en `window.__ROOMYCAMPUS__`.
4. Restablece el modo con la acción `reset()` antes de cada toma.

Las imágenes de ejemplo y teselas requieren conexión. Si no cargan, verifica internet y el panel **Console** de DevTools; los datos cartográficos base referenciales permanecen visibles.
