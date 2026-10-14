import { useEffect } from 'react'
import Logo from '../../components/Logo.jsx'
import InfoContacto from './components/InfoContacto.jsx'
import FormularioContacto from './components/FormularioContacto.jsx'
import './Contacto.css'

export default function Contacto() {
  useEffect(() => {
    document.title = 'Contacto - Venta de Gas'
  }, [])

  return (
    <div className="container contacto">
      <header>
        <Logo />
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
