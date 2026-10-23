import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Inicio from './pages/Inicio/Inicio.jsx'
import Catalogo from './pages/Catalogo/Catalogo.jsx'
import Contacto from './pages/Contacto/Contacto.jsx'
import Checkout from './pages/Checkout/Checkout.jsx'
import Rastreo from './pages/Rastreo/Rastreo.jsx'
import IniciarSesion from './pages/IniciarSesion/IniciarSesion.jsx'
import RecuperarContrasena from './pages/IniciarSesion/RecuperarContrasena.jsx'
import Registrarse from './pages/IniciarSesion/Registrarse.jsx'
import { haySesion } from './utils/sesion.js'

// Las pantallas de sesión se muestran sin navbar.
const RUTAS_DE_SESION = ['/iniciar-sesion', '/registro', '/recuperar-contrasena']

// Sin sesión iniciada, cualquier página privada manda primero a la autenticación.
function Privada({ children }) {
  return haySesion() ? children : <Navigate to="/iniciar-sesion" replace />
}

function Contenido() {
  const { pathname } = useLocation()
  const mostrarNavbar = haySesion() && !RUTAS_DE_SESION.includes(pathname)

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
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Contenido />
    </BrowserRouter>
  )
}
