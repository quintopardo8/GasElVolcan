// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logoVolcan from '../assets/ElVolcan.png';

export default function Navbar() {
  return (
    <header className="header-volcan">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Lado izquierdo: Logo integrado y navegación */}
        <div className="d-flex align-items-center gap-4">
          <Link to="/" className="text-decoration-none d-flex align-items-center">
            <img 
              src={logoVolcan} 
              alt="El Volcán" 
              className="logo-header"
            />
          </Link>
          <nav className="d-none d-md-flex align-items-center gap-1">
            <Link to="/" className="nav-link-volcan">Inicio</Link>
            <Link to="/catalogo" className="nav-link-volcan">Catálogo</Link>
            <Link to="/contacto" className="nav-link-volcan">Contacto</Link>
          </nav>
        </div>

        {/* Lado derecho: Carrito, Usuario y Salir en tono azul */}
        <div className="d-flex align-items-center gap-3">
          <Link to="/checkout" className="position-relative icon-interactivo" title="Ver carrito">
            <span>🛒</span>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill badge-carrito">
              1
            </span>
          </Link>
          
          <span className="usuario-texto d-none d-sm-inline">
            Hola, <strong className="usuario-nombre">Asd</strong>
          </span>

          <button 
            type="button" 
            className="icon-interactivo" 
            title="Cerrar sesión"
          >
            🚪
          </button>
        </div>
      </div>
    </header>
  );
}