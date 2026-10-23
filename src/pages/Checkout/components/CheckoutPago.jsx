import { useState } from 'react';
import {
  validarNombreTitular,
  validarNumeroTarjeta,
  validarVencimiento,
  validarCvv
} from '../../../utils/validadoresCheckout';

export default function CheckoutPago({ onConfirmar, onVolverAtras }) {
  const [metodo, setMetodo] = useState('tarjeta');
  const [datosTarjeta, setDatosTarjeta] = useState({
    titular: '',
    numero: '',
    vencimiento: '',
    cvv: ''
  });
  const [errores, setErrores] = useState({});

  const manejarCambioTarjeta = (e) => {
    const { name, value } = e.target;
    setDatosTarjeta((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  const manejarEnvio = (e) => {
    e.preventDefault();

    if (metodo === 'tarjeta') {
      const errTitular = validarNombreTitular(datosTarjeta.titular);
      const errNumero = validarNumeroTarjeta(datosTarjeta.numero);
      const errVenc = validarVencimiento(datosTarjeta.vencimiento);
      const errCvv = validarCvv(datosTarjeta.cvv);

      const lista = {};
      if (errTitular) lista.titular = errTitular;
      if (errNumero) lista.numero = errNumero;
      if (errVenc) lista.vencimiento = errVenc;
      if (errCvv) lista.cvv = errCvv;

      if (Object.keys(lista).length > 0) {
        setErrores(lista);
        return;
      }
    }

    setErrores({});
    onConfirmar({
      metodo,
      ...(metodo === 'tarjeta' ? { titular: datosTarjeta.titular } : {})
    });
  };

  return (
    <div className="checkout-card p-4 p-md-5">
      <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--volcan-navy)' }}>
        Método de pago
      </h1>
      <p className="small mb-4" style={{ color: 'var(--volcan-muted)' }}>
        Selecciona cómo deseas pagar tu cilindro de gas.
      </p>

      <form onSubmit={manejarEnvio} noValidate>
        <div className="row g-2 mb-4">
          <div className="col-12 col-md-4">
            <button
              type="button"
              className={`w-100 p-3 text-start rounded-3 border h-100 ${
                metodo === 'tarjeta' ? 'border-volcan bg-volcan-subtle' : 'bg-white'
              }`}
              onClick={() => setMetodo('tarjeta')}
            >
              <div className="fw-bold mb-1" style={{ color: 'var(--volcan-navy)' }}>
                Tarjeta Débito/Crédito
              </div>
              <small className="text-secondary d-block">Webpay / Transbank</small>
            </button>
          </div>

          <div className="col-12 col-md-4">
            <button
              type="button"
              className={`w-100 p-3 text-start rounded-3 border h-100 ${
                metodo === 'efectivo' ? 'border-volcan bg-volcan-subtle' : 'bg-white'
              }`}
              onClick={() => setMetodo('efectivo')}
            >
              <div className="fw-bold mb-1" style={{ color: 'var(--volcan-navy)' }}>
                Efectivo contra entrega
              </div>
              <small className="text-secondary d-block">Pagas al chofer al recibir</small>
            </button>
          </div>

          <div className="col-12 col-md-4">
            <button
              type="button"
              className={`w-100 p-3 text-start rounded-3 border h-100 ${
                metodo === 'transferencia' ? 'border-volcan bg-volcan-subtle' : 'bg-white'
              }`}
              onClick={() => setMetodo('transferencia')}
            >
              <div className="fw-bold mb-1" style={{ color: 'var(--volcan-navy)' }}>
                Transferencia directa
              </div>
              <small className="text-secondary d-block">Envías comprobante</small>
            </button>
          </div>
        </div>

        <div style={{ minHeight: '260px' }}>
          {metodo === 'tarjeta' && (
            <div className="p-4 rounded-3 border bg-light-subtle">
              <h6 className="fw-bold mb-3" style={{ color: 'var(--volcan-navy)' }}>
                Datos de la tarjeta
              </h6>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nombre en la tarjeta *</label>
                  <input
                    type="text"
                    name="titular"
                    className={`form-control ${errores.titular ? 'is-invalid' : ''}`}
                    placeholder="Ej.: SEBASTIAN PARDO"
                    value={datosTarjeta.titular}
                    onChange={manejarCambioTarjeta}
                  />
                  {errores.titular && <div className="invalid-feedback">{errores.titular}</div>}
                </div>

                <div className="col-12">
                  <label className="form-label">Número de tarjeta *</label>
                  <input
                    type="text"
                    name="numero"
                    maxLength={19}
                    className={`form-control ${errores.numero ? 'is-invalid' : ''}`}
                    placeholder="1234 5678 9012 3456"
                    value={datosTarjeta.numero}
                    onChange={manejarCambioTarjeta}
                  />
                  {errores.numero && <div className="invalid-feedback">{errores.numero}</div>}
                </div>

                <div className="col-6">
                  <label className="form-label">Vencimiento (MM/AA) *</label>
                  <input
                    type="text"
                    name="vencimiento"
                    maxLength={5}
                    className={`form-control ${errores.vencimiento ? 'is-invalid' : ''}`}
                    placeholder="08/27"
                    value={datosTarjeta.vencimiento}
                    onChange={manejarCambioTarjeta}
                  />
                  {errores.vencimiento && <div className="invalid-feedback">{errores.vencimiento}</div>}
                </div>

                <div className="col-6">
                  <label className="form-label">CVV *</label>
                  <input
                    type="password"
                    name="cvv"
                    maxLength={4}
                    className={`form-control ${errores.cvv ? 'is-invalid' : ''}`}
                    placeholder="123"
                    value={datosTarjeta.cvv}
                    onChange={manejarCambioTarjeta}
                  />
                  {errores.cvv && <div className="invalid-feedback">{errores.cvv}</div>}
                </div>
              </div>
            </div>
          )}

          {metodo === 'efectivo' && (
            <div className="p-4 rounded-3 border bg-light-subtle">
              <h6 className="fw-bold mb-2" style={{ color: 'var(--volcan-navy)' }}>
                Pago en efectivo al repartidor
              </h6>
              <p className="text-secondary small mb-3">
                Puedes pagar con billetes o monedas al recibir tu cilindro en tu domicilio.
              </p>
              <div className="alert alert-info py-2 small mb-0">
                <strong>Vuelto disponible:</strong> El camión cuenta con sencillo para billetes de hasta $20.000.
              </div>
            </div>
          )}

          {metodo === 'transferencia' && (
            <div className="p-4 rounded-3 border bg-light-subtle">
              <h6 className="fw-bold mb-2" style={{ color: 'var(--volcan-navy)' }}>
                Datos de transferencia bancaria
              </h6>
              <p className="text-secondary small mb-3">
                Transfiere el monto total y envía el comprobante por WhatsApp para validar el despacho.
              </p>
              <div className="p-3 bg-white rounded border small mb-3">
                <div><strong>Banco:</strong> BancoEstado</div>
                <div><strong>Tipo de Cuenta:</strong> Cuenta Corriente N° 123456789</div>
                <div><strong>RUT:</strong> 76.543.210-K</div>
                <div><strong>Razón Social:</strong> Distribuidora Gas El Volcán SpA</div>
              </div>
              <div className="alert alert-info py-2 px-3 small mb-0">
                📱 <strong>WhatsApp para comprobantes:</strong> +56 9 0011 1222
              </div>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
          <button
            type="button"
            className="btn btn-outline-volcan"
            onClick={onVolverAtras}
          >
            ← Volver a dirección
          </button>
          <button type="submit" className="btn btn-volcan">
            Confirmar y finalizar pedido
          </button>
        </div>
      </form>
    </div>
  );
}