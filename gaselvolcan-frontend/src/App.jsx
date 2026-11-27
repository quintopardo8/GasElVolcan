import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import Navbar from './components/Navbar.jsx'
import CatalogoProvider from './context/CatalogoProvider.jsx'
import CarritoProvider from './context/CarritoProvider.jsx'
import Inicio from './pages/Inicio/Inicio.jsx'
import Catalogo from './pages/Catalogo/Catalogo.jsx'
import Contacto from './pages/Contacto/Contacto.jsx'
import Checkout from './pages/Checkout/Checkout.jsx'
import Rastreo from './pages/Rastreo/Rastreo.jsx'
import IniciarSesion from './pages/IniciarSesion/IniciarSesion.jsx'
import RecuperarContrasena from './pages/IniciarSesion/RecuperarContrasena.jsx'
import Registrarse from './pages/IniciarSesion/Registrarse.jsx'
import SinPermiso from './pages/SinPermiso/SinPermiso.jsx'
import AdminLayout from './pages/Admin/AdminLayout.jsx'
import ResumenAdmin from './pages/Admin/ResumenAdmin.jsx'
import PedidosAdmin from './pages/Admin/PedidosAdmin.jsx'
import UsuariosAdmin from './pages/Admin/UsuariosAdmin.jsx'
import ProductosAdmin from './pages/Admin/ProductosAdmin.jsx'
import { cerrarSesion, haySesion, msHastaVencer, obtenerRol, ROLES_PERSONAL } from './utils/sesion.js'

// Las pantallas de sesión se muestran sin navbar.
const RUTAS_DE_SESION = ['/iniciar-sesion', '/registro', '/recuperar-contrasena']

// Ruta privada: sin sesión manda al login y recuerda a dónde quería ir el usuario.
function Privada({ children }) {
  const location = useLocation()
  return haySesion() ? children : <Navigate to="/iniciar-sesion" replace state={{ desde: location.pathname }} />
}

// Ruta con roles: además de la sesión exige uno de los roles indicados.
// Si el rol no alcanza se muestra "Acceso restringido" (el backend igual respondería 403).
function SoloRoles({ roles, children }) {
  const location = useLocation()
  if (!haySesion()) return <Navigate to="/iniciar-sesion" replace state={{ desde: location.pathname }} />
  return roles.includes(obtenerRol()) ? children : <SinPermiso rolesRequeridos={roles} />
}

/**
 * Vigila la sesión mientras la app está abierta:
 * - programa el cierre automático para el momento exacto en que vence el JWT;
 * - si la sesión se cierra en otra pestaña, esta también vuelve al login.
 */
function VigilanteSesion() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const restante = msHastaVencer()
    if (restante === null) return undefined
    const expirar = () => {
      cerrarSesion()
      navigate('/iniciar-sesion', { replace: true, state: { motivo: 'expirada' } })
    }
    if (restante <= 0) {
      expirar()
      return undefined
    }
    // setTimeout acepta como máximo ~24,8 días.
    const id = setTimeout(expirar, Math.min(restante, 2_147_000_000))
    return () => clearTimeout(id)
  }, [pathname, navigate])

  useEffect(() => {
    const alCambiarOtraPestana = (e) => {
      if (e.key === 'gev:sesion' && !e.newValue) navigate('/iniciar-sesion', { replace: true })
    }
    window.addEventListener('storage', alCambiarOtraPestana)
    return () => window.removeEventListener('storage', alCambiarOtraPestana)
  }, [navigate])

  return null
}

function Contenido() {
  const { pathname } = useLocation()
  // El panel de administración tiene su propio menú lateral.
  const mostrarNavbar = !RUTAS_DE_SESION.includes(pathname) && !pathname.startsWith('/admin')

  return (
    <>
      <VigilanteSesion />
      {mostrarNavbar && <Navbar />}
      <Routes>
        {/* Interfaces públicas: se ven sin iniciar sesión. */}
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/registro" element={<Registrarse />} />

        {/* Interfaces privadas: cualquier usuario con sesión. */}
        <Route path="/checkout" element={<Privada><Checkout /></Privada>} />
        <Route path="/rastreo" element={<Privada><Rastreo /></Privada>} />

        {/* Panel de administración: administradora y operadora. Usuarios y productos, solo administradora. */}
        <Route path="/admin" element={<SoloRoles roles={ROLES_PERSONAL}><AdminLayout /></SoloRoles>}>
          <Route index element={<ResumenAdmin />} />
          <Route path="pedidos" element={<PedidosAdmin />} />
          <Route path="usuarios" element={<SoloRoles roles={['ADMINISTRADOR']}><UsuariosAdmin /></SoloRoles>} />
          <Route path="productos" element={<SoloRoles roles={['ADMINISTRADOR']}><ProductosAdmin /></SoloRoles>} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route path="/sin-permiso" element={<SinPermiso />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      {/* El catálogo (desde la API) y el carrito son globales: los usan el catálogo, el navbar y el checkout. */}
      <CatalogoProvider>
        <CarritoProvider>
          <Contenido />
        </CarritoProvider>
      </CatalogoProvider>
    </BrowserRouter>
  )
}
