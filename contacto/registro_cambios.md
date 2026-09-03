# Registro de Cambios - Página Web de Venta de Gas

Este archivo registra todas las modificaciones realizadas en el código del proyecto.

## Modificaciones

### 1. Creación del Formulario de Contacto en `contacto.html`
- **Fecha:** Actual
- **Archivos afectados:** `contacto/contacto.html`
- **Descripción:** 
  - Se creó la estructura básica de la página de contacto.
  - Se agregó un formulario con campos para: Nombre, Teléfono principal, Teléfono alternativo de respaldo, Correo, Dirección y selección de tipo de balón.

### 2. Aplicación de Estilo Minimalista
- **Fecha:** Actual
- **Archivos afectados:** `contacto/contacto.html`
- **Descripción:** 
  - Se implementó un diseño limpio y moderno con CSS embebido.
  - Se añadió un contenedor tipo tarjeta con bordes redondeados y tipografía sans-serif.

### 3. Adaptación a Vista de Contacto General con Selección de Motivos
- **Fecha:** Actual
- **Archivos afectados:** `contacto/contacto.html`
- **Descripción:** 
  - Se cambió la lógica de "solo pedidos" a una vista de contacto general.
  - Se implementó un selector de "Motivo de contacto" (Pedido, Consulta, Proveedor/Venta, Reclamo).
  - Se ajustó la dirección para ser opcional y se amplió el campo de mensaje.

### 4. Adición de Sección de Números y Canales de Contacto Directo
- **Fecha:** Actual
- **Archivos afectados:** `contacto/contacto.html`
- **Descripción:** 
  - Se incorporó una sección informativa con números de teléfono de ejemplo, WhatsApp y horarios de atención.

### 5. Mejora Estética del Fondo (Efecto Mármol Visible)
- **Fecha:** Actual
- **Archivos afectados:** `contacto/contacto.html`
- **Descripción:** 
  - Se implementó un fondo con efecto mármol utilizando gradientes radiales y un tono gris azulado (`#eef2f3`).
  - Se mejoró la sombra del contenedor para dar profundidad.

### 6. Integración de Logo y Navegación
- **Fecha:** Actual
- **Archivos afectados:** `contacto/contacto.html`
- **Descripción:** 
  - Se añadió la imagen del logo al encabezado.
  - Se vinculó el logo y el título como un enlace hacia la página principal (`index.html`).
  - Se ajustó la ruta a `../index.html` para compatibilidad con la subcarpeta `/contacto`.


### 2. Aplicación de Estilo Minimalista
- **Fecha:** Actual
- **Archivos afectados:** `contacto.html`, `registro_cambios.md`
- **Descripción:** 
  - Se implementó un diseño minimalista, limpio y moderno utilizando CSS embebido dentro de la etiqueta `<style>` de `contacto.html`.
  - Se añadió un contenedor centralizado tipo tarjeta con bordes sutiles, tipografía sans-serif elegante, campos de formulario con diseño moderno y transiciones suaves al enfocar.

### 3. Adaptación a Vista de Contacto General con Selección de Motivos
- **Fecha:** Actual
- **Archivos afectados:** `contacto.html`, `registro_cambios.md`
- **Descripción:** 
  - Se transformó el formulario de un pedido estricto a una **vista de contacto completa**.
  - Se cambió el selector de productos por un **selector de "Motivo de contacto"** (Pedido de Gas, Consulta general, Proveedor/Venta, Reclamo o soporte).
  - Se ajustó la dirección para que sea opcional/general y se amplió el campo de mensaje para detallar cualquier tipo de solicitud.
  - Se actualizó el texto del botón de envío a "Enviar Mensaje".

### 4. Adición de Sección de Números y Canales de Contacto Directo
- **Fecha:** Actual
- **Archivos afectados:** `contacto.html`, `registro_cambios.md`
- **Descripción:** 
  - Se incorporó una sección visual informativa (`.contact-info`) antes del formulario con números de ejemplo (teléfono principal, línea de respaldo, WhatsApp directo y horario de atención) para que los clientes tengan alternativas rápidas de comunicación.

### 7. Separación del Estilo a la Carpeta `Style`
- **Fecha:** 2026-09-03
- **Archivos afectados:** `contacto/contacto.html`, `Style/contacto.css`, `contacto/registro_cambios.md`
- **Descripción:**
  - Se movió el CSS embebido de la vista de contacto a un archivo externo en la carpeta `Style`.
  - Se actualizó el enlace del documento HTML para cargar el estilo desde `../Style/contacto.css`.
  - Se mantuvo la misma identidad visual del diseño, incluyendo fondo tipo mármol, tarjeta central, formulario, sección de contacto y logotipo.
  - Se documentó esta modificación en este registro para dejar trazabilidad de los cambios realizados.
