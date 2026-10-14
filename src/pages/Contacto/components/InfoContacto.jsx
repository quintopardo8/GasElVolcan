const CANALES = [
  { titulo: 'Teléfono Principal', detalle: '+51 912 345 678 (Pedidos y Consultas)' },
  { titulo: 'Línea de Respaldo', detalle: '+51 998 877 665 (Emergencias / Si la principal no conecta)' },
  { titulo: 'WhatsApp Directo', detalle: '+51 900 111 222' },
  { titulo: 'Horario', detalle: 'Lunes a Sábado de 7:00 am a 8:00 pm' },
]

export default function InfoContacto() {
  return (
    <section className="contact-info">
      <h3>Nuestros Números y Canales de Atención</h3>
      <ul>
        {CANALES.map(({ titulo, detalle }) => (
          <li key={titulo}>
            <strong>{titulo}:</strong> {detalle}
          </li>
        ))}
      </ul>
    </section>
  )
}
