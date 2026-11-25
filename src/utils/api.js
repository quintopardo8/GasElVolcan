// Cliente HTTP para los microservicios.
// Las rutas son relativas (/api/...): en desarrollo las redirige el proxy de Vite (vite.config.js)
// y en Docker las redirige nginx (nginx.conf). Así el navegador nunca habla con otro origen.
import { cerrarSesion, obtenerToken } from './sesion.js'

const BASE = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(mensaje, estado, campos = null) {
    super(mensaje)
    this.name = 'ApiError'
    this.estado = estado
    this.campos = campos
  }
}

export async function api(ruta, { metodo = 'GET', cuerpo } = {}) {
  const token = obtenerToken()
  const headers = { Accept: 'application/json' }
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(BASE + ruta, {
      method: metodo,
      headers,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa que el backend esté levantado.', 0)
  }

  const texto = await respuesta.text()
  let datos = null
  try {
    datos = texto ? JSON.parse(texto) : null
  } catch {
    datos = null
  }

  if (!respuesta.ok) {
    // Token vencido o inválido: se cierra la sesión y se vuelve al login.
    // (No aplica al login: ahí 401 significa "correo o contraseña incorrectos".)
    if (respuesta.status === 401 && token && !ruta.startsWith('/api/auth/login')) {
      cerrarSesion()
      window.location.assign('/iniciar-sesion?expirada=1')
    }
    const campos = datos?.campos || null
    const mensaje =
      (campos && Object.values(campos)[0]) ||
      datos?.mensaje ||
      ([502, 503, 504].includes(respuesta.status)
        ? 'El servidor no está disponible en este momento.'
        : `Error ${respuesta.status}`)
    throw new ApiError(mensaje, respuesta.status, campos)
  }
  return datos
}

export const apiGet = (ruta) => api(ruta)
export const apiPost = (ruta, cuerpo) => api(ruta, { metodo: 'POST', cuerpo })
export const apiPut = (ruta, cuerpo) => api(ruta, { metodo: 'PUT', cuerpo })
export const apiPatch = (ruta, cuerpo) => api(ruta, { metodo: 'PATCH', cuerpo })
export const apiDelete = (ruta) => api(ruta, { metodo: 'DELETE' })

// ---------- Endpoints ----------

export const auth = {
  login: (correo, contrasena) => apiPost('/api/auth/login', { correo, contrasena }),
  registro: (datos) => apiPost('/api/auth/registro', datos),
}

export const usuariosApi = {
  listar: ({ rol = '', buscar = '' } = {}) => apiGet(`/api/usuarios${consulta({ rol, buscar })}`),
  repartidores: () => apiGet('/api/usuarios/repartidores'),
  crear: (datos) => apiPost('/api/usuarios', datos),
  actualizar: (id, datos) => apiPut(`/api/usuarios/${id}`, datos),
  cambiarActivo: (id, activo) => apiPatch(`/api/usuarios/${id}/activo`, { activo }),
  eliminar: (id) => apiDelete(`/api/usuarios/${id}`),
}

export const productosApi = {
  listar: ({ todos = false } = {}) => apiGet(`/api/productos${todos ? '?todos=true' : ''}`),
  crear: (datos) => apiPost('/api/productos', datos),
  actualizar: (codigo, datos) => apiPut(`/api/productos/${encodeURIComponent(codigo)}`, datos),
  cambiarStock: (codigo, stock) => apiPatch(`/api/productos/${encodeURIComponent(codigo)}/stock`, { stock }),
  eliminar: (codigo) => apiDelete(`/api/productos/${encodeURIComponent(codigo)}`),
  categorias: () => apiGet('/api/categorias'),
}

export const pedidosApi = {
  listar: ({ estado = '', fecha = '' } = {}) => apiGet(`/api/pedidos${consulta({ estado, fecha })}`),
  crear: (datos) => apiPost('/api/pedidos', datos),
  actualizar: (id, datos) => apiPut(`/api/pedidos/${id}`, datos),
  asignar: (id, repartidorId, repartidorNombre) =>
    apiPatch(`/api/pedidos/${id}/asignar`, { repartidorId, repartidorNombre }),
  cambiarEstado: (id, estado) => apiPatch(`/api/pedidos/${id}/estado`, { estado }),
  eliminar: (id) => apiDelete(`/api/pedidos/${id}`),
  resumen: () => apiGet('/api/reportes/resumen'),
}

// { rol: 'CLIENTE', buscar: '' } → "?rol=CLIENTE"
function consulta(parametros) {
  const params = new URLSearchParams()
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== '' && valor !== null && valor !== undefined) params.set(clave, valor)
  })
  const texto = params.toString()
  return texto ? `?${texto}` : ''
}
