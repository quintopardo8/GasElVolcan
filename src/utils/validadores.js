export function estaVacio(valor) {
  return valor === null || valor === undefined || String(valor).trim() === "";
}

export function obligatorio(valor, mensaje = "Este campo es obligatorio") {
  return estaVacio(valor) ? mensaje : null;
}

export function longitudMinima(valor, minimo, mensaje) {
  if (estaVacio(valor)) return null;
  return String(valor).trim().length < minimo ? mensaje || `Debe tener al menos ${minimo} caracteres` : null;
}

export function longitudMaxima(valor, maximo, mensaje) {
  if (estaVacio(valor)) return null;
  return String(valor).trim().length > maximo ? mensaje || `No puede superar ${maximo} caracteres` : null;
}

export function soloLetras(valor, mensaje = "Usa solo letras y espacios") {
  if (estaVacio(valor)) return null;
  return /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]+$/.test(String(valor).trim()) ? null : mensaje;
}

export function telefonoChileno(valor, mensaje = "Ingresa un celular chileno válido") {
  if (estaVacio(valor)) return null;
  const digitos = String(valor).replace(/\D/g, "");
  return (digitos.length === 9 && digitos.startsWith("9")) || (digitos.length === 11 && digitos.startsWith("569")) ? null : mensaje;
}

export function correoValido(valor, mensaje = "Ingresa un correo electrónico válido") {
  if (estaVacio(valor)) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).trim()) ? null : mensaje;
}

export function validarNombre(valor) {
  return obligatorio(valor, "El nombre completo es obligatorio") || longitudMinima(valor, 3, "El nombre debe tener al menos 3 caracteres") || longitudMaxima(valor, 60, "El nombre no puede superar 60 caracteres") || soloLetras(valor, "El nombre solo puede contener letras y espacios");
}

export function validarTelefono(valor, esObligatorio = true) {
  const errorObligatorio = esObligatorio ? obligatorio(valor, "El teléfono principal es obligatorio") : null;
  return errorObligatorio || telefonoChileno(valor, "Ingresa un celular válido de 9 dígitos (ej: 912345678)");
}

export function validarMotivo(valor) {
  return ["pedido", "consulta", "proveedor", "reclamo"].includes(valor) ? null : "Selecciona un motivo de contacto válido";
}

export function validarDireccion(valor) {
  return longitudMaxima(valor, 120, "La dirección no puede superar 120 caracteres");
}

export function validarMensaje(valor) {
  return obligatorio(valor, "El mensaje es obligatorio") || longitudMinima(valor, 10, "El mensaje debe tener al menos 10 caracteres") || longitudMaxima(valor, 500, "El mensaje no puede superar 500 caracteres");
}
