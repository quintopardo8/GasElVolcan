import { useEffect, useState } from 'react';
import { formatearDinero } from '../../data/catalogo.js';
import { useCarrito } from '../../context/CarritoContext.js';
import { useCatalogo } from '../../context/CatalogoContext.js';
import TarjetaProducto from './components/TarjetaProducto.jsx';
import PedidoAside from './components/PedidoAside.jsx';
import './Catalogo.css';

const TODAS = 'Todos';

// Página pública: los productos vienen de la base de datos (GET /api/productos, sin token).
// El carrito lo entrega <CarritoProvider> desde App.jsx: lo comparten el navbar y el checkout.
export default function Catalogo() {
  const [categoria, setCategoria] = useState(TODAS);
  const { totalUnidades, total } = useCarrito();
  const { productos: todos, categorias, cargando, error, recargar } = useCatalogo();

  useEffect(() => {
    document.title = 'Catálogo | Gas El Volcán';
    // Cada vez que se entra al catálogo se vuelve a leer la API: así se ven al tiro
    // los cambios que hizo el administrador (precios, stock, productos nuevos o eliminados).
    recargar();
  }, [recargar]);

  const productos = categoria === TODAS ? todos : todos.filter((p) => p.categoria === categoria);

  return (
    <div className="catalogo">
      <div className="catalogo-contenido">
        <section className="catalogo-productos" aria-labelledby="catalogo-titulo">
          <div className="catalogo-encabezado">
            <h1 id="catalogo-titulo">Elige tus productos</h1>
            <p>Cilindros, reguladores, mangueras y accesorios. Tu pedido se arma al instante y puedes ajustarlo cuando quieras.</p>
          </div>

          <div className="catalogo-filtros" role="group" aria-label="Filtrar por categoría">
            {[TODAS, ...categorias].map((nombre) => (
              <button
                key={nombre}
                type="button"
                className={`filtro-categoria ${categoria === nombre ? 'activo' : ''}`}
                aria-pressed={categoria === nombre}
                onClick={() => setCategoria(nombre)}
              >
                {nombre}
              </button>
            ))}
          </div>

          {error ? (
            <div className="catalogo-estado" role="alert">
              <strong>No pudimos cargar el catálogo.</strong>
              <p>{error}</p>
              <button type="button" className="btn-catalogo" onClick={recargar}>Reintentar</button>
            </div>
          ) : cargando && todos.length === 0 ? (
            <div className="catalogo-estado" role="status">Cargando productos…</div>
          ) : productos.length === 0 ? (
            <div className="catalogo-estado">No hay productos en esta categoría.</div>
          ) : (
            <div className="catalogo-grilla">
              {productos.map((producto) => (
                <TarjetaProducto key={producto.codigo} producto={producto} />
              ))}
            </div>
          )}
        </section>

        <PedidoAside />
      </div>

      {/* En celulares el resumen queda abajo de todo: esta barra lo deja siempre a mano. */}
      {totalUnidades > 0 && (
        <a href="#tu-pedido" className="catalogo-barra-movil">
          <span>
            Ver pedido ({totalUnidades})
          </span>
          <strong>{formatearDinero(total)}</strong>
        </a>
      )}
    </div>
  );
}
