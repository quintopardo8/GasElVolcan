import { useState } from 'react';
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

export default function CheckoutDireccion({ datosPrevios = {}, onContinuar, onVolver }) {
  const [formData, setFormData] = useState({
    street: datosPrevios.street || '',
    unit: datosPrevios.unit || '',
    comuna: datosPrevios.comuna || 'Chillán',
    phone: datosPrevios.phone || '',
    refs: datosPrevios.refs || '',
    slot: datosPrevios.slot || 'asap'
  });

  const [errores, setErrores] = useState({});

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  const seleccionarHorario = (id) => {
    setFormData((prev) => ({ ...prev, slot: id }));
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
            <div className="mapa-simulado position-relative p-4 rounded-3 border bg-light text-center">
              <div className="mapa-pin fs-2">📍</div>
              <div className="position-absolute bottom-0 start-0 m-3 bg-white px-3 py-2 rounded shadow-sm small fw-semibold text-dark">
                Escribe tu dirección para ubicarla en el mapa
              </div>
              <div className="position-absolute bottom-0 end-0 m-3 bg-dark bg-opacity-75 text-white px-2 py-1 rounded small" style={{ fontSize: '11px' }}>
                Mapa interactivo · Leaflet / Google Maps
              </div>
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