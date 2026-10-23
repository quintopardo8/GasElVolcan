import { buscarProducto } from '../data/catalogo.js'

// El checkout guarda aquí el pedido al confirmarlo; el inicio lo lee para mostrar
// el seguimiento y enlazar a /rastreo.
const CLAVE = 'gev:pedidoEnCurso'

// Mismos pasos que muestra la página de Rastreo.
export const ESTADOS_PEDIDO = [
  { id: 'confirmado', nombre: 'Pedido confirmado' },
  { id: 'preparado', nombre: 'Pedido preparado', nota: 'Tus cilindros están listos' },
  { id: 'en-camino', nombre: 'En camino a tu domicilio', nota: 'Síguelo en el mapa' },
  { id: 'entregado', nombre: 'Pedido entregado', nota: 'El pago queda registrado' },
]

/**
 * Forma esperada:
 * { id: 'EV-48213', hora: '17:42', estado: 'en-camino', lineas: [{ id: 'CL003', cantidad: 1 }] }
 * (id = código del producto en data/catalogo.js)
 */
export function guardarPedidoEnCurso(pedido) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(pedido))
  } catch {
    // Sin almacenamiento (modo privado, etc.): el inicio simplemente no mostrará el pedido.
  }
}

export function limpiarPedidoEnCurso() {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    // Nada que limpiar.
  }
}

export function obtenerPedidoEnCurso() {
  let pedido
  try {
    pedido = JSON.parse(localStorage.getItem(CLAVE))
  } catch {
    return null
  }
  if (!pedido || !pedido.id || !Array.isArray(pedido.lineas)) return null

  const lineas = pedido.lineas
    .map((l) => ({ ...buscarProducto(l.id), cantidad: l.cantidad }))
    .filter((l) => l.precio && l.cantidad > 0)
  if (lineas.length === 0) return null

  return {
    ...pedido,
    lineas,
    total: lineas.reduce((acc, l) => acc + l.precio * l.cantidad, 0),
  }
}
