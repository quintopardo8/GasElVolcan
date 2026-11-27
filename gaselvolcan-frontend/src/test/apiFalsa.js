import { vi } from 'vitest'
import { CATEGORIAS, PRODUCTOS } from '../data/catalogo.js'

const respuesta = (cuerpo, estado = 200) => ({
  ok: estado >= 200 && estado < 300,
  status: estado,
  text: () => Promise.resolve(cuerpo === undefined ? '' : JSON.stringify(cuerpo)),
})

let ultimoId = 41

/**
 * fetch falso para los tests: imita al backend.
 * - GET /api/productos y /api/categorias responden con el catálogo local (como la base de datos inicial).
 * - POST /api/pedidos crea un pedido con código EV-000NN.
 * - Cualquier otra llamada consume, en orden, las respuestas indicadas ({ cuerpo, estado }).
 */
export function crearFetchFalso(respuestas = []) {
  const cola = [...respuestas]
  return vi.fn((url, opciones = {}) => {
    const metodo = opciones.method || 'GET'
    const ruta = String(url)
    if (metodo === 'GET' && ruta.startsWith('/api/productos')) {
      return Promise.resolve(respuesta(PRODUCTOS.map((p) => ({ ...p, activo: true }))))
    }
    if (metodo === 'GET' && ruta.startsWith('/api/categorias')) {
      return Promise.resolve(respuesta(CATEGORIAS.map((nombre, i) => ({ id: i + 1, nombre }))))
    }
    if (metodo === 'POST' && ruta === '/api/pedidos' && cola.length === 0) {
      const cuerpo = JSON.parse(opciones.body)
      const total = cuerpo.lineas.reduce(
        (acc, l) => acc + PRODUCTOS.find((p) => p.codigo === l.codigo).precio * l.cantidad, 0)
      ultimoId += 1
      return Promise.resolve(respuesta({
        id: ultimoId, codigo: `EV-${String(ultimoId).padStart(5, '0')}`, estado: 'PENDIENTE', total, ...cuerpo,
      }, 201))
    }
    const siguiente = cola.shift()
    return Promise.resolve(siguiente ? respuesta(siguiente.cuerpo, siguiente.estado) : respuesta({ mensaje: 'No encontrado' }, 404))
  })
}
