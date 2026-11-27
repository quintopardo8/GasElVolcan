// Ilustración de cada producto: los cilindros se dibujan a escala según sus kg;
// el resto usa un ícono por categoría.

const DIMENSIONES_CILINDRO = { 5: [50, 60], 11: [60, 84], 15: [66, 100], 45: [80, 112] };

function Cilindro({ kg }) {
  const [bw, bh] = DIMENSIONES_CILINDRO[kg] || DIMENSIONES_CILINDRO[11];
  const bx = 50 - bw / 2;
  const by = 136 - bh;
  const cw = Math.round(bw * 0.6);
  const bandY = by + Math.round(bh * 0.4);
  return (
    <svg className="icono-producto" width="96" height="134" viewBox="0 0 100 140" aria-hidden="true">
      <ellipse cx="50" cy="137" rx={bw / 2} ry="3" fill="#002b49" opacity="0.12" />
      <rect x={50 - cw / 2} y={by - 18} width={cw} height="22" rx="7" fill="none" stroke="#002b49" strokeWidth="5" />
      <rect x="44" y={by - 24} width="12" height="9" rx="2" fill="#002b49" />
      <rect x={bx} y={by} width={bw} height={bh} rx={Math.round(bw * 0.3)} fill="#1d72b8" />
      <rect x={bx + 9} y={by + 12} width="6" height={Math.max(10, Math.round(bh * 0.4) - 18)} rx="3" fill="#ffffff" opacity="0.22" />
      <rect x={bx} y={bandY} width={bw} height="18" fill="#000000" opacity="0.2" />
      <text x="50" y={bandY + 13} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif">
        {kg} KG
      </text>
    </svg>
  );
}

const ICONOS = {
  // Manómetro
  Reguladores: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 13l3-3" />
      <path d="M12 6V3" />
      <path d="M9 3h6" />
      <path d="M5 13H2" />
      <path d="M22 13h-3" />
    </>
  ),
  // Manguera enrollada
  'Mangueras y Conexiones': (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M19 12h3" />
      <path d="M22 10v4" />
    </>
  ),
  // Escudo de seguridad
  Accesorios: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
};

export default function IconoProducto({ producto }) {
  if (producto.kg) return <Cilindro kg={producto.kg} />;

  return (
    <span className="icono-categoria" aria-hidden="true">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {ICONOS[producto.categoria]}
      </svg>
    </span>
  );
}
