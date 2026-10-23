const TEXTOS = {
  confirmado: { titulo: '¡Recibimos tu pedido!', pill: 'Confirmado' },
  preparado: { titulo: 'Tu pedido está listo para salir', pill: 'Preparado' },
  'en-camino': { titulo: '¡Tu pedido está en camino!', pill: 'En reparto' },
  entregado: { titulo: 'Tu pedido fue entregado', pill: 'Entregado' },
}

const HORARIOS = { am: 'durante la mañana', pm: 'durante la tarde' }

// "17:42" + 45 → "18:27"
function sumarMinutos(hora, minutos) {
  const [h, m] = hora.split(':').map(Number)
  const total = (h * 60 + m + minutos) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function Llegada({ pedido }) {
  if (pedido.estado === 'entregado') return null
  const horario = HORARIOS[pedido.direccion?.slot]
  if (horario) {
    return <p className="delivery-time">Llegará <strong>{horario}</strong>.</p>
  }
  if (!pedido.hora) return null
  return (
    <p className="delivery-time">
      Llegará aproximadamente entre{' '}
      <strong>{sumarMinutos(pedido.hora, 45)} y {sumarMinutos(pedido.hora, 75)} hrs.</strong>
    </p>
  )
}

export default function ResumenPedido({ pedido }) {
  const textos = TEXTOS[pedido.estado] || TEXTOS.confirmado

  return (
    <div className="order-summary">
      <div>
        <p className="order-label">PEDIDO <strong>N° {pedido.id}</strong></p>
        <h2>{textos.titulo}</h2>
        <Llegada pedido={pedido} />
      </div>
      <span className="status-pill"><span></span> {textos.pill}</span>
    </div>
  )
}
