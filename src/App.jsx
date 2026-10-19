import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Inicio from './pages/Inicio/Inicio.jsx';
import Contacto from './pages/Contacto/Contacto.jsx';
import Checkout from './pages/Checkout/Checkout.jsx';
import Rastreo from './pages/Rastreo/Rastreo.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/rastreo" element={<Rastreo />} />
      </Routes>
    </BrowserRouter>
  );
}
