import { NavLink } from "react-router-dom";

export default function SelectorSesion() {
  return (
    <nav className="selector-sesion">
      <NavLink to="/iniciar-sesion">Iniciar sesión</NavLink>
      <NavLink to="/registro">Registrarse</NavLink>
    </nav>
  );
}