import { useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import { Campo } from './Comunes.jsx'
import { formatearDinero } from '../../../data/catalogo.js'
import { COMUNAS, FRANJAS, METODOS_PAGO, telefonoValido } from '../adminUtils.js'

// Crear un pedido tomado por teléfono (pedido = null) o editar uno existente.
// Los productos solo se pueden cambiar mientras el pedido está pendiente o asignado.
export default function FormPedido({ pedido, productos, onGuardar, onCerrar }) {
  const editando = Boolean(pedido)
  const puedeCambiarProductos = !editando || ['PENDIENTE', 'ASIGNADO'].includes(pedido.estado)

  const [datos, setDatos] = useState({
    clienteNombre: pedido?.clienteNombre ?? '',
    telefono: pedido?.telefono ?? '',
    calle: pedido?.calle ?? '',
    depto: pedido?.depto ?? '',
    comuna: pedido?.comuna ?? 'Chillán',
    referencia: pedido?.referencia ?? '',
    franja: pedido?.franja ?? FRANJAS[0],
    metodoPago: pedido?.metodoPago ?? 'EFECTIVO',
  })
  const [lineas, setLineas] = useState(
    pedido?.lineas?.map((l) => ({ codigo: l.codigo, cantidad: String(l.cantidad) })) ?? [{ codigo: '', cantidad: '1' }],
  )
  const [lineasCambiadas, setLineasCambiadas] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)

  const porCodigo = useMemo(() => Object.fromEntries(productos.map((p) => [p.codigo, p])), [productos])

  const total = lineas.reduce((suma, l) => {
    const producto = porCodigo[l.codigo]
    return suma + (producto ? producto.precio * (Number(l.cantidad) || 0) : 0)
  }, 0)

  const cambiar = (e) => {
    const { name, value } = e.target
    setDatos((d) => ({ ...d, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  const cambiarLinea = (indice, campo, valor) => {
    setLineas((ls) => ls.map((l, i) => (i === indice ? { ...l, [campo]: valor } : l)))
    setLineasCambiadas(true)
    setErrores((prev) => ({ ...prev, lineas: '' }))
  }
  const agregarLinea = () => {
    setLineas((ls) => [...ls, { codigo: '', cantidad: '1' }])
    setLineasCambiadas(true)
  }
  const quitarLinea = (indice) => {
    setLineas((ls) => ls.filter((_, i) => i !== indice))
    setLineasCambiadas(true)
  }

  const validar = () => {
    const e = {}
    if (!datos.clienteNombre.trim()) e.clienteNombre = 'Indica el nombre del cliente.'
    if (!telefonoValido(datos.telefono)) e.telefono = 'Celular chileno válido, ej: 912345678.'
    if (datos.calle.trim().length < 5) e.calle = 'Calle y número (mínimo 5 caracteres).'
    if (!COMUNAS.includes(datos.comuna)) e.comuna = 'Selecciona una comuna.'
    if (puedeCambiarProductos) {
      const completas = lineas.filter((l) => l.codigo)
      if (completas.length === 0) e.lineas = 'Agrega al menos un producto.'
      else if (completas.some((l) => !(Number(l.cantidad) >= 1 && Number(l.cantidad) <= 50))) e.lineas = 'Cada cantidad debe estar entre 1 y 50.'
    }
    return e
  }

  const enviar = async (e) => {
    e.preventDefault()
    const encontrados = validar()
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    const cuerpo = {
      ...datos,
      clienteNombre: datos.clienteNombre.trim(),
      calle: datos.calle.trim(),
      depto: datos.depto.trim() || null,
      referencia: datos.referencia.trim() || null,
      // Al editar, null = mantener los productos actuales (y su precio original).
      lineas:
        puedeCambiarProductos && (!editando || lineasCambiadas)
          ? lineas.filter((l) => l.codigo).map((l) => ({ codigo: l.codigo, cantidad: Number(l.cantidad) }))
          : null,
    }

    setEnviando(true)
    setErrorGeneral('')
    try {
      await onGuardar(cuerpo)
    } catch (error) {
      setErrores(error.campos || {})
      setErrorGeneral(error.message)
      setEnviando(false)
    }
  }

  const clase = (campo, base = 'form-control') => `${base} ${errores[campo] ? 'is-invalid' : ''}`

  return (
    <Modal
      titulo={editando ? `Editar pedido ${pedido.codigo}` : 'Nuevo pedido (por teléfono)'}
      tamano="modal-lg"
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>Cancelar</button>
          <button type="submit" form="form-pedido" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear pedido'}
          </button>
        </>
      }
    >
      <form id="form-pedido" onSubmit={enviar} noValidate>
        {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

        <fieldset>
          <legend className="fs-6 fw-bold">Cliente y entrega</legend>
          <div className="row">
            <Campo id="pe-nombre" etiqueta="Nombre del cliente *" error={errores.clienteNombre} className="col-md-7">
              <input id="pe-nombre" name="clienteNombre" className={clase('clienteNombre')} value={datos.clienteNombre} onChange={cambiar} maxLength={100} />
            </Campo>
            <Campo id="pe-telefono" etiqueta="Teléfono *" error={errores.telefono} className="col-md-5">
              <input id="pe-telefono" name="telefono" type="tel" className={clase('telefono')} value={datos.telefono} onChange={cambiar} placeholder="912345678" />
            </Campo>
          </div>
          <div className="row">
            <Campo id="pe-calle" etiqueta="Calle y número *" error={errores.calle} className="col-md-8">
              <input id="pe-calle" name="calle" className={clase('calle')} value={datos.calle} onChange={cambiar} maxLength={150} />
            </Campo>
            <Campo id="pe-depto" etiqueta="Depto / casa" error={errores.depto} className="col-md-4">
              <input id="pe-depto" name="depto" className={clase('depto')} value={datos.depto} onChange={cambiar} maxLength={50} />
            </Campo>
          </div>
          <div className="row">
            <Campo id="pe-comuna" etiqueta="Comuna *" error={errores.comuna} className="col-md-4">
              <select id="pe-comuna" name="comuna" className={clase('comuna', 'form-select')} value={datos.comuna} onChange={cambiar}>
                {COMUNAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Campo>
            <Campo id="pe-franja" etiqueta="Horario" error={errores.franja} className="col-md-4">
              <select id="pe-franja" name="franja" className="form-select" value={datos.franja} onChange={cambiar}>
                {FRANJAS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Campo>
            <Campo id="pe-pago" etiqueta="Pago" error={errores.metodoPago} className="col-md-4">
              <select id="pe-pago" name="metodoPago" className="form-select" value={datos.metodoPago} onChange={cambiar}>
                {Object.entries(METODOS_PAGO).map(([id, texto]) => <option key={id} value={id}>{texto}</option>)}
              </select>
            </Campo>
          </div>
          <Campo id="pe-referencia" etiqueta="Referencias" error={errores.referencia}>
            <input id="pe-referencia" name="referencia" className={clase('referencia')} value={datos.referencia} onChange={cambiar}
              maxLength={200} placeholder="Ej: portón verde, tocar timbre" />
          </Campo>
        </fieldset>

        <fieldset>
          <legend className="fs-6 fw-bold">Productos</legend>
          {!puedeCambiarProductos && (
            <p className="admin-muted">El pedido ya va en camino: los productos no se pueden cambiar.</p>
          )}
          <div className="admin-lineas">
            {lineas.map((l, i) => (
              <div className="admin-linea" key={i}>
                <select
                  className="form-select"
                  aria-label={`Producto ${i + 1}`}
                  value={l.codigo}
                  onChange={(e) => cambiarLinea(i, 'codigo', e.target.value)}
                  disabled={!puedeCambiarProductos}
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((p) => (
                    <option key={p.codigo} value={p.codigo} disabled={p.stock === 0 && p.codigo !== l.codigo}>
                      {p.nombre} · {formatearDinero(p.precio)} (stock {p.stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="form-control"
                  aria-label={`Cantidad del producto ${i + 1}`}
                  value={l.cantidad}
                  onChange={(e) => cambiarLinea(i, 'cantidad', e.target.value)}
                  disabled={!puedeCambiarProductos}
                />
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => quitarLinea(i)}
                  disabled={!puedeCambiarProductos || lineas.length === 1}
                  aria-label={`Quitar producto ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {errores.lineas && <div className="invalid-feedback d-block">{errores.lineas}</div>}
          {puedeCambiarProductos && (
            <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={agregarLinea}>
              + Agregar producto
            </button>
          )}
          <div className="admin-total">
            <span>Total {editando && !lineasCambiadas ? '' : 'estimado'}</span>
            <span>{formatearDinero(editando && !lineasCambiadas ? pedido.total : total)}</span>
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
