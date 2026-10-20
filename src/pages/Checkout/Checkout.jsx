// src/pages/Checkout/Checkout.jsx
import React, { useState } from 'react';
import './Checkout.css';
import CheckoutDireccion from './components/CheckoutDireccion';
import CheckoutPago from './components/CheckoutPago';
import CheckoutConfirmacion from './components/CheckoutConfirmacion';
import ResumenPedidoAside from "../../components/ResumenPedidoAside.jsx";

const CARRITO_INICIAL = [
  { id: 'c15', name: 'Cilindro 15 kg', price: 31900, quantity: 1 }
];

export default function Checkout() {
  const [paso, setPaso] = useState(2);
  const [cart] = useState(CARRITO_INICIAL);
  const [datosPedido, setDatosPedido] = useState({
    direccion: null,
    pago: null
  });

  const manejarPasoDireccion = (direccion) => {
    setDatosPedido((prev) => ({ ...prev, direccion }));
    setPaso(3);
  };

  const manejarPasoPago = (pago) => {
    setDatosPedido((prev) => ({ ...prev, pago }));
    setPaso(4);
  };

  const reiniciarFlujo = () => {
    setDatosPedido({ direccion: null, pago: null });
    setPaso(2);
  };

  return (
    <div className="checkout-wrapper py-4 pb-5">
      <div className="container">
        {/* Barra de progreso de compra conectada */}
        <div className="progreso-contenedor d-flex justify-content-center align-items-center py-3 mb-4">
          <div className="d-flex align-items-center">
            <span className="circulo-paso completado">✓</span>
            <span className="paso-item text-dark fw-semibold">Catálogo</span>
          </div>

          <div style={{ flex: '1', height: '2px', backgroundColor: 'var(--volcan-blue)', margin: '0 12px', maxWidth: '90px' }}></div>

          <div className="d-flex align-items-center">
            <span className={`circulo-paso ${paso >= 2 ? (paso > 2 ? 'completado' : 'activo') : ''}`}>
              {paso > 2 ? '✓' : '2'}
            </span>
            <span className={`paso-item ${paso === 2 ? 'paso-activo' : 'text-dark'}`}>Dirección</span>
          </div>

          <div style={{ flex: '1', height: '2px', backgroundColor: paso >= 3 ? 'var(--volcan-blue)' : '#cbd5e1', margin: '0 12px', maxWidth: '90px' }}></div>

          <div className="d-flex align-items-center">
            <span className={`circulo-paso ${paso >= 3 ? (paso > 3 ? 'completado' : 'activo') : ''}`}>
              {paso > 3 ? '✓' : '3'}
            </span>
            <span className={`paso-item ${paso === 3 ? 'paso-activo' : ''}`}>Pago</span>
          </div>

          <div style={{ flex: '1', height: '2px', backgroundColor: paso >= 4 ? 'var(--volcan-blue)' : '#cbd5e1', margin: '0 12px', maxWidth: '90px' }}></div>

          <div className="d-flex align-items-center">
            <span className={`circulo-paso ${paso === 4 ? 'activo' : ''}`}>
              4
            </span>
            <span className={`paso-item ${paso === 4 ? 'paso-activo' : ''}`}>Confirmación</span>
          </div>
        </div>

        {/* Vistas dinámicas según el paso */}
        {paso === 4 ? (
          <CheckoutConfirmacion
            pedido={datosPedido}
            onNuevoPedido={reiniciarFlujo}
          />
        ) : (
          <div className="row g-4 align-items-start justify-content-center">
            <div className="col-12 col-lg-8">
              {paso === 2 && (
                <CheckoutDireccion
                  datosPrevios={datosPedido.direccion || {}}
                  onContinuar={manejarPasoDireccion}
                  onVolver={() => window.history.back()}
                />
              )}

              {paso === 3 && (
                <CheckoutPago
                  onConfirmar={manejarPasoPago}
                  onVolverAtras={() => setPaso(2)}
                />
              )}
            </div>

            <div className="col-12 col-lg-4">
              <ResumenPedidoAside
                cart={cart}
                onEditar={() => setPaso(2)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}