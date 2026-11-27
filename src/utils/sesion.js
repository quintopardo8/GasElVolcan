// Sesión del usuario guardada en el navegador.
// Con el backend guarda también el token JWT y el rol que devuelve /api/auth/login.
const CLAVE = 'gev:sesion'
const CLAVE_EXPIRADA = 'gev:sesionExpirada'

// Roles que pueden entrar al panel de administración.
export const ROLES_PERSONAL = ['ADMINISTRADOR', 'OPERADORA']

// Gestión de sesión en el frontend:
// - Al iniciar sesión se guarda { token, rol, id, correo, nombre } en localStorage,
//   por eso la sesión sobrevive a una recarga de la página (F5).
// - El token JWT trae su fecha de vencimiento (claim "exp"): si ya venció, la sesión
//   se descarta sola y el usuario vuelve al login (ver también <VigilanteSesion> en App.jsx).
// - Cada llamada a la API adjunta "Authorization: Bearer <token>" (ver utils/api.js).

export function obtenerSesion() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE))
    if (!sesion || !sesion.nombre) return null
    if (sesion.token && tokenVencido(sesion.token)) {
      localStorage.removeItem(CLAVE)
      // Para que el login explique por qué se pidió de nuevo la contraseña.
      sessionStorage.setItem(CLAVE_EXPIRADA, '1')
      return null
    }
    return sesion
  } catch {
    return null
  }
}

/** Lee el payload del JWT (sin verificar la firma: eso lo hace el backend). */
export function leerPayloadToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/** Milisegundos que le quedan al token, o null si no trae fecha de vencimiento. */
export function msHastaVencer(token = obtenerTokenCrudo()) {
  const exp = token ? leerPayloadToken(token)?.exp : null
  return typeof exp === 'number' ? exp * 1000 - Date.now() : null
}

function tokenVencido(token) {
  const restante = msHastaVencer(token)
  return restante !== null && restante <= 0
}

function obtenerTokenCrudo() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE))?.token || null
  } catch {
    return null
  }
}

/** true si la última sesión se descartó porque venció el token (el login lo avisa). */
export function avisoExpiradaPendiente() {
  try {
    return sessionStorage.getItem(CLAVE_EXPIRADA) === '1'
  } catch {
    return false
  }
}

export function limpiarAvisoExpirada() {
  try {
    sessionStorage.removeItem(CLAVE_EXPIRADA)
  } catch {
    // Nada que limpiar.
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
