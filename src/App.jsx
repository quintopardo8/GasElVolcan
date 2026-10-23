// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Catalogo from './pages/Catalogo/Catalogo.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* En esta rama solo existe el catálogo; al integrar, "/" pasa a ser el Inicio. */}
        <Route path="/" element={<Navigate to="/catalogo" replace />} />
        <Route path="/catalogo" element={<Catalogo />} />
      </Routes>
    </BrowserRouter>
  );
}
