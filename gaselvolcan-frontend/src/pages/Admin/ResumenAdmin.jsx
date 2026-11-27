import { Link } from 'react-router-dom'
import { pedidosApi } from '../../utils/api.js'
import { obtenerSesion } from '../../utils/sesion.js'
import { formatearDinero } from '../../data/catalogo.js'
import { useCarga } from './adminUtils.js'
import { Aviso, Cargando, Encabezado } from './components/Comunes.jsx'

function Kpi({ titulo, valor, nota, destacado = false, enlace }) {
  const contenido = (
    <>
      <div className="admin-kpi-titulo">{titulo}</div>
      <div className="admin-kpi-valor">{valor}</div>
      {nota && <div className="admin-kpi-nota">{nota}</div>}
    </>
  )
  const clase = `admin-kpi ${destacado ? 'destacado' : ''}`
  return enlace ? <Link to={enlace} className={clase}>{contenido}</Link> : <div className={clase}>{contenido}</div>
}

export default function ResumenAdmin() {
  const sesion = obtenerSesion()
  const { datos, error, cargando, recargar } = useCarga(() => pedidosApi.resumen(), [])

  return (
    <>
      <Encabezado
        titulo="Resumen del día"
        descripcion={`Hola, ${sesion?.nombre ?? ''}. Así va la operación de hoy.`}
        acciones={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={recargar}>Actualizar</button>
            <Link to="/admin/pedidos" className="btn btn-primary">Ver pedidos</Link>
          </>
        }
      />

      <Aviso tipo="danger">{error}</Aviso>

      {cargando && <Cargando />}

      {datos && (
        <>
          <div className="admin-kpis">
            <Kpi titulo="Pedidos de hoy" valor={datos.pedidosHoy} enlace="/admin/pedidos" />
            <Kpi
              titulo="Por asignar"
              valor={datos.pendientes}
              nota={datos.pendientes > 0 ? 'Esperan repartidor' : 'Nada pendiente'}
              destacado={datos.pendientes > 0}
              enlace="/admin/pedidos?estado=PENDIENTE&fecha="
            />
            <Kpi titulo="En reparto" valor={datos.enCurso} nota="Asignados o en camino" />
            <Kpi titulo="Entregados hoy" valor={datos.entregadosHoy} />
            <Kpi titulo="Ventas del día" valor={formatearDinero(datos.ventasHoy)} nota="Pagos registrados al entregar" />
          </div>

          <section className="admin-tarjeta mt-4" aria-labelledby="titulo-stock-bajo">
            <h2 id="titulo-stock-bajo">Stock bajo (≤ {datos.umbralStockBajo} unidades)</h2>
            {datos.stockBajo.length === 0 ? (
              <p className="admin-muted mb-0">Todos los productos están sobre el mínimo.</p>
            ) : (
              <div className="table-responsive">
                <table className="table admin-tabla">
                  <thead>
                    <tr>
                      <th scope="col">Código</th>
                      <th scope="col">Producto</th>
                      <th scope="col" className="text-end">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.stockBajo.map((p) => (
                      <tr key={p.codigo}>
                        <td>{p.codigo}</td>
                        <td>{p.nombre}</td>
                        <td className="text-end">
                          <span className={`badge ${p.stock === 0 ? 'text-bg-danger' : 'text-bg-warning'}`}>{p.stock}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {sesion?.rol === 'ADMINISTRADOR' && (
              <Link to="/admin/productos" className="d-inline-block mt-2">Ajustar stock →</Link>
            )}
          </section>
        </>
      )}
    </>
  )
}
