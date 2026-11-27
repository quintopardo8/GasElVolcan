export function estaVacio(valor) {
  if (valor === null || valor === undefined) {
    return true;
  }
  if (typeof valor === "boolean") {
    return false;
  }
  return String(valor).trim() === "";
}

export function obligatorio(valor, mensaje = "Este campo es obligatorio") {
  return estaVacio(valor) ? mensaje : null;
}

export function longitudMinima(valor, minimo, mensaje) {
  if (estaVacio(valor)) {
    return null;
  }
  const texto = String(valor).trim();
  return texto.length < minimo
    ? mensaje || `Debe tener al menos ${minimo} caracteres`
    : null;
}

export function longitudMaxima(valor, maximo, mensaje) {
  if (estaVacio(valor)) {
    return null;
  }
  const texto = String(valor).trim();
  return texto.length > maximo
    ? mensaje || `No puede superar ${maximo} caracteres`
    : null;
}

export function validarCorreo(valor) {
  return (
    obligatorio(valor, "El correo es obligatorio") ||
    longitudMinima(valor, 5, "El correo debe tener al menos 5 caracteres") ||
    longitudMaxima(valor, 120, "El correo no puede superar 120 caracteres") ||
    (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).trim())
      ? "Ingresa un correo válido, por ejemplo: usuario@correo.com"
      : null)
  );
}

export function validarContrasena(valor) {
  return (
    obligatorio(valor, "La contraseña es obligatoria") ||
    longitudMinima(valor, 6, "La contraseña debe tener al menos 6 caracteres") ||
    longitudMaxima(valor, 50, "La contraseña no puede superar 50 caracteres")
  );
}

export function validarNombre(valor) {
  return (
    obligatorio(valor, "El nombre es obligatorio") ||
    longitudMinima(valor, 2, "El nombre debe tener al menos 2 caracteres") ||
    longitudMaxima(valor, 60, "El nombre no puede superar 60 caracteres")
  );
}

export function validarConfirmacion(contrasena, confirmacion) {
  return (
    obligatorio(confirmacion, "Confirma tu contraseña") ||
    (String(contrasena) !== String(confirmacion)
      ? "Las contraseñas no coinciden"
      : null)
  );
}


// esto va a aceptar espacios, guiones y paréntesis, 
// aprueba de desentendidos (ojala): "+56 9 1234 5678", "912345678"
export function validarTelefono(valor) {
  if (estaVacio(valor)) {
    return "El teléfono es obligatorio";
  }
  const limpio = String(valor).replace(/[\s\-()]/g, "");
  return /^(\+?56)?9\d{8}$/.test(limpio)
    ? null
    : "Ingresa un celular chileno válido, por ejemplo: +56 9 1234 5678";
}
