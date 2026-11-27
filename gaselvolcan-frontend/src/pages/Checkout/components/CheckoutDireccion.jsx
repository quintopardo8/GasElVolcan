import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  validarCalleNumero,
  validarComuna,
  validarTelefono
} from '../../../utils/validadoresCheckout';

const HORARIOS = [
  { id: 'asap', label: 'Lo antes posible' },
  { id: 'am', label: 'Durante la mañana' },
  { id: 'pm', label: 'Durante la tarde' }
];

const COORDENADAS_COMUNA = {
  'Chillán': [-36.6066, -72.1034],
  'Chillán Viejo': [-36.6236, -72.1333],
  'Coihueco': [-36.6256, -71.8322],
  'Pinto': [-36.6975, -71.8958],
  'Bulnes': [-36.7436, -72.2994],
  'San Carlos': [-36.4258, -71.9589]
};

const iconoPin = L.divIcon({
  className: 'volcan-leaflet-pin',
  html: '<div style="font-size:28px;line-height:1;transform:translate(-50%,-85%);">📍</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

function MapaDireccion({ comuna, coords, onCambiarCoords }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadorRef = useRef(null);
  const onCambiarCoordsRef = useRef(onCambiarCoords);

  useEffect(() => {
    onCambiarCoordsRef.current = onCambiarCoords;
  }, [onCambiarCoords]);

  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return;

    const inicial = coords || COORDENADAS_COMUNA[comuna] || COORDENADAS_COMUNA['Chillán'];
    const map = L.map(contenedorRef.current).setView(inicial, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker(inicial, {
      icon: iconoPin,
      draggable: true
    }).addTo(map);

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      onCambiarCoordsRef.current([lat, lng]);
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onCambiarCoordsRef.current([lat, lng]);
    });

    mapaRef.current = map;
    marcadorRef.current = marker;

    return () => {
      map.remove();
      mapaRef.current = null;
      marcadorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const objetivo = coords || COORDENADAS_COMUNA[comuna] || COORDENADAS_COMUNA['Chillán'];
    if (mapaRef.current && marcadorRef.current) {
      mapaRef.current.setView(objetivo, 14);
      marcadorRef.current.setLatLng(objetivo);
    }
  }, [comuna, coords]);

  return (
    <div
      ref={contenedorRef}
      className="rounded-3 border overflow-hidden"
      style={{ height: '260px', width: '100%' }}
    />
  );
}

