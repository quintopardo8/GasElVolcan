// Catálogo de cilindros. Lo usan el inicio, el pedido en curso y (más adelante) el catálogo y el checkout.
export const PRODUCTOS = [
  { id: 'c5', kg: 5, nombre: 'Cilindro 5 kg', corto: '5 kg', uso: 'Para estufas, anafes y cocinas pequeñas.', precio: 13500 },
  { id: 'c11', kg: 11, nombre: 'Cilindro 11 kg', corto: '11 kg', uso: 'El formato del hogar: cocina, calefón y estufa.', precio: 23900 },
  { id: 'c15', kg: 15, nombre: 'Cilindro 15 kg', corto: '15 kg', uso: 'Para alto consumo, familias grandes o negocios.', precio: 31900 },
]

export function buscarProducto(id) {
  return PRODUCTOS.find((p) => p.id === id)
}

export function formatearDinero(monto) {
  return '$' + String(Math.round(monto)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
