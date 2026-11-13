// Sesión del usuario guardada en el navegador.
// Con el backend guarda también el token JWT y el rol que devuelve /api/auth/login.
const CLAVE = 'gev:sesion'

// Roles que pueden entrar al panel de administración.
export const ROLES_PERSONAL = ['ADMINISTRADOR', 'OPERADORA']

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

/**
 * Guarda la sesión.
 * @param {string} nombre nombre a mostrar en el navbar
 * @param {{ token?: string, rol?: string, id?: number, correo?: string }} [extra] datos que entrega el backend
 */
export function iniciarSesion(nombre, extra = {}) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ ...extra, nombre }))
  } catch {
    // Sin almacenamiento (modo privado, etc.): no se puede recordar la sesión.
  }
}

/** Guarda la respuesta de /api/auth/login o /api/auth/registro: { token, usuario }. */
export function guardarSesionDesdeApi({ token, usuario }) {
  iniciarSesion(primerNombre(usuario.nombre), {
    token,
    rol: usuario.rol,
    id: usuario.id,
    correo: usuario.correo,
  })
}

export function cerrarSesion() {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    // Nada que borrar.
  }
}

export function obtenerToken() {
  return obtenerSesion()?.token || null
}

export function obtenerRol() {
  return obtenerSesion()?.rol || null
}

export function esPersonal(rol = obtenerRol()) {
  return ROLES_PERSONAL.includes(rol)
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
