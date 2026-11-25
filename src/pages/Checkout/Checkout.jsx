import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Checkout.css';
import CheckoutDireccion from './components/CheckoutDireccion';
import CheckoutPago from './components/CheckoutPago';
import CheckoutConfirmacion from './components/CheckoutConfirmacion';
import ResumenPedidoAside from "../../components/ResumenPedidoAside.jsx";
import { useCarrito } from '../../context/CarritoContext.js';
import { guardarPedidoEnCurso } from '../../utils/pedidoEnCurso.js';
import { pedidosApi } from '../../utils/api.js';
import { esPersonal, obtenerSesion } from '../../utils/sesion.js';
import { useCatalogo } from '../../context/CatalogoContext.js';

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
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const { recargar: recargarCatalogo } = useCatalogo();

  useEffect(() => {
    document.title = 'Checkout | Gas El Volcán';
  }, []);

  const manejarPasoDireccion = (direccion) => {
    setDatosPedido((prev) => ({ ...prev, direccion }));
    setPaso(3);
  };

  // Paso final: el pedido se guarda en la base de datos (POST /api/pedidos con el token del cliente).
  // El backend valida stock, calcula el total con los precios vigentes y descuenta el stock.
  const manejarPasoPago = async (pago) => {
    if (enviando) return;
    const direccionActual = datosPedido.direccion || {};
    const { street, unit, comuna, slot, phone, refs } = direccionActual;

    setEnviando(true);
    setErrorEnvio('');
    let creado;
    try {
      creado = await pedidosApi.crear({
        // El cliente queda con el nombre de su cuenta; si compra el personal, se usa su nombre.
        clienteNombre: esPersonal() ? obtenerSesion()?.nombre : null,
        telefono: phone,
        calle: street,
        depto: unit || null,
        comuna,
        referencia: refs || null,
        franja: slot || null,
        metodoPago: String(pago.metodo).toUpperCase(),
        lineas: items.map((item) => ({ codigo: item.id, cantidad: item.quantity })),
      });
    } catch (error) {
      setErrorEnvio(error.estado === 403
        ? 'Tu cuenta no puede realizar pedidos desde la tienda.'
        : error.message);
      setEnviando(false);
      return;
    }

    const pedido = {
      id: creado?.codigo || `EV-${creado?.id ?? ''}`,
      idApi: creado?.id,
      hora: horaActual(),
      estado: 'confirmado',
      lineas: items.map((item) => ({ id: item.id, cantidad: item.quantity })),
      pago: pago,
      direccion: { street, unit, comuna, slot, phone, refs }
    };

    guardarPedidoEnCurso(pedido);
    setPedidoConfirmado({ ...pedido, items, total: creado?.total ?? total });
    setDatosPedido((prev) => ({ ...prev, pago, direccion: direccionActual }));
    vaciar();
    setEnviando(false);
    setPaso(4);
    // El stock cambió en la base de datos: el catálogo se vuelve a leer.
    recargarCatalogo();
  };

  const irAlCatalogo = () => navigate('/catalogo');
  const carritoVacio = items.length === 0 && paso !== 4;

  return (
    <div className="checkout-wrapper py-4 pb-5">
      <div className="container">
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

              {paso === 3 && errorEnvio && (
                <div className="alert alert-danger" role="alert">{errorEnvio}</div>
              )}
              {paso === 3 && enviando && (
                <div className="alert alert-info" role="status">Registrando tu pedido…</div>
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