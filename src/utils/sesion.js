// Sesión simulada mientras no haya backend: solo recuerda que el cliente ingresó y su nombre.
const CLAVE = 'gev:sesion'

export function obtenerSesion() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE))
    return sesion && sesion.nombre ? sesion : null
  } catch {
    return null
  }
}

export function haySesion() {
  return obtenerSesion() !== null
}

export function iniciarSesion(nombre) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ nombre }))
  } catch {
    // Sin almacenamiento (modo privado, etc.): no se puede recordar la sesión.
  }
}

export function cerrarSesion() {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    // Nada que borrar.
  }
}

// "camila.rojas@correo.cl" → "Camila"
export function nombreDesdeCorreo(correo) {
  const nombre = String(correo).split('@')[0].split(/[._\-0-9]/)[0] || 'cliente'
  return nombre.charAt(0).toUpperCase() + nombre.slice(1)
}

// "Camila Rojas" → "Camila"
export function primerNombre(nombreCompleto) {
  return String(nombreCompleto).trim().split(/\s+/)[0]
}
