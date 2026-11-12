# Flujos de demo de RoomyCampus

Los flujos usan cuentas y datos ficticios. El panel “Demo” se abre con el botón flotante o `Shift+D`; se puede cerrar con el botón `×` o el mismo atajo.

## 1. Buscar alojamiento (móvil)

1. Abre `/app` y escribe un correo terminado en `@espol.edu.ec`, por ejemplo `estudiante@espol.edu.ec`.
2. Usa el mapa, el buscador y los filtros de modalidad, presupuesto o Wifi.
3. Selecciona una propiedad. Revisa la renta, cada servicio, el total mensual, el arrendador y la ruta referencial.
4. Guarda la propiedad o agenda una visita. Ambos cambios permanecen en el mismo navegador.
5. Contacta al arrendador. El aviso confirma un contacto simulado.

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

1. Abre `/admin` y baja a **Bandeja de verificación**.
2. Selecciona el anuncio marcado como reportado.
3. Revisa el aviso, el perfil ficticio y la lista sugerida de comprobaciones.
4. Pulsa **Rechazar publicación** y confirma el rechazo. El anuncio sale del mapa y aparece la notificación de demo.
5. Usa **Reiniciar datos de demo** antes de repetir el flujo.

## 5. Aprobar una propiedad y exportar

1. Abre el panel flotante y pulsa **Aprobar siguiente pendiente**. Se publica la propiedad de ejemplo no reportada.
2. En el panel gerencial, pulsa **Exportar datos**. Se descarga `roomycampus-indicadores-demo.csv`.
3. El CSV contiene inventario, estado, renta, servicios, total mensual, área y precio por m².

## 6. Repetir tomas de video

1. Abre directamente `/app?guion` o `/admin?guion`.
2. El modo guion reinicia el estado y, si entraste directamente al panel, abre su usuario administrador de demostración.
3. El estado y las acciones para avanzar calendario, inyectar fraude, aprobar propiedades, ocupar inventario y reiniciar quedan disponibles en `window.__ROOMYCAMPUS__`.
4. Restablece el modo con la acción `reset()` antes de cada toma.

Las imágenes de ejemplo y teselas requieren conexión. Si no cargan, verifica internet y el panel **Console** de DevTools; los datos cartográficos base referenciales permanecen visibles.
