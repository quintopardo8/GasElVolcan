import { useCarrito } from '../../../context/CarritoContext.js';
import { STOCK_BAJO, formatearDinero } from '../../../data/catalogo.js';
import IconoProducto from './IconoProducto.jsx';

function estadoStock(stock) {
  if (stock === 0) return { texto: 'Agotado', clase: 'agotado' };
  if (stock <= STOCK_BAJO) return { texto: `Últimas ${stock} unidades`, clase: 'bajo' };
  return { texto: 'Disponible', clase: 'disponible' };
}

export default function TarjetaProducto({ producto }) {
  const { agregar, cantidadDe } = useCarrito();
  const enPedido = cantidadDe(producto.codigo);
  const sinStock = enPedido >= producto.stock;
  const stock = estadoStock(producto.stock);

  return (
    <article className={`tarjeta-producto ${enPedido > 0 ? 'en-pedido' : ''}`}>
      <div className="tarjeta-producto-imagen">
        {enPedido > 0 && <span className="tarjeta-producto-cantidad">{enPedido} en tu pedido</span>}
        <IconoProducto producto={producto} />
      </div>

      <div className="tarjeta-producto-cuerpo">
        <div className="fila fila-arriba">
          <span className="tarjeta-producto-categoria">{producto.categoria}</span>
          <span className={`estado-stock ${stock.clase}`}>
            <span aria-hidden="true" />
            {stock.texto}
          </span>
        </div>
        <h2 className="tarjeta-producto-nombre">{producto.nombre}</h2>
        <p className="tarjeta-producto-descripcion">{producto.descripcion}</p>
      </div>

      <div className="tarjeta-producto-pie">
        <div>
          <span className="tarjeta-producto-precio">{formatearDinero(producto.precio)}</span>
          <span className="tarjeta-producto-unidad">c/{producto.unidad.toLowerCase()}</span>
        </div>
        <button
          type="button"
          className="btn-catalogo"
          onClick={() => agregar(producto.codigo)}
          disabled={sinStock}
          aria-label={`Agregar ${producto.nombre} al pedido`}
        >
          {sinStock ? 'Sin stock' : '+ Agregar'}
        </button>
      </div>
    </article>
  );
}
