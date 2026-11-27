import { createContext, useContext } from 'react';

export const CatalogoContext = createContext(null);

// Uso: const { productos, categorias, cargando, error, recargar } = useCatalogo();
export function useCatalogo() {
  const catalogo = useContext(CatalogoContext);
  if (!catalogo) {
    throw new Error('useCatalogo debe usarse dentro de <CatalogoProvider>');
  }
  return catalogo;
}
