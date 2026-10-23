import { Link } from 'react-router-dom'

export default function Inicio() {
  return (
    <header>
      <nav aria-label="Navegación principal">
        <Link to="/contacto">Contacto</Link>
      </nav>
    </header>
  )
}