export default function CheckoutDireccion({ datosPrevios = {}, onContinuar, onVolver }) {
  const comunaInicial = datosPrevios.comuna || 'Chillán';

  const [formData, setFormData] = useState({
    street: datosPrevios.street || '',
    unit: datosPrevios.unit || '',
    comuna: comunaInicial,
    phone: datosPrevios.phone || '',
    refs: datosPrevios.refs || '',
    slot: datosPrevios.slot || 'asap',
    coords: datosPrevios.coords || COORDENADAS_COMUNA[comunaInicial] || COORDENADAS_COMUNA['Chillán']
  });

  const [errores, setErrores] = useState({});

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'comuna') {
        return {
          ...prev,
          comuna: value,
          coords: COORDENADAS_COMUNA[value] || prev.coords
        };
      }
      return { ...prev, [name]: value };
    });

    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  const seleccionarHorario = (id) => {
    setFormData((prev) => ({ ...prev, slot: id }));
  };

  const manejarCambiarCoords = (nuevasCoords) => {
    setFormData((prev) => ({ ...prev, coords: nuevasCoords }));
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    const errCalle = validarCalleNumero(formData.street);
    const errComuna = validarComuna(formData.comuna);
    const errTel = validarTelefono(formData.phone);

    const listaErrores = {};
    if (errCalle) listaErrores.street = errCalle;
    if (errComuna) listaErrores.comuna = errComuna;
    if (errTel) listaErrores.phone = errTel;

    if (Object.keys(listaErrores).length > 0) {
      setErrores(listaErrores);
      return;
    }

    setErrores({});
    onContinuar(formData);
  };

  return (
    <div className="checkout-card p-4 p-md-5">
      <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--volcan-navy)' }}>
        ¿Dónde entregamos?
      </h1>
      <p className="small mb-4" style={{ color: 'var(--volcan-muted)' }}>
        El repartidor verá esta dirección y tus referencias en su celular.
      </p>

      <form onSubmit={manejarEnvio} noValidate>
        <div className="row g-3">
          <div className="col-12">
            <label htmlFor="street" className="form-label">
              Calle y número *
            </label>
            <input
              type="text"
              id="street"
              name="street"
              className={`form-control ${errores.street ? 'is-invalid' : ''}`}
              placeholder="Ej.: Av. Libertad 1234"
              value={formData.street}
              onChange={manejarCambio}
            />
            {errores.street && <div className="invalid-feedback">{errores.street}</div>}
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="unit" className="form-label">
              Depto, casa o block <span className="fw-normal text-muted">(opcional)</span>
            </label>
            <input
              type="text"
              id="unit"
              name="unit"
              className="form-control"
              placeholder=""
              value={formData.unit}
              onChange={manejarCambio}
            />
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="comuna" className="form-label">
              Comuna *
            </label>
            <select
              id="comuna"
              name="comuna"
              className={`form-select ${errores.comuna ? 'is-invalid' : ''}`}
              value={formData.comuna}
              onChange={manejarCambio}
            >
              <option value="Chillán">Chillán</option>
              <option value="Chillán Viejo">Chillán Viejo</option>
              <option value="Coihueco">Coihueco</option>
              <option value="Pinto">Pinto</option>
              <option value="Bulnes">Bulnes</option>
              <option value="San Carlos">San Carlos</option>
            </select>
            {errores.comuna && <div className="invalid-feedback">{errores.comuna}</div>}
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="phone" className="form-label">
              Teléfono de contacto *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`form-control ${errores.phone ? 'is-invalid' : ''}`}
              placeholder="Ej: +56 9 1234 5678"
              value={formData.phone}
              onChange={manejarCambio}
            />
            {errores.phone && <div className="invalid-feedback">{errores.phone}</div>}
          </div>

          <div className="col-12">
            <label htmlFor="refs" className="form-label">
              Referencias <span className="fw-normal text-muted">(opcional)</span>
            </label>
            <input
              type="text"
              id="refs"
              name="refs"
              className="form-control"
              placeholder="Ej.: portón verde, tocar timbre"
              value={formData.refs}
              onChange={manejarCambio}
            />
          </div>

          <div className="col-12 mt-4">
            <label className="form-label d-block mb-2">
              ¿Cuándo lo necesitas?
            </label>
            <div className="d-flex flex-wrap gap-2">
              {HORARIOS.map((h) => {
                const activo = formData.slot === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    className={`btn-grupo-horario ${activo ? 'activo' : ''}`}
                    onClick={() => seleccionarHorario(h.id)}
                  >
                    {h.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="col-12 mt-4">
            <label className="form-label d-block mb-2">
              Ubicación en el mapa{' '}
              <span className="fw-normal text-muted">(arrastra el pin o haz clic en el mapa)</span>
            </label>
            <MapaDireccion
              comuna={formData.comuna}
              coords={formData.coords}
              onCambiarCoords={manejarCambiarCoords}
            />
            <div className="form-text mt-2">
              {formData.street.trim()
                ? `${formData.street}, ${formData.comuna}`
                : `Centrado en ${formData.comuna}`}
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
          {onVolver ? (
            <button
              type="button"
              className="btn btn-outline-volcan"
              onClick={onVolver}
            >
              ← Volver al catálogo
            </button>
          ) : <span />}
          <button type="submit" className="btn btn-volcan">
            Continuar al pago →
          </button>
        </div>
      </form>
    </div>
  );
}