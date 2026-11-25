// src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logoVolcan from '../assets/ElVolcan.png';
import { cerrarSesion, esPersonal, obtenerSesion } from '../utils/sesion.js';
import { useCarrito } from '../context/CarritoContext.js';

export default function Navbar() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();

  // Cerrar sesión: se borra el token y el rol del navegador y se vuelve al login.
  const salir = () => {
    cerrarSesion();
    navigate('/iniciar-sesion', { replace: true, state: { motivo: 'cerrada' } });
  };
  const { totalUnidades } = useCarrito();
  const etiquetaCarrito = totalUnidades === 0
    ? 'Ver carrito: vacío'
    : `Ver carrito: ${totalUnidades} ${totalUnidades === 1 ? 'producto' : 'productos'}`;

  return (
    <header className="header-volcan">
      <div className="header-volcan-contenido">
        {/* Lado izquierdo: Logo integrado y navegación */}
        <div className="header-volcan-grupo header-volcan-izquierda">
          <Link to="/" className="header-volcan-logo">
            <img
              src={logoVolcan}
              alt="El Volcán, ir al inicio"
              className="logo-header"
            />
          </Link>
          <nav aria-label="Navegación principal" className="header-volcan-nav">
            <NavLink to="/" end className="nav-link-volcan">Inicio</NavLink>
            <NavLink to="/catalogo" className="nav-link-volcan">Catálogo</NavLink>
            <NavLink to="/contacto" className="nav-link-volcan">Contacto</NavLink>
            {esPersonal(sesion?.rol) && (
              <NavLink to="/admin" className="nav-link-volcan">Administración</NavLink>
            )}
          </nav>
        </div>

        {/* Lado derecho: Carrito, Usuario y Salir en tono azul */}
        <div className="header-volcan-grupo header-volcan-derecha">
          <Link to="/checkout" className="icon-interactivo" title="Ver carrito" aria-label={etiquetaCarrito}>
            <span aria-hidden="true">🛒</span>
            {totalUnidades > 0 && (
              <span className="badge-carrito" aria-hidden="true">
                {totalUnidades}
              </span>
            )}
          </Link>

          {sesion ? (
            <>
              <span className="usuario-texto">
                Hola, <strong className="usuario-nombre">{sesion.nombre}</strong>
              </span>

              <button
                type="button"
                onClick={salir}
                className="icon-interactivo boton-salir"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <span aria-hidden="true">🚪</span>
              </button>
            </>
          ) : (
            // Visitante sin sesión: puede navegar la tienda y entrar cuando quiera.
            <Link to="/iniciar-sesion" className="boton-ingresar">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
