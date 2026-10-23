// src/pages/Checkout/Checkout.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Checkout.css';
import CheckoutDireccion from './components/CheckoutDireccion';
import CheckoutPago from './components/CheckoutPago';
import CheckoutConfirmacion from './components/CheckoutConfirmacion';
import ResumenPedidoAside from "../../components/ResumenPedidoAside.jsx";
import { useCarrito } from '../../context/CarritoContext.js';
import { guardarPedidoEnCurso } from '../../utils/pedidoEnCurso.js';

function generarCodigoPedido() {
  return `EV-${Math.floor(10000 + Math.random() * 90000)}`;
}

function horaActual() {
  return new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, vaciar } = useCarrito();
  const [paso, setPaso] = useState(2);
  const [datosPedido, setDatosPedido] = useState({
    direccion: null,
    pago: null
  });
  // Copia del pedido al confirmarlo: el carrito se vacía, pero la confirmación lo sigue mostrando.
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  useEffect(() => {
    document.title = 'Checkout | Gas El Volcán';
  }, []);

  const manejarPasoDireccion = (direccion) => {
    setDatosPedido((prev) => ({ ...prev, direccion }));
    setPaso(3);
  };

  const manejarPasoPago = (pago) => {
    const { street, unit, comuna, slot } = datosPedido.direccion;
    const pedido = {
      id: generarCodigoPedido(),
      hora: horaActual(),
      estado: 'confirmado',
      lineas: items.map((item) => ({ id: item.id, cantidad: item.quantity })),
      pago: pago.metodo,
      direccion: { street, unit, comuna, slot },
    };

    // El inicio y la página de rastreo leen este pedido.
    guardarPedidoEnCurso(pedido);
    setPedidoConfirmado({ ...pedido, items, total });
    setDatosPedido((prev) => ({ ...prev, pago }));
    vaciar();
    setPaso(4);
  };

  const irAlCatalogo = () => navigate('/catalogo');
  const carritoVacio = items.length === 0 && paso !== 4;

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
        {carritoVacio ? (
          <div className="checkout-card p-4 p-md-5 mx-auto text-center" style={{ maxWidth: '560px' }}>
            <div className="fs-1 mb-2" aria-hidden="true">🛒</div>
            <h1 className="h3 fw-bold mb-2" style={{ color: 'var(--volcan-navy)' }}>
              Tu carrito está vacío
            </h1>
            <p className="small mb-4" style={{ color: 'var(--volcan-muted)' }}>
              Agrega cilindros o accesorios desde el catálogo para continuar con tu pedido.
            </p>
            <Link to="/catalogo" className="btn btn-volcan">
              Ir al catálogo
            </Link>
          </div>
        ) : paso === 4 ? (
          <CheckoutConfirmacion
            pedido={{ ...datosPedido, ...pedidoConfirmado }}
            onNuevoPedido={irAlCatalogo}
          />
        ) : (
          <div className="row g-4 align-items-start justify-content-center">
            <div className="col-12 col-lg-8">
              {paso === 2 && (
                <CheckoutDireccion
                  datosPrevios={datosPedido.direccion || {}}
                  onContinuar={manejarPasoDireccion}
                  onVolver={irAlCatalogo}
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
              {/* Los productos se editan en el catálogo, que comparte el mismo carrito. */}
              <ResumenPedidoAside
                cart={items}
                onEditar={irAlCatalogo}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
