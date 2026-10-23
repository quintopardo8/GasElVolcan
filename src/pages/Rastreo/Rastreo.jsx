import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerPedidoEnCurso } from '../../utils/pedidoEnCurso.js'
import ResumenPedido from './components/ResumenPedido.jsx'
import MapaReparto from './components/MapaReparto.jsx'
import LineaTiempo from './components/LineaTiempo.jsx'
import DetalleEntrega from './components/DetalleEntrega.jsx'
import './Rastreo.css'

export default function Rastreo() {
  // El checkout guarda el pedido al confirmarlo; aquí se lee una sola vez al entrar.
  const [pedido] = useState(obtenerPedidoEnCurso)

  useEffect(() => {
    document.title = 'Rastrea tu pedido | Gas El Volcán'
  }, [])

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
              {pedido.estado === 'en-camino' && <MapaReparto />}
              <LineaTiempo pedido={pedido} />
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
