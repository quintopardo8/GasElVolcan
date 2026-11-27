import { createContext, useContext } from 'react';

export const CarritoContext = createContext(null);

// Uso: const { items, agregar, total } = useCarrito();
export function useCarrito() {
  const carrito = useContext(CarritoContext);
  if (!carrito) {
    throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  }
  return carrito;
}
