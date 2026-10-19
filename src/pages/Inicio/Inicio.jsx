import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar.jsx'
import { obtenerPedidoEnCurso } from '../../utils/pedidoEnCurso.js'
import HeroInicio from './components/HeroInicio.jsx'
import PedidoEnCurso from './components/PedidoEnCurso.jsx'
import ComoFunciona from './components/ComoFunciona.jsx'
import './Inicio.css'

export default function Inicio() {
  // Se lee una sola vez al montar: el checkout guarda el pedido antes de volver al inicio.
  const [pedido] = useState(obtenerPedidoEnCurso)

  useEffect(() => {
    document.title = 'Gas El Volcán | Gas a domicilio en Chillán'
  }, [])

  return (
    <>
      <Navbar />
      <main className="inicio">
        <HeroInicio />
        {pedido && <PedidoEnCurso pedido={pedido} />}
        <ComoFunciona />
      </main>
    </>
  )
}
