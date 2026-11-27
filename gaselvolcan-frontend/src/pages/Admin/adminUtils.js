import { useCallback, useEffect, useState } from 'react'

export const ETIQUETA_ROL = {
  ADMINISTRADOR: 'Administrador',
  OPERADORA: 'Operadora',
  REPARTIDOR: 'Repartidor',
  CLIENTE: 'Cliente',
}
export const ROLES = Object.keys(ETIQUETA_ROL)

export const CLASE_ROL = {
  ADMINISTRADOR: 'text-bg-dark',
  OPERADORA: 'text-bg-primary',
  REPARTIDOR: 'text-bg-info',
  CLIENTE: 'text-bg-light border',
}

// Mismo orden que el ciclo de vida del pedido en pedidos-service.
export const ESTADOS_PEDIDO = [
  { id: 'PENDIENTE', texto: 'Pendiente', clase: 'text-bg-warning' },
  { id: 'ASIGNADO', texto: 'Asignado', clase: 'text-bg-info' },
  { id: 'EN_CAMINO', texto: 'En camino', clase: 'text-bg-primary' },
  { id: 'ENTREGADO', texto: 'Entregado', clase: 'text-bg-success' },
  { id: 'CANCELADO', texto: 'Cancelado', clase: 'text-bg-secondary' },
]

export function estadoPedido(id) {
  return ESTADOS_PEDIDO.find((e) => e.id === id) ?? { id, texto: id, clase: 'text-bg-light' }
}

export const esEstadoFinal = (estado) => estado === 'ENTREGADO' || estado === 'CANCELADO'

export const METODOS_PAGO = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
}

// Las mismas comunas que acepta el checkout y el backend.
export const COMUNAS = ['Chillán', 'Chillán Viejo', 'Coihueco', 'Pinto', 'Bulnes', 'San Carlos']

export const FRANJAS = [
  'Lo antes posible',
  'Mañana (9:00 - 13:00)',
  'Tarde (14:00 - 18:00)',
  'Noche (18:00 - 21:00)',
]

// Celular chileno: 912345678 o +56912345678 (con o sin espacios).
export function telefonoValido(valor) {
  const digitos = String(valor || '').replace(/\D/g, '')
  return (digitos.length === 9 && digitos.startsWith('9')) || (digitos.length === 11 && digitos.startsWith('569'))
}

// Fecha local de hoy en formato AAAA-MM-DD (el que usa <input type="date"> y la API).
export function hoyISO() {
  const ahora = new Date()
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

// "2026-11-13T17:42:10" → "13-11, 17:42"
export function formatearFechaHora(iso) {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return fecha.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function formatearFecha(iso) {
  if (!iso) return '—'
  const fecha = new Date(iso)
  return Number.isNaN(fecha.getTime()) ? iso : fecha.toLocaleDateString('es-CL')
}

/**
 * Carga datos de la API y los vuelve a pedir cuando cambian las dependencias o se llama a recargar().
 * Devuelve { datos, error, cargando, recargar }.
 */
export function useCarga(cargar, dependencias = []) {
  const [estado, setEstado] = useState({ datos: null, error: '', cargando: true })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let vigente = true
    cargar().then(
      (datos) => {
        if (vigente) setEstado({ datos, error: '', cargando: false })
      },
      (error) => {
        if (vigente) setEstado((previo) => ({ ...previo, error: error.message, cargando: false }))
      },
    )
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, version])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])
  return { ...estado, recargar }
}
