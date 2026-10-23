import { ESTADOS_PEDIDO } from '../../../utils/pedidoEnCurso.js'

const ICONOS = { complete: '✓', active: '●' }

export default function LineaTiempo({ pedido }) {
  const entregado = pedido.estado === 'entregado'
  const actual = Math.max(0, ESTADOS_PEDIDO.findIndex((e) => e.id === pedido.estado))

  return (
    // --paso mueve la barra verde hasta el paso actual (ver .timeline::after).
    <ol className="timeline" aria-label="Estado del pedido" style={{ '--paso': actual }}>
      {ESTADOS_PEDIDO.map((estado, i) => {
        const clase = i < actual || entregado ? 'complete' : i === actual ? 'active' : ''
        let detalle = clase === 'active' ? 'Actualizado hace un momento' : clase === 'complete' ? estado.nota : 'Próximamente'
        if (i === 0 && pedido.hora) detalle = `Hoy, ${pedido.hora} hrs.`
        return (
          <li key={estado.id} className={clase || undefined}>
            <span className="timeline-icon">{ICONOS[clase]}</span>
            <div><strong>{estado.nombre}</strong><small>{detalle}</small></div>
          </li>
        )
      })}
    </ol>
  )
}
