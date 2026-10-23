import { useNavigate } from 'react-router-dom';
import { formatearDinero } from '../../../data/catalogo.js';
import { ESTADOS_PEDIDO } from '../../../utils/pedidoEnCurso.js';

export default function CheckoutConfirmacion({ pedido = {}, onNuevoPedido }) {
  const navigate = useNavigate();

  const dir = pedido.direccion || {};
  const pagoData = pedido.pago || {};
  const metodoClave = typeof pagoData === 'string' ? pagoData : (pagoData.metodo || 'efectivo');

  const items = pedido.items || [];
  const total = pedido.total || 0;

  const etiquetasMetodo = {
    tarjeta: {
      nombre: 'Tarjeta Débito/Crédito',
      badge: 'Webpay',
      descripcion: 'Pago verificado mediante Webpay'
    },
    efectivo: {
      nombre: 'Efectivo contra entrega',
      badge: 'Al recibir',
      descripcion: `Paga ${formatearDinero(total)} al repartidor`
    },
    transferencia: {
      nombre: 'Transferencia directa',
      badge: 'Pendiente comprobante',
      descripcion: 'Envía tu comprobante al WhatsApp +56 9 0011 1222'
    }
  };

  const metodoActual = etiquetasMetodo[metodoClave] || etiquetasMetodo.efectivo;

  return (
    <div className="mx-auto" style={{ maxWidth: '820px' }}>
      {/* 1. Banner Hero Oscuro */}
      <div className="confirmacion-hero p-4 p-md-5 mb-4 text-white">
        <div className="circulo-check-hero mb-3">
          ✓
        </div>
        <h1 className="display-6 fw-bold mb-2">¡Pedido confirmado!</h1>
        <p className="fs-6 mb-3 text-white-50">
          Pedido N° <strong className="text-white">{pedido.id}</strong> · recibido hoy a las {pedido.hora}
        </p>
        <p className="small mb-0 text-white-50" style={{ maxWidth: '460px', lineHeight: '1.5' }}>
          Te avisaremos cuando un repartidor tome tu pedido y vaya en camino. Puedes seguirlo desde el inicio o en Rastrea tu pedido.
        </p>
      </div>

      {/* 2. Estado del Pedido */}
      <div className="checkout-card p-4 mb-4">
        <h2 className="h5 fw-bold mb-4" style={{ color: 'var(--volcan-navy)' }}>
          Estado del pedido
        </h2>

        <ol className="row g-3 list-unstyled mb-0" aria-label="Estado del pedido">
          {ESTADOS_PEDIDO.map((estado, i) => (
            <li key={estado.id} className="col-6 col-md-3">
              <div className={`step-bar mb-2 ${i === 0 ? 'step-bar-active' : i === 1 ? 'step-bar-current' : 'step-bar-pending'}`}></div>
              <div className={`small d-flex align-items-center gap-1 ${i === 0 ? 'fw-bold text-dark' : i === 1 ? 'fw-semibold text-dark' : 'text-secondary'}`}>
                {i === 0 && <span aria-hidden="true">✓</span>} {estado.nombre}
              </div>
              <div className="text-muted" style={{ fontSize: '12px' }}>
                {i === 0 ? `Hoy, ${pedido.hora}` : estado.nota}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* 3. Filas Entrega y Pago */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <div className="checkout-card p-4 h-100">
            <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '11px', letterSpacing: '0.8px' }}>
              Entrega
            </span>
            <h3 className="h6 fw-bold mt-2 mb-1 text-dark">
              {dir.street || 'Dirección no especificada'} {dir.unit && `(${dir.unit})`}
            </h3>
            <p className="text-secondary small mb-2">
              {dir.comuna || 'Chillán'}, Región de Ñuble
            </p>
            <p className="text-secondary small mb-0">
              {dir.slot === 'am' ? 'Durante la mañana' : dir.slot === 'pm' ? 'Durante la tarde' : 'Lo antes posible'} · {dir.phone || 'Teléfono no ingresado'}
            </p>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="checkout-card p-4 h-100">
            <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '11px', letterSpacing: '0.8px' }}>
              Pago
            </span>
            <div className="d-flex align-items-center gap-2 mt-2 mb-2">
              <h3 className="h6 fw-bold mb-0 text-dark">{metodoActual.nombre}</h3>
              <span className="badge-metodo">{metodoActual.badge}</span>
            </div>
            <p className="text-secondary small mb-0">
              {metodoActual.descripcion}
            </p>
            {metodoClave === 'transferencia' && (
              <div className="alert alert-light border py-2 px-2 small mt-2 mb-0">
                <strong>WhatsApp:</strong> +56 9 0011 1222
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Detalle del pedido */}
      <div className="checkout-card p-4 mb-4">
        <span className="text-uppercase text-muted fw-bold d-block mb-3" style={{ fontSize: '11px', letterSpacing: '0.8px' }}>
          Detalle
        </span>
        <ul className="list-unstyled mb-0 pb-2 border-bottom border-light-subtle">
          {items.map((item) => (
            <li key={item.id} className="d-flex justify-content-between align-items-center pb-2">
              <span className="text-dark">
                <strong className="me-1">{item.quantity}×</strong> {item.name}
              </span>
              <span className="fw-semibold text-dark">{formatearDinero(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="d-flex justify-content-between align-items-baseline pt-3">
          <span className="fw-bold fs-5 text-dark">Total</span>
          <span className="fw-bold fs-3" style={{ color: 'var(--volcan-blue)' }}>
            {formatearDinero(total)}
          </span>
        </div>
      </div>

      {/* 5. Acciones finales */}
      <div className="d-flex justify-content-end align-items-center gap-3 pt-2">
        <button
          type="button"
          className="btn btn-outline-volcan"
          onClick={() => navigate('/')}
        >
          Volver al inicio
        </button>
        <button
          type="button"
          className="btn btn-outline-volcan"
          onClick={onNuevoPedido}
        >
          Hacer otro pedido
        </button>
        <button
          type="button"
          className="btn btn-volcan"
          onClick={() => navigate('/rastreo')}
        >
          Rastrear pedido
        </button>
      </div>
    </div>
  );
}