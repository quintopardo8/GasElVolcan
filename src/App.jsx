import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio from './pages/Inicio/Inicio.jsx'
import Contacto from './pages/Contacto/Contacto.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/contacto" element={<Contacto />} />
      </Routes>
    </BrowserRouter>
  )
}
