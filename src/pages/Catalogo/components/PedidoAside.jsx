import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../../context/CarritoContext.js';
import { buscarProducto, formatearDinero } from '../../../data/catalogo.js';

export default function PedidoAside() {
  const navigate = useNavigate();
  const { items, total, totalUnidades, agregar, restar, quitar } = useCarrito();
  const vacio = items.length === 0;

  return (
    <aside id="tu-pedido" className="pedido-aside" aria-label="Tu pedido">
      <div className="pedido-aside-cabecera">
        <h2>Tu pedido</h2>
        <span>{vacio ? 'Vacío' : `${totalUnidades} ${totalUnidades === 1 ? 'producto' : 'productos'}`}</span>
      </div>

      {vacio ? (
        <div className="pedido-aside-vacio">
          <span aria-hidden="true">🛒</span>
          <strong>Tu carrito está vacío</strong>
          <p>Agrega un producto y aparecerá aquí al instante.</p>
        </div>
      ) : (
        <ul className="pedido-aside-lista" aria-live="polite">
          {items.map((item) => {
            const tope = item.quantity >= buscarProducto(item.id).stock;
            return (
              <li key={item.id}>
                <div className="fila fila-base">
                  <span className="pedido-aside-nombre">{item.name}</span>
                  <span className="pedido-aside-subtotal">{formatearDinero(item.price * item.quantity)}</span>
                </div>
                <div className="fila">
                  <div className="selector-cantidad">
                    <button
                      type="button"
                      onClick={() => restar(item.id)}
                      aria-label={`Restar uno de ${item.name}`}
                    >
                      −
                    </button>
                    <span aria-label="Cantidad">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => agregar(item.id)}
                      disabled={tope}
                      aria-label={`Sumar uno de ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <span className="pedido-aside-unitario">{formatearDinero(item.price)} c/u</span>
                  <button
                    type="button"
                    className="pedido-aside-quitar"
                    onClick={() => quitar(item.id)}
                    aria-label={`Quitar ${item.name} del pedido`}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="pedido-aside-pie">
        <div className="fila fila-base">
          <span className="pedido-aside-etiqueta-total">Total</span>
          <span className="pedido-aside-total">{formatearDinero(total)}</span>
        </div>
        <button
          type="button"
          className="btn-catalogo btn-catalogo-grande"
          disabled={vacio}
          onClick={() => navigate('/checkout')}
        >
          Continuar a dirección →
        </button>
        <p>Pagas en el último paso. También puedes pagar en efectivo al recibir.</p>
      </div>
    </aside>
  );
}
