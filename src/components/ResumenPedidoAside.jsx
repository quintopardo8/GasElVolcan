// src/pages/Checkout/components/ResumenPedidoAside.jsx
import React from 'react';

export default function ResumenPedidoAside({ cart = [], onEditar }) {
  const formatearDinero = (monto) =>
    '$' + String(Math.round(monto)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <aside className="checkout-card p-4">
      <div className="d-flex justify-content-between align-items-baseline mb-4">
        <h2 className="h4 fw-bold mb-0" style={{ color: 'var(--volcan-navy)' }}>Resumen</h2>
        {onEditar && (
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0 fw-semibold"
            style={{ 
              color: '#1d72b8', 
              border: 'none', 
              outline: 'none', 
              boxShadow: 'none',
              fontSize: '14px' 
            }}
            onClick={onEditar}
          >
            Editar
          </button>
        )}
      </div>

      <ul className="list-unstyled mb-4">
        {cart.map((item) => (
          <li
            key={item.id}
            className="d-flex justify-content-between align-items-center py-2"
          >
            <div className="small" style={{ color: 'var(--volcan-text)' }}>
              <span className="fw-bold me-1">{item.quantity}×</span> {item.name}
            </div>
            <span className="fw-semibold" style={{ color: 'var(--volcan-navy)' }}>
              {formatearDinero(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="d-flex justify-content-between align-items-baseline pt-4 border-top">
        <span className="fw-bold fs-5" style={{ color: 'var(--volcan-navy)' }}>Total</span>
        <span className="fw-bold fs-3" style={{ color: 'var(--volcan-blue)' }}>{formatearDinero(total)}</span>
      </div>
    </aside>
  );
}