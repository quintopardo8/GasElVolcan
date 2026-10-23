// src/components/Navbar.jsx
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';
import logoVolcan from '../assets/ElVolcan.png';
import { cerrarSesion, obtenerSesion } from '../utils/sesion.js';

export default function Navbar() {
  const sesion = obtenerSesion();

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
          </nav>
        </div>

        {/* Lado derecho: Carrito, Usuario y Salir en tono azul */}
        <div className="header-volcan-grupo header-volcan-derecha">
          <Link to="/checkout" className="icon-interactivo" title="Ver carrito" aria-label="Ver carrito: 1 cilindro">
            <span aria-hidden="true">🛒</span>
            <span className="badge-carrito" aria-hidden="true">
              1
            </span>
          </Link>

          <span className="usuario-texto">
            Hola, <strong className="usuario-nombre">{sesion?.nombre}</strong>
          </span>

          <Link
            to="/iniciar-sesion"
            onClick={cerrarSesion}
            className="icon-interactivo"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <span aria-hidden="true">🚪</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
