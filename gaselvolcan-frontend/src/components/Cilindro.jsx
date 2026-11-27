import './Cilindro.css'

// Proporciones de cada formato dentro de un lienzo de 100 × 140.
const DIMENSIONES = { 5: [54, 64], 11: [64, 90], 15: [70, 110] }

function geometria(kg) {
  const [bw, bh] = DIMENSIONES[kg] || DIMENSIONES[11]
  const bx = 50 - bw / 2
  const by = 136 - bh
  const cw = Math.round(bw * 0.6)
  const bandY = by + Math.round(bh * 0.4)
  return {
    bw, bh, bx, by, cw, bandY,
    rx: Math.round(bw * 0.3),
    cx: 50 - cw / 2,
    cy: by - 18,
    vy: by - 24,
    hlx: bx + 9,
    hly: by + 12,
    hlh: Math.max(10, Math.round(bh * 0.4) - 18),
  }
}

export default function Cilindro({ kg, ancho = 96, alto = 134 }) {
  const g = geometria(kg)
  return (
    <svg className="cilindro" width={ancho} height={alto} viewBox="0 0 100 140" aria-hidden="true">
      <ellipse className="cilindro-sombra" cx="50" cy="137" rx={g.bw / 2} ry="3" />
      <rect className="cilindro-asa" x={g.cx} y={g.cy} width={g.cw} height="22" rx="7" />
      <rect className="cilindro-valvula" x="44" y={g.vy} width="12" height="9" rx="2" />
      <rect className="cilindro-cuerpo" x={g.bx} y={g.by} width={g.bw} height={g.bh} rx={g.rx} />
      <rect className="cilindro-brillo" x={g.hlx} y={g.hly} width="6" height={g.hlh} rx="3" />
      <rect className="cilindro-banda" x={g.bx} y={g.bandY} width={g.bw} height="18" />
      <text className="cilindro-texto" x="50" y={g.bandY + 13} textAnchor="middle">
        {kg} KG
      </text>
    </svg>
  )
}
