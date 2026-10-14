import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio from './pages/Inicio/Inicio.jsx'
import Rastreo from './pages/Rastreo/Rastreo.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/rastreo" element={<Rastreo />} />
      </Routes>
    </BrowserRouter>
  )
}
