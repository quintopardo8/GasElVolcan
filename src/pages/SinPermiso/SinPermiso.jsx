import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { obtenerSesion } from '../../utils/sesion.js'
import './SinPermiso.css'

const ETIQUETA_ROL = {
  ADMINISTRADOR: 'Administrador(a)',
  OPERADORA: 'Operadora',
  REPARTIDOR: 'Repartidor',
  CLIENTE: 'Cliente',
}

// Se muestra cuando un usuario con sesión entra a una ruta que su rol no permite
// (por ejemplo, un CLIENTE que escribe /admin/productos en la barra de direcciones).
export default function SinPermiso({ rolesRequeridos = [] }) {
  const sesion = obtenerSesion()

  useEffect(() => {
    document.title = 'Acceso restringido | Gas El Volcán'
  }, [])

  return (
    <main className="sin-permiso">
      <section className="sin-permiso-tarjeta" role="alert" aria-labelledby="sin-permiso-titulo">
        <div className="sin-permiso-codigo" aria-hidden="true">403</div>
        <h1 id="sin-permiso-titulo">Acceso restringido</h1>
        <p>
          Tu cuenta {sesion?.rol && <>(<strong>{ETIQUETA_ROL[sesion.rol] ?? sesion.rol}</strong>)</>} no tiene permisos
          para ver esta sección.
        </p>
        {rolesRequeridos.length > 0 && (
          <p className="sin-permiso-detalle">
            Disponible solo para: {rolesRequeridos.map((r) => ETIQUETA_ROL[r] ?? r).join(' y ')}.
          </p>
        )}
        <Link to="/" className="sin-permiso-boton">Volver al inicio</Link>
      </section>
    </main>
  )
}
