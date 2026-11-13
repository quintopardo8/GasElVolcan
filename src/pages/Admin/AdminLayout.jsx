import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import logoVolcan from '../../assets/ElVolcan.png'
import { cerrarSesion, obtenerSesion } from '../../utils/sesion.js'
import { ETIQUETA_ROL } from './adminUtils.js'
import './Admin.css'

const SECCIONES = [
  { ruta: '/admin', fin: true, texto: 'Resumen', icono: '📊', roles: ['ADMINISTRADOR', 'OPERADORA'] },
  { ruta: '/admin/pedidos', texto: 'Pedidos', icono: '📦', roles: ['ADMINISTRADOR', 'OPERADORA'] },
  { ruta: '/admin/usuarios', texto: 'Usuarios', icono: '👥', roles: ['ADMINISTRADOR'] },
  { ruta: '/admin/productos', texto: 'Productos y stock', icono: '🛢️', roles: ['ADMINISTRADOR'] },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const sesion = obtenerSesion()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const secciones = SECCIONES.filter((s) => s.roles.includes(sesion?.rol))
  const seccionActual = [...secciones].reverse().find((s) => pathname.startsWith(s.ruta))

  const salir = () => {
    cerrarSesion()
    navigate('/iniciar-sesion', { replace: true })
  }

  return (
    <div className="admin-layout">
      <aside id="admin-menu" className={`admin-sidebar ${menuAbierto ? 'abierto' : ''}`}>
        <div className="admin-marca">
          <span className="admin-marca-logo">
            <img src={logoVolcan} alt="" />
          </span>
          <span>
            <strong>Gas El Volcán</strong>
            <small>Panel de administración</small>
          </span>
        </div>

        <nav className="admin-nav" aria-label="Secciones de administración">
          {secciones.map((s) => (
            <NavLink key={s.ruta} to={s.ruta} end={s.fin} onClick={() => setMenuAbierto(false)}>
              <span aria-hidden="true">{s.icono}</span>
              {s.texto}
            </NavLink>
          ))}
        </nav>

        <div className="admin-usuario">
          <div className="admin-usuario-nombre">{sesion?.nombre}</div>
          <div className="admin-usuario-rol">{ETIQUETA_ROL[sesion?.rol] ?? sesion?.rol}</div>
          <Link to="/" className="admin-enlace-tienda">Ver la tienda</Link>
          <button type="button" className="admin-salir" onClick={salir}>Cerrar sesión</button>
        </div>
      </aside>

      {menuAbierto && <div className="admin-velo" onClick={() => setMenuAbierto(false)} aria-hidden="true" />}

      <div className="admin-principal">
        {/* En teléfonos y tabletas el menú se colapsa en una hamburguesa. */}
        <header className="admin-barra-movil">
          <button
            type="button"
            className="admin-hamburguesa"
            aria-label="Abrir menú"
            aria-controls="admin-menu"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(true)}
          >
            <span aria-hidden="true">☰</span>
          </button>
          <span className="admin-barra-titulo">{seccionActual?.texto ?? 'Administración'}</span>
        </header>

        <main className="admin-contenido">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
