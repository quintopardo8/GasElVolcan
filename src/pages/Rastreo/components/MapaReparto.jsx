import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Mapa de seguimiento con Leaflet + OpenStreetMap.
// La ruta y la posición del camión son SIMULADAS (no hay GPS): el camión se ubica
// según el estado del pedido y, cuando va en camino, avanza con el paso del tiempo.

// Distribuidora (ubicación referencial en Chillán).
const DISTRIBUIDORA = [-36.6098, -72.0905]

// Centro aproximado de cada comuna de reparto.
const COMUNAS = {
  'Chillán': [-36.6066, -72.1034],
  'Chillán Viejo': [-36.6233, -72.1323],
  Coihueco: [-36.6170, -71.8330],
  Pinto: [-36.6979, -71.8938],
  Bulnes: [-36.7422, -72.2989],
  'San Carlos': [-36.4248, -71.9580],
}

// Minutos simulados que tarda el repartidor desde que sale hasta llegar.
const MINUTOS_VIAJE = 8

// Desplaza el punto dentro de la comuna según el número del pedido, para que cada
// dirección no caiga exactamente en la plaza (siempre igual para el mismo pedido).
function destinoDe(pedido) {
  const base = COMUNAS[pedido.direccion?.comuna] ?? COMUNAS['Chillán']
  const semilla = [...String(pedido.id)].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 1000, 7)
  return [base[0] + ((semilla % 21) - 10) * 0.0006, base[1] + ((Math.floor(semilla / 21) % 21) - 10) * 0.0006]
}

// Ruta en "L" (como por calles): primero en una dirección, luego en la otra.
function rutaEntre(origen, destino) {
  return [origen, [origen[0], destino[1]], destino]
}

// Punto a una fracción (0..1) del largo total de la ruta.
function puntoEnRuta(ruta, fraccion) {
  const tramos = ruta.slice(1).map((p, i) => Math.hypot(p[0] - ruta[i][0], p[1] - ruta[i][1]))
  let restante = tramos.reduce((a, b) => a + b, 0) * Math.min(Math.max(fraccion, 0), 1)
  for (let i = 0; i < tramos.length; i++) {
    if (restante <= tramos[i] || i === tramos.length - 1) {
      const t = tramos[i] === 0 ? 1 : Math.min(restante / tramos[i], 1)
      return [ruta[i][0] + (ruta[i + 1][0] - ruta[i][0]) * t, ruta[i][1] + (ruta[i + 1][1] - ruta[i][1]) * t]
    }
    restante -= tramos[i]
  }
  return ruta.at(-1)
}

// Avance del camión (0 = en la distribuidora, 1 = en tu casa).
function avanceDe(pedido, ahora, abiertoEn) {
  if (pedido.estado === 'entregado') return 1
  if (pedido.estado !== 'en-camino') return 0
  const salida = pedido.enCaminoDesde ?? abiertoEn
  return Math.min((ahora - salida) / (MINUTOS_VIAJE * 60_000), 0.95)
}

function textoDe(pedido, avance) {
  if (pedido.estado === 'entregado') return 'Tu pedido fue entregado en tu dirección'
  if (pedido.estado === 'preparado') return 'El repartidor está cargando tu pedido en la distribuidora'
  if (pedido.estado === 'en-camino') {
    const minutos = Math.max(1, Math.round(MINUTOS_VIAJE * (1 - avance)))
    return `El repartidor se encuentra a ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'} de tu dirección`
  }
  return 'Tu pedido está en la distribuidora'
}

const icono = (clase, emoji) =>
  L.divIcon({ className: `pin-mapa ${clase}`, html: `<span>${emoji}</span>`, iconSize: [34, 34], iconAnchor: [17, 17] })

export default function MapaReparto({ pedido }) {
  const contenedor = useRef(null)
  const capas = useRef(null)
  const [ahora, setAhora] = useState(() => Date.now())
  // Si no se sabe cuándo salió el repartidor, se cuenta desde que se abrió el mapa.
  const [abiertoEn] = useState(() => Date.now())

  const destino = destinoDe(pedido)
  const ruta = rutaEntre(DISTRIBUIDORA, destino)
  const avance = avanceDe(pedido, ahora, abiertoEn)

  // Mientras va en camino, el reloj avanza y el camión se mueve.
  useEffect(() => {
    if (pedido.estado !== 'en-camino') return undefined
    const id = setInterval(() => setAhora(Date.now()), 3000)
    return () => clearInterval(id)
  }, [pedido.estado])

  // Crea el mapa una sola vez.
  useEffect(() => {
    if (!contenedor.current) return undefined
    let mapa
    try {
      mapa = L.map(contenedor.current, { scrollWheelZoom: false, attributionControl: true })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapa)
      const linea = L.polyline(ruta, { color: '#1d6fb8', weight: 4, opacity: 0.75, dashArray: '8 8' }).addTo(mapa)
      L.marker(DISTRIBUIDORA, { icon: icono('pin-bodega', '🏭'), title: 'Distribuidora Gas El Volcán' })
        .bindTooltip('Distribuidora Gas El Volcán')
        .addTo(mapa)
      L.marker(destino, { icon: icono('pin-casa', '🏠'), title: 'Tu dirección' })
        .bindTooltip(pedido.direccion?.street ? `${pedido.direccion.street}, ${pedido.direccion.comuna}` : 'Tu dirección')
        .addTo(mapa)
      const camion = L.marker(puntoEnRuta(ruta, avance), { icon: icono('pin-camion', '🚚'), title: 'Repartidor', zIndexOffset: 1000 })
        .addTo(mapa)
      mapa.fitBounds(linea.getBounds(), { padding: [36, 36] })
      capas.current = { mapa, camion }
    } catch {
      // Sin soporte de mapas (por ejemplo, en los tests): se muestra solo el texto.
      capas.current = null
    }
    return () => {
      mapa?.remove()
      capas.current = null
    }
    // El mapa se arma con la dirección del pedido; el camión se mueve en el efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido.id])

  // Mueve el camión cuando cambia el estado o pasa el tiempo.
  useEffect(() => {
    capas.current?.camion.setLatLng(puntoEnRuta(ruta, avance))
  }, [ruta, avance])

  return (
    <div className="map-panel" aria-label="Ubicación estimada de tu pedido">
      <div ref={contenedor} className="map-leaflet" />
      <p className="map-caption">{textoDe(pedido, avance)}</p>
      <p className="map-nota">Ubicación referencial · ruta simulada</p>
    </div>
  )
}
