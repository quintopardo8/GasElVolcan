import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import Navbar from './components/Navbar.jsx'
import CarritoProvider from './context/CarritoProvider.jsx'
import Inicio from './pages/Inicio/Inicio.jsx'
import Catalogo from './pages/Catalogo/Catalogo.jsx'
import Contacto from './pages/Contacto/Contacto.jsx'
import Checkout from './pages/Checkout/Checkout.jsx'
import Rastreo from './pages/Rastreo/Rastreo.jsx'
import IniciarSesion from './pages/IniciarSesion/IniciarSesion.jsx'
import RecuperarContrasena from './pages/IniciarSesion/RecuperarContrasena.jsx'
import Registrarse from './pages/IniciarSesion/Registrarse.jsx'
import AdminLayout from './pages/Admin/AdminLayout.jsx'
import ResumenAdmin from './pages/Admin/ResumenAdmin.jsx'
import PedidosAdmin from './pages/Admin/PedidosAdmin.jsx'
import UsuariosAdmin from './pages/Admin/UsuariosAdmin.jsx'
import ProductosAdmin from './pages/Admin/ProductosAdmin.jsx'
import { haySesion, obtenerRol, ROLES_PERSONAL } from './utils/sesion.js'

// Las pantallas de sesión se muestran sin navbar.
const RUTAS_DE_SESION = ['/iniciar-sesion', '/registro', '/recuperar-contrasena']

// Sin sesión iniciada, cualquier página privada manda primero a la autenticación.
function Privada({ children }) {
  return haySesion() ? children : <Navigate to="/iniciar-sesion" replace />
}

// Además de la sesión, exige uno de los roles indicados (si no, redirige).
function SoloRoles({ roles, redirigirA = '/', children }) {
  if (!haySesion()) return <Navigate to="/iniciar-sesion" replace />
  return roles.includes(obtenerRol()) ? children : <Navigate to={redirigirA} replace />
}

function Contenido() {
  const { pathname } = useLocation()
  // El panel de administración tiene su propio menú lateral.
  const mostrarNavbar = haySesion() && !RUTAS_DE_SESION.includes(pathname) && !pathname.startsWith('/admin')

  return (
    <>
      {mostrarNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Privada><Inicio /></Privada>} />
        <Route path="/catalogo" element={<Privada><Catalogo /></Privada>} />
        <Route path="/contacto" element={<Privada><Contacto /></Privada>} />
        <Route path="/checkout" element={<Privada><Checkout /></Privada>} />
        <Route path="/rastreo" element={<Privada><Rastreo /></Privada>} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/registro" element={<Registrarse />} />

        {/* Panel de administración: administradora y operadora. Usuarios y productos, solo administradora. */}
        <Route path="/admin" element={<SoloRoles roles={ROLES_PERSONAL}><AdminLayout /></SoloRoles>}>
          <Route index element={<ResumenAdmin />} />
          <Route path="pedidos" element={<PedidosAdmin />} />
          <Route path="usuarios" element={<SoloRoles roles={['ADMINISTRADOR']} redirigirA="/admin"><UsuariosAdmin /></SoloRoles>} />
          <Route path="productos" element={<SoloRoles roles={['ADMINISTRADOR']} redirigirA="/admin"><ProductosAdmin /></SoloRoles>} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      {/* El carrito es global: lo usan el catálogo, el navbar y el checkout. */}
      <CarritoProvider>
        <Contenido />
      </CarritoProvider>
    </BrowserRouter>
  )
}
