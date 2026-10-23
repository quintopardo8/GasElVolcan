import { useEffect, useMemo, useState } from 'react';
import { CarritoContext } from './CarritoContext.js';
import { buscarProducto } from '../data/catalogo.js';

// Se guarda solo { codigo: cantidad }; nombre y precio se leen siempre del catálogo.
const CLAVE = 'gev:carrito';

function leerGuardado() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    return guardado && typeof guardado === 'object' ? guardado : {};
  } catch {
    return {};
  }
}

export default function CarritoProvider({ children }) {
  const [cantidades, setCantidades] = useState(leerGuardado);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(cantidades));
    } catch {
      // Sin almacenamiento: el carrito funciona igual mientras la pestaña siga abierta.
    }
  }, [cantidades]);

  const valor = useMemo(() => {
    // Mismo formato que usa el checkout (ResumenPedidoAside): { id, name, price, quantity }.
    const items = Object.entries(cantidades)
      .map(([codigo, cantidad]) => ({ producto: buscarProducto(codigo), cantidad }))
      .filter(({ producto, cantidad }) => producto && cantidad > 0)
      .map(({ producto, cantidad }) => ({
        id: producto.codigo,
        name: producto.nombre,
        price: producto.precio,
        quantity: cantidad,
      }));

    // Nunca menos de 0 ni más que el stock disponible.
    const cambiar = (codigo, nuevaCantidad) => {
      const producto = buscarProducto(codigo);
      if (!producto) return;
      setCantidades((prev) => {
        const siguiente = { ...prev };
        const cantidad = Math.min(Math.max(nuevaCantidad(prev[codigo] || 0), 0), producto.stock);
        if (cantidad === 0) delete siguiente[codigo];
        else siguiente[codigo] = cantidad;
        return siguiente;
      });
    };

    return {
      items,
      totalUnidades: items.reduce((acc, item) => acc + item.quantity, 0),
      total: items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      cantidadDe: (codigo) => cantidades[codigo] || 0,
      agregar: (codigo) => cambiar(codigo, (c) => c + 1),
      restar: (codigo) => cambiar(codigo, (c) => c - 1),
      quitar: (codigo) => cambiar(codigo, () => 0),
      vaciar: () => setCantidades({}),
    };
  }, [cantidades]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}
