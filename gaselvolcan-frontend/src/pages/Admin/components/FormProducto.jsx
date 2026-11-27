import { useState } from 'react'
import Modal from './Modal.jsx'
import { Campo } from './Comunes.jsx'

const entero = (valor) => (valor === '' || valor === null || valor === undefined ? null : Number(valor))

// Crear (producto = null) o editar un producto del catálogo.
export default function FormProducto({ producto, categorias, onGuardar, onCerrar }) {
  const editando = Boolean(producto)
  const [datos, setDatos] = useState({
    codigo: producto?.codigo ?? '',
    categoriaId: producto?.categoriaId ?? categorias[0]?.id ?? '',
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    unidad: producto?.unidad ?? 'Unidad',
    kg: producto?.kg ?? '',
    precio: producto?.precio ?? '',
    precioComercial: producto?.precioComercial ?? '',
    stock: producto?.stock ?? 0,
    activo: producto?.activo ?? true,
  })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target
    setDatos((d) => ({ ...d, [name]: type === 'checkbox' ? checked : value }))
    setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  const validar = () => {
    const e = {}
    if (!editando && !/^[A-Za-z0-9]{3,10}$/.test(datos.codigo.trim())) e.codigo = 'De 3 a 10 letras o números (ej: CL005).'
    if (!datos.categoriaId) e.categoriaId = 'Selecciona una categoría.'
    if (!datos.nombre.trim()) e.nombre = 'El nombre es obligatorio.'
    if (!datos.unidad.trim()) e.unidad = 'La unidad es obligatoria.'
    if (datos.kg !== '' && !(Number(datos.kg) > 0)) e.kg = 'Debe ser mayor a 0.'
    for (const campo of ['precio', 'precioComercial', 'stock']) {
      if (datos[campo] === '' || !Number.isInteger(Number(datos[campo])) || Number(datos[campo]) < 0) {
        e[campo] = 'Número entero, 0 o mayor.'
      }
    }
    return e
  }

  const enviar = async (e) => {
    e.preventDefault()
    const encontrados = validar()
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setEnviando(true)
    setErrorGeneral('')
    try {
      await onGuardar({
        codigo: datos.codigo.trim().toUpperCase(),
        categoriaId: Number(datos.categoriaId),
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion.trim() || null,
        unidad: datos.unidad.trim(),
        kg: entero(datos.kg),
        precio: Number(datos.precio),
        precioComercial: Number(datos.precioComercial),
        stock: Number(datos.stock),
        activo: datos.activo,
      })
    } catch (error) {
      setErrores(error.campos || {})
      setErrorGeneral(error.message)
      setEnviando(false)
    }
  }

  const clase = (campo, base = 'form-control') => `${base} ${errores[campo] ? 'is-invalid' : ''}`

  return (
    <Modal
      titulo={editando ? `Editar ${producto.codigo}` : 'Nuevo producto'}
      tamano="modal-lg"
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>Cancelar</button>
          <button type="submit" form="form-producto" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </>
      }
    >
      <form id="form-producto" onSubmit={enviar} noValidate>
        {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

        <div className="row">
          <Campo id="p-codigo" etiqueta="Código *" error={errores.codigo} className="col-sm-4"
            ayuda={editando ? 'El código no se puede cambiar.' : null}>
            <input id="p-codigo" name="codigo" className={clase('codigo')} value={datos.codigo} onChange={cambiar}
              disabled={editando} maxLength={10} placeholder="CL005" />
          </Campo>
          <Campo id="p-categoria" etiqueta="Categoría *" error={errores.categoriaId} className="col-sm-8">
            <select id="p-categoria" name="categoriaId" className={clase('categoriaId', 'form-select')} value={datos.categoriaId} onChange={cambiar}>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Campo>
        </div>

        <Campo id="p-nombre" etiqueta="Nombre *" error={errores.nombre}>
          <input id="p-nombre" name="nombre" className={clase('nombre')} value={datos.nombre} onChange={cambiar} maxLength={120} />
        </Campo>

        <Campo id="p-descripcion" etiqueta="Descripción" error={errores.descripcion}>
          <textarea id="p-descripcion" name="descripcion" rows={2} className={clase('descripcion')} value={datos.descripcion} onChange={cambiar} maxLength={500} />
        </Campo>

        <div className="row">
          <Campo id="p-unidad" etiqueta="Unidad *" error={errores.unidad} className="col-6 col-md-3">
            <input id="p-unidad" name="unidad" className={clase('unidad')} value={datos.unidad} onChange={cambiar} maxLength={20} list="p-unidades" />
            <datalist id="p-unidades">
              <option value="Unidad" />
              <option value="Kit" />
            </datalist>
          </Campo>
          <Campo id="p-kg" etiqueta="Kg (cilindros)" error={errores.kg} className="col-6 col-md-3">
            <input id="p-kg" name="kg" type="number" min="1" className={clase('kg')} value={datos.kg} onChange={cambiar} />
          </Campo>
          <Campo id="p-stock" etiqueta="Stock *" error={errores.stock} className="col-12 col-md-6">
            <input id="p-stock" name="stock" type="number" min="0" className={clase('stock')} value={datos.stock} onChange={cambiar} />
          </Campo>
        </div>

        <div className="row">
          <Campo id="p-precio" etiqueta="Precio residencial (CLP) *" error={errores.precio} className="col-sm-6">
            <input id="p-precio" name="precio" type="number" min="0" className={clase('precio')} value={datos.precio} onChange={cambiar} />
          </Campo>
          <Campo id="p-precio-comercial" etiqueta="Precio comercial (CLP) *" error={errores.precioComercial} className="col-sm-6">
            <input id="p-precio-comercial" name="precioComercial" type="number" min="0" className={clase('precioComercial')} value={datos.precioComercial} onChange={cambiar} />
          </Campo>
        </div>

        <div className="form-check">
          <input id="p-activo" name="activo" type="checkbox" className="form-check-input" checked={datos.activo} onChange={cambiar} />
          <label htmlFor="p-activo" className="form-check-label">Visible en el catálogo (activo)</label>
        </div>
      </form>
    </Modal>
  )
}
