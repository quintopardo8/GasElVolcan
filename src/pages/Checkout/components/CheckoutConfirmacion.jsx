// src/pages/Checkout/components/CheckoutConfirmacion.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutConfirmacion({ pedido = {}, onNuevoPedido }) {
  const navigate = useNavigate();

  // Generamos un número de pedido y hora estables para la sesión
  const codigoPedido = useMemo(() => {
    return `EV-${Math.floor(10000 + Math.random() * 90000)}`;
  }, []);

  const horaActual = useMemo(() => {
    const ahora = new Date();
    return ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Extraemos datos del pedido o usamos valores de respaldo
  const dir = pedido.direccion || {};
  const pago = pedido.pago || {};

  const formatearDinero = (monto) =>
    '$' + String(Math.round(monto)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const total = 31900;

  const etiquetasMetodo = {
    tarjeta: { nombre: 'Tarjeta', badge: 'Webpay' },
    efectivo: { nombre: 'Efectivo', badge: 'Al recibir' },
    transferencia: { nombre: 'Transferencia', badge: 'Pendiente comprobante' }
  };

  const metodoActual = etiquetasMetodo[pago.metodo] || etiquetasMetodo.efectivo;

  return (
    <div className="mx-auto" style={{ maxWidth: '820px' }}>
      {/* 1. Banner Hero Oscuro */}
      <div className="confirmacion-hero p-4 p-md-5 mb-4 text-white">
        <div className="circulo-check-hero mb-3">
          ✓
        </div>
        <h1 className="display-6 fw-bold mb-2">¡Pedido confirmado!</h1>
        <p className="fs-6 mb-3 text-white-50">
          Pedido N° <strong className="text-white">{codigoPedido}</strong> · recibido hoy a las {horaActual}
        </p>
        <p className="small mb-0 text-white-50" style={{ maxWidth: '460px', lineHeight: '1.5' }}>
          Te avisaremos cuando un repartidor tome tu pedido y vaya en camino. Puedes seguirlo desde el inicio.
        </p>
      </div>

      {/* 2. Estado del Pedido */}
      <div className="checkout-card p-4 mb-4">
        <h2 className="h5 fw-bold mb-4" style={{ color: 'var(--volcan-navy)' }}>
          Estado del pedido
        </h2>

        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="step-bar step-bar-active mb-2"></div>
            <div className="small fw-bold text-dark d-flex align-items-center gap-1">
              <span>✓</span> Recibido
            </div>
            <div className="text-muted" style={{ fontSize: '12px' }}>Hoy, {horaActual}</div>
          </div>

          <div className="col-6 col-md-3">
            <div className="step-bar step-bar-current mb-2"></div>
            <div className="small fw-semibold text-dark">Asignado a repartidor</div>
            <div className="text-muted" style={{ fontSize: '12px' }}>La operadora lo asigna en breve</div>
          </div>

          <div className="col-6 col-md-3">
            <div className="step-bar step-bar-pending mb-2"></div>
            <div className="small text-secondary">En camino</div>
            <div className="text-muted" style={{ fontSize: '12px' }}>Lo verás moverse en el mapa</div>
          </div>

          <div className="col-6 col-md-3">
            <div className="step-bar step-bar-pending mb-2"></div>
            <div className="small text-secondary">Entregado</div>
            <div className="text-muted" style={{ fontSize: '12px' }}>El pago queda registrado</div>
          </div>
        </div>
      </div>

      {/* 3. Filas Entrega y Pago */}
      <div className="row g-4 mb-4">
        {/* Entrega */}
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
              {dir.slot === 'am' ? 'Durante la mañana' : dir.slot === 'pm' ? 'Durante la tarde' : 'Lo antes posible'} · {dir.phone || '+56 9 ________'}
            </p>
          </div>
        </div>

        {/* Pago */}
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
              {pago.metodo === 'tarjeta' ? 'Pago verificado mediante Webpay' : `Paga ${formatearDinero(total)} al repartidor`}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Detalle del pedido */}
      <div className="checkout-card p-4 mb-4">
        <span className="text-uppercase text-muted fw-bold d-block mb-3" style={{ fontSize: '11px', letterSpacing: '0.8px' }}>
          Detalle
        </span>
        <div className="d-flex justify-content-between align-items-center pb-3 border-bottom border-light-subtle">
          <span className="text-dark">
            <strong className="me-1">1×</strong> Cilindro 15 kg
          </span>
          <span className="fw-semibold text-dark">{formatearDinero(total)}</span>
        </div>

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
          className="btn btn-volcan"
          onClick={onNuevoPedido}
        >
          Hacer otro pedido
        </button>
      </div>
    </div>
  );
}