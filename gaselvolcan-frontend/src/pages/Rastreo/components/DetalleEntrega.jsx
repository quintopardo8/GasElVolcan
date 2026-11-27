import { formatearDinero } from '../../../data/catalogo.js'

const PAGOS = {
  tarjeta: 'Pagado con tarjeta (Webpay)',
  efectivo: 'Pago al recibir en efectivo',
  transferencia: 'Transferencia: envía el comprobante por WhatsApp',
}

export default function DetalleEntrega({ pedido }) {
  const { direccion } = pedido
  const lugar = direccion?.street
    ? `${direccion.street}${direccion.unit ? ` (${direccion.unit})` : ''}, ${direccion.comuna}`
    : null

  return (
    <aside className="delivery-details" aria-label="Detalles de entrega">
      <div className="gas-icon">♨</div>
      <div>
        <span>DETALLE DE ENTREGA</span>
        <ul>
          {pedido.lineas.map((l) => (
            <li key={l.codigo}><strong>{l.cantidad} × {l.nombre}</strong></li>
          ))}
        </ul>
        <p>Total {formatearDinero(pedido.total)} · {PAGOS[pedido.pago] || 'Pago al recibir: efectivo, tarjeta o transferencia'}</p>
        {lugar && <p>Entrega en {lugar}</p>}
      </div>
    </aside>
  )
}
