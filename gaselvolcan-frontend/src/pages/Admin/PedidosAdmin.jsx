import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { pedidosApi, productosApi, usuariosApi } from '../../utils/api.js'
import { obtenerRol } from '../../utils/sesion.js'
import { formatearDinero } from '../../data/catalogo.js'
import {
  ESTADOS_PEDIDO,
  METODOS_PAGO,
  esEstadoFinal,
  estadoPedido,
  formatearFechaHora,
  hoyISO,
  useCarga,
} from './adminUtils.js'
import { Aviso, Cargando, Encabezado, SinResultados } from './components/Comunes.jsx'
import FormPedido from './components/FormPedido.jsx'
import ModalConfirmar from './components/ModalConfirmar.jsx'

export default function PedidosAdmin() {
  const esAdmin = obtenerRol() === 'ADMINISTRADOR'
  const [parametros] = useSearchParams()
  const [estado, setEstado] = useState(parametros.get('estado') ?? '')
  // Por defecto, los pedidos del día (la vista central de la operadora). Vacío = todas las fechas.
  const [fecha, setFecha] = useState(parametros.get('fecha') ?? hoyISO())

  const pedidos = useCarga(() => pedidosApi.listar({ estado, fecha }), [estado, fecha])
  const repartidores = useCarga(() => usuariosApi.repartidores(), [])
  const productos = useCarga(() => productosApi.listar(), [])

  const [aviso, setAviso] = useState({ tipo: 'success', texto: '' })
  // { tipo: 'crear' } | { tipo: 'editar', pedido } | { tipo: 'cancelar', pedido } | { tipo: 'eliminar', pedido }
  const [dialogo, setDialogo] = useState(null)
  const [ocupado, setOcupado] = useState(null) // id del pedido que se está actualizando

  const avisar = (texto, tipo = 'success') => setAviso({ tipo, texto })
  const cerrarDialogo = () => setDialogo(null)
  const recargar = pedidos.recargar

  // Ejecuta una acción sobre un pedido mostrando el resultado.
  const accion = async (pedido, ejecutar, mensaje) => {
    setOcupado(pedido.id)
    try {
      await ejecutar()
      avisar(mensaje)
      recargar()
    } catch (e) {
      avisar(e.message, 'danger')
    } finally {
      setOcupado(null)
    }
  }

  const asignar = (pedido, repartidorId) => {
    const repartidor = repartidores.datos?.find((r) => String(r.id) === repartidorId)
    if (!repartidor) return
    accion(pedido, () => pedidosApi.asignar(pedido.id, repartidor.id, repartidor.nombre),
      `Pedido ${pedido.codigo} asignado a ${repartidor.nombre}.`)
  }

  const cambiarEstado = (pedido, nuevo) => {
    if (nuevo === 'CANCELADO') {
      setDialogo({ tipo: 'cancelar', pedido })
      return
    }
    accion(pedido, () => pedidosApi.cambiarEstado(pedido.id, nuevo),
      `Pedido ${pedido.codigo}: ${estadoPedido(nuevo).texto.toLowerCase()}.`)
  }

  const guardar = async (datos) => {
    if (dialogo.tipo === 'crear') {
      const creado = await pedidosApi.crear(datos)
      avisar(`Pedido ${creado.codigo} creado. Ahora asígnale un repartidor.`)
    } else {
      await pedidosApi.actualizar(dialogo.pedido.id, datos)
      avisar(`Pedido ${dialogo.pedido.codigo} actualizado.`)
    }
    cerrarDialogo()
    recargar()
    productos.recargar() // el stock cambió
  }

  const lista = pedidos.datos ?? []

  return (
    <>
      <Encabezado
        titulo="Pedidos"
        descripcion="Asigna repartidores, cambia estados y registra pedidos tomados por teléfono."
        acciones={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={recargar}>Actualizar</button>
            <button type="button" className="btn btn-primary" onClick={() => setDialogo({ tipo: 'crear' })} disabled={!productos.datos}>
              + Nuevo pedido
            </button>
          </>
        }
      />

      <Aviso tipo={aviso.tipo} onCerrar={() => avisar('')}>{aviso.texto}</Aviso>
      <Aviso tipo="danger">{pedidos.error || repartidores.error}</Aviso>

      <section className="admin-tarjeta">
        <div className="admin-filtros">
          <div>
            <label htmlFor="filtro-estado" className="form-label">Estado</label>
            <select id="filtro-estado" className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos</option>
              {ESTADOS_PEDIDO.map((e) => <option key={e.id} value={e.id}>{e.texto}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-fecha" className="form-label">Fecha</label>
            <input id="filtro-fecha" type="date" className="form-control" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setFecha(hoyISO())}>Hoy</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setFecha('')}>Todas las fechas</button>
          </div>
        </div>

        {pedidos.cargando ? (
          <Cargando />
        ) : lista.length === 0 ? (
          <SinResultados>No hay pedidos para este filtro.</SinResultados>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover admin-tabla">
              <caption className="visually-hidden">Pedidos</caption>
              <thead>
                <tr>
                  <th scope="col">Pedido</th>
                  <th scope="col">Cliente</th>
                  <th scope="col" className="d-none d-lg-table-cell">Dirección</th>
                  <th scope="col" className="d-none d-md-table-cell">Productos</th>
                  <th scope="col" className="text-end">Total</th>
                  <th scope="col">Repartidor</th>
                  <th scope="col">Estado</th>
                  <th scope="col" className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => {
                  const final = esEstadoFinal(p.estado)
                  const info = estadoPedido(p.estado)
                  const puedeAsignar = p.estado === 'PENDIENTE' || p.estado === 'ASIGNADO'
                  return (
                    <tr key={p.id} aria-busy={ocupado === p.id}>
                      <td className="text-nowrap">
                        <span className="fw-semibold">{p.codigo}</span>
                        <div className="admin-muted">{formatearFechaHora(p.creadoEn)}</div>
                      </td>
                      <td>
                        {p.clienteNombre}
                        <div className="admin-muted">{p.telefono}</div>
                      </td>
                      <td className="d-none d-lg-table-cell">
                        {p.calle}{p.depto ? `, ${p.depto}` : ''}
                        <div className="admin-muted">{p.comuna}{p.franja ? ` · ${p.franja}` : ''}</div>
                      </td>
                      <td className="d-none d-md-table-cell">
                        {p.lineas.map((l) => (
                          <div key={l.codigo}>{l.cantidad}× {l.nombre}</div>
                        ))}
                      </td>
                      <td className="text-end">
                        {formatearDinero(p.total)}
                        <div className="admin-muted">
                          {METODOS_PAGO[p.metodoPago]}
                          {p.pagado && <span className="badge text-bg-success ms-1">Pagado</span>}
                        </div>
                      </td>
                      <td>
                        {puedeAsignar ? (
                          <select
                            className="form-select form-select-sm select-compacto"
                            aria-label={`Repartidor del pedido ${p.codigo}`}
                            value={p.repartidorId ?? ''}
                            onChange={(e) => asignar(p, e.target.value)}
                            disabled={ocupado === p.id || !repartidores.datos}
                          >
                            <option value="" disabled>Sin asignar</option>
                            {(repartidores.datos ?? []).map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                          </select>
                        ) : (
                          p.repartidorNombre ?? '—'
                        )}
                      </td>
                      <td>
                        {final ? (
                          <span className={`badge ${info.clase}`}>{info.texto}</span>
                        ) : (
                          <select
                            className="form-select form-select-sm select-compacto"
                            aria-label={`Estado del pedido ${p.codigo}`}
                            value={p.estado}
                            onChange={(e) => cambiarEstado(p, e.target.value)}
                            disabled={ocupado === p.id}
                          >
                            {ESTADOS_PEDIDO.map((e) => (
                              <option
                                key={e.id}
                                value={e.id}
                                // Sin repartidor no se puede pasar a asignado/en camino/entregado.
                                disabled={!p.repartidorId && ['ASIGNADO', 'EN_CAMINO', 'ENTREGADO'].includes(e.id)}
                              >
                                {e.texto}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="acciones">
                        {!final && (
                          <button type="button" className="btn btn-sm btn-outline-primary"
                            onClick={() => setDialogo({ tipo: 'editar', pedido: p })} aria-label={`Editar pedido ${p.codigo}`}>
                            Editar
                          </button>
                        )}
                        {esAdmin && (
                          <button type="button" className="btn btn-sm btn-outline-danger"
                            onClick={() => setDialogo({ tipo: 'eliminar', pedido: p })} aria-label={`Eliminar pedido ${p.codigo}`}>
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {lista.length > 0 && (
          <p className="admin-muted mt-3 mb-0">
            {lista.length} {lista.length === 1 ? 'pedido' : 'pedidos'} · Total {formatearDinero(lista.reduce((s, p) => s + (p.estado === 'CANCELADO' ? 0 : p.total), 0))} (sin cancelados)
          </p>
        )}
      </section>

      {(dialogo?.tipo === 'crear' || dialogo?.tipo === 'editar') && (
        <FormPedido
          pedido={dialogo.pedido}
          productos={productos.datos ?? []}
          onGuardar={guardar}
          onCerrar={cerrarDialogo}
        />
      )}

      {dialogo?.tipo === 'cancelar' && (
        <ModalConfirmar
          titulo={`Cancelar pedido ${dialogo.pedido.codigo}`}
          mensaje="El pedido quedará cancelado y los productos vuelven al stock. Esta acción no se puede deshacer."
          textoConfirmar="Cancelar pedido"
          onConfirmar={async () => {
            await pedidosApi.cambiarEstado(dialogo.pedido.id, 'CANCELADO')
            avisar(`Pedido ${dialogo.pedido.codigo} cancelado.`)
            recargar()
          }}
          onCerrar={cerrarDialogo}
        />
      )}

      {dialogo?.tipo === 'eliminar' && (
        <ModalConfirmar
          titulo={`Eliminar pedido ${dialogo.pedido.codigo}`}
          mensaje={
            esEstadoFinal(dialogo.pedido.estado)
              ? 'Se borrará el pedido del historial (y su pago registrado, si lo tiene).'
              : 'Se borrará el pedido y sus productos vuelven al stock.'
          }
          onConfirmar={async () => {
            await pedidosApi.eliminar(dialogo.pedido.id)
            avisar(`Pedido ${dialogo.pedido.codigo} eliminado.`)
            recargar()
          }}
          onCerrar={cerrarDialogo}
        />
      )}
    </>
  )
}
