import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { actualizarPedidoEnCurso, ESTADO_DESDE_API, obtenerPedidoEnCurso } from '../../utils/pedidoEnCurso.js'
import { pedidosApi } from '../../utils/api.js'
import { haySesion } from '../../utils/sesion.js'
import ResumenPedido from './components/ResumenPedido.jsx'
import MapaReparto from './components/MapaReparto.jsx'
import LineaTiempo from './components/LineaTiempo.jsx'
import DetalleEntrega from './components/DetalleEntrega.jsx'
import './Rastreo.css'

// Cada cuánto se pregunta al backend por el estado del pedido.
const INTERVALO_MS = 10_000
const ESTADOS_FINALES = ['entregado', 'cancelado']

export default function Rastreo() {
  // El checkout guarda el pedido al confirmarlo; su estado se mantiene al día con el backend.
  const [pedido, setPedido] = useState(obtenerPedidoEnCurso)
  const idApi = pedido?.idApi
  const terminado = ESTADOS_FINALES.includes(pedido?.estado)

  useEffect(() => {
    document.title = 'Rastrea tu pedido | Gas El Volcán'
  }, [])

  // GET /api/pedidos/{id}: cuando la operadora o el administrador cambian el estado en el
  // panel (asignado, en camino, entregado), el seguimiento y el mapa lo reflejan solos.
  useEffect(() => {
    if (!idApi || terminado || !haySesion()) return undefined
    let activo = true

    const consultar = async () => {
      try {
        const respuesta = await pedidosApi.obtener(idApi)
        const estado = ESTADO_DESDE_API[respuesta?.estado]
        if (!activo || !estado) return
        setPedido((anterior) => {
          if (!anterior || anterior.estado === estado) return anterior
          const cambios = { estado }
          // Momento en que salió el repartidor: el mapa calcula desde ahí el avance del camión.
          if (estado === 'en-camino' && !anterior.enCaminoDesde) cambios.enCaminoDesde = Date.now()
          actualizarPedidoEnCurso(cambios)
          return { ...anterior, ...cambios }
        })
      } catch {
        // Sin conexión o pedido de otra cuenta: se mantiene el último estado conocido.
      }
    }

    consultar()
    const id = setInterval(consultar, INTERVALO_MS)
    return () => {
      activo = false
      clearInterval(id)
    }
  }, [idApi, terminado])

  return (
    <div className="rastreo">
      {/* El logo y el enlace al inicio los da el Navbar global (App.jsx). */}
      <main>
        <section className="hero" aria-labelledby="page-title">
          <p className="eyebrow">SEGUIMIENTO EN LÍNEA</p>
          <h1 id="page-title">Rastrea tu pedido</h1>
          <p>Revisa aquí el estado de tu pedido actual en tiempo real.</p>
        </section>

        <section className="tracker-card" aria-label="Estado de tu pedido">
          {pedido ? (
            <div className="tracking-result">
              <ResumenPedido pedido={pedido} />
              {pedido.estado !== 'cancelado' && <MapaReparto pedido={pedido} />}
              {pedido.estado === 'cancelado' ? (
                <p className="tracking-cancelado" role="status">
                  Este pedido fue cancelado. Si no lo pediste tú, contáctanos.
                </p>
              ) : (
                <LineaTiempo pedido={pedido} />
              )}
              <DetalleEntrega pedido={pedido} />
            </div>
          ) : (
            <div className="tracking-empty">
              <h2>No tienes pedidos en curso</h2>
              <p>Cuando confirmes un pedido en el checkout, podrás seguirlo desde aquí.</p>
              <Link to="/catalogo" className="tracking-empty-link">Pedir gas</Link>
            </div>
          )}
        </section>
      </main>

      <footer>Gas El Volcán · Entregas seguras y rápidas</footer>
    </div>
  )
}
