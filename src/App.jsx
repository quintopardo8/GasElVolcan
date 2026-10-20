// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar.jsx';
import Inicio from './pages/Inicio/Inicio.jsx';
import Contacto from './pages/Contacto/Contacto.jsx';
import Checkout from './pages/Checkout/Checkout.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ flex: 1, width: '100%' }}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}