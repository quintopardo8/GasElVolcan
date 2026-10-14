const ICONOS = { complete: '✓', active: '●' }

const PASOS = [
  { titulo: 'Pedido confirmado', detalle: 'Hoy, 17:42 hrs.', estado: 'complete' },
  { titulo: 'Pedido preparado', detalle: 'Hoy, 18:03 hrs.', estado: 'complete' },
  { titulo: 'En camino a tu domicilio', detalle: 'Actualizado hace un momento', estado: 'active' },
  { titulo: 'Pedido entregado', detalle: 'Próximamente', estado: '' },
]

export default function LineaTiempo() {
  return (
    <ol className="timeline" aria-label="Estado del pedido">
      {PASOS.map(({ titulo, detalle, estado }) => (
        <li key={titulo} className={estado || undefined}>
          <span className="timeline-icon">{ICONOS[estado]}</span>
          <div><strong>{titulo}</strong><small>{detalle}</small></div>
        </li>
      ))}
    </ol>
  )
}
