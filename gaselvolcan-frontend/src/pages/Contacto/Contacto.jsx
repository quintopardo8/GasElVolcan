import { useEffect } from 'react'
import InfoContacto from './components/InfoContacto.jsx'
import FormularioContacto from './components/FormularioContacto.jsx'
import './Contacto.css'

export default function Contacto() {
  useEffect(() => {
    document.title = 'Contacto | Gas El Volcán'
  }, [])

  return (
    <div className="container contacto">
      {/* El logo y el enlace al inicio los da el Navbar global (App.jsx). */}
      <header>
        <h1>Contacto - Distribuidora de Gas</h1>
        <p>Ponte en contacto con nosotros para pedidos, consultas o propuestas.</p>
      </header>

      <InfoContacto />

      <main>
        <FormularioContacto />
      </main>
    </div>
  )
}
