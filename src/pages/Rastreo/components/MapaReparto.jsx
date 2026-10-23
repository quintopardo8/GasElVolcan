export default function MapaReparto() {
  return (
    <div className="map-panel" aria-label="Ubicación estimada de tu pedido">
      <div className="map-grid"></div>
      <div className="road road-one"></div>
      <div className="road road-two"></div>
      <div className="home-pin" aria-hidden="true">⌂</div>
      <div className="delivery-pin" aria-hidden="true">🚚</div>
      <p className="map-caption">El repartidor se encuentra a 8 minutos de tu dirección</p>
    </div>
  )
}
