const PASOS = [
  { titulo: 'Elige tus cilindros', detalle: '5, 11, 15 o 45 kg, además de reguladores y accesorios.' },
  { titulo: 'Indica la dirección', detalle: 'Con referencias, para que el repartidor llegue sin llamarte.' },
  { titulo: 'Paga como prefieras', detalle: 'Tarjeta, transferencia o efectivo al recibir.' },
  { titulo: 'Sigue tu pedido', detalle: 'Mira en el mapa cuándo va en camino tu repartidor.' },
]

export default function ComoFunciona() {
  return (
    <section className="inicio-pasos" aria-labelledby="como-funciona-titulo">
      <h2 id="como-funciona-titulo">Así funciona</h2>
      <ol>
        {PASOS.map(({ titulo, detalle }, i) => (
          <li key={titulo}>
            <span className="inicio-pasos-numero" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <strong>{titulo}</strong>
            <span>{detalle}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
