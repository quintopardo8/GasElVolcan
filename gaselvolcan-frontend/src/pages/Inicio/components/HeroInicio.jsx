import { Link } from 'react-router-dom'
import Cilindro from '../../../components/Cilindro.jsx'
import { PRODUCTOS } from '../../../data/catalogo.js'

// Los cilindros domésticos (5, 11 y 15 kg) que se dibujan en la portada.
const CILINDROS_PORTADA = PRODUCTOS.filter((p) => p.kg && p.kg <= 15)

export default function HeroInicio() {
  return (
    <section className="inicio-hero tarjeta" aria-labelledby="inicio-titulo">
      <div className="inicio-hero-texto">
        <p className="eyebrow">Chillán y comunas aledañas</p>
        <h1 id="inicio-titulo">¿Necesitas gas hoy?</h1>
        <p className="inicio-hero-bajada">
          Elige tu cilindro, indica dónde lo entregamos y sigue a tu repartidor en tiempo real.
        </p>
        <Link to="/catalogo" className="boton boton-primario">
          Pedir gas
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
      <div className="inicio-hero-cilindros" aria-hidden="true">
        {CILINDROS_PORTADA.map((p) => (
          <Cilindro key={p.codigo} kg={p.kg} />
        ))}
      </div>
    </section>
  )
}
