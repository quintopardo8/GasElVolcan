import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio from './pages/Inicio/Inicio.jsx'
import Catalogo from './pages/Catalogo/Catalogo.jsx'
import Contacto from './pages/Contacto/Contacto.jsx'
import Checkout from './pages/Checkout/Checkout.jsx'
import Rastreo from './pages/Rastreo/Rastreo.jsx'
import IniciarSesion from './pages/IniciarSesion/IniciarSesion.jsx'
import RecuperarContrasena from './pages/IniciarSesion/RecuperarContrasena.jsx'
import Registrarse from './pages/IniciarSesion/Registrarse.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/rastreo" element={<Rastreo />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/registro" element={<Registrarse />} />
      </Routes>
    </BrowserRouter>
  )
}
