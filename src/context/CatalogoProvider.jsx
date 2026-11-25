import { useCallback, useEffect, useMemo, useState } from 'react';
import { CatalogoContext } from './CatalogoContext.js';
import { productosApi } from '../utils/api.js';
import { registrarProductos } from '../data/catalogo.js';

/**
 * Catálogo global leído desde la base de datos (pedidos-service → GET /api/productos).
 * Es público: no necesita sesión. Lo usan el catálogo, el carrito y el checkout.
 */
export default function CatalogoProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const recargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const lista = await productosApi.listar();
      registrarProductos(lista);
      setProductos(lista);
    } catch (e) {
      setError(e.message || 'No se pudo cargar el catálogo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const valor = useMemo(() => {
    // Categorías en el orden en que aparecen los productos (vienen ordenados por código).
    const categorias = [...new Set(productos.map((p) => p.categoria))];
    return { productos, categorias, cargando, error, recargar };
  }, [productos, cargando, error, recargar]);

  return <CatalogoContext.Provider value={valor}>{children}</CatalogoContext.Provider>;
}
