import { useEffect } from 'react'
import ResumenPedido from './components/ResumenPedido.jsx'
import MapaReparto from './components/MapaReparto.jsx'
import LineaTiempo from './components/LineaTiempo.jsx'
import DetalleEntrega from './components/DetalleEntrega.jsx'
import './Rastreo.css'

export default function Rastreo() {
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
          <div className="tracking-result">
            <ResumenPedido />
            <MapaReparto />
            <LineaTiempo />
            <DetalleEntrega />
          </div>
        </section>
      </main>

      <footer>Gas El Volcán · Entregas seguras y rápidas</footer>
    </div>
  )
}
