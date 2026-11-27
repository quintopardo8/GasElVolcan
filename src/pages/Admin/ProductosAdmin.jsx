import { useMemo, useState } from 'react'
import { productosApi } from '../../utils/api.js'
import { formatearDinero, STOCK_BAJO } from '../../data/catalogo.js'
import { useCarga } from './adminUtils.js'
import { Aviso, Cargando, Encabezado, SinResultados } from './components/Comunes.jsx'
import FormProducto from './components/FormProducto.jsx'
import ModalConfirmar from './components/ModalConfirmar.jsx'

// Campo de stock editable directamente en la tabla (conteo de bodega).
function StockEditable({ producto, onGuardar }) {
  const [valor, setValor] = useState(String(producto.stock))
  const [guardando, setGuardando] = useState(false)
  const cambiado = valor !== String(producto.stock)
  const valido = /^\d+$/.test(valor)

  const guardar = async (e) => {
    e.preventDefault()
    if (!cambiado || !valido) return
    setGuardando(true)
    try {
      await onGuardar(Number(valor))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="admin-stock" onSubmit={guardar}>
      <input
        type="number"
        min="0"
        className={`form-control form-control-sm ${!valido ? 'is-invalid' : ''}`}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        aria-label={`Stock de ${producto.nombre}`}
      />
      {cambiado && (
        <button type="submit" className="btn btn-sm btn-primary" disabled={!valido || guardando}>
          {guardando ? '...' : 'Guardar'}
        </button>
      )}
      {!cambiado && producto.stock <= STOCK_BAJO && (
        <span className={`badge ${producto.stock === 0 ? 'text-bg-danger' : 'text-bg-warning'}`}>
          {producto.stock === 0 ? 'Agotado' : 'Bajo'}
        </span>
      )}
    </form>
  )
}

export default function ProductosAdmin() {
  const productos = useCarga(() => productosApi.listar({ todos: true }), [])
  const categorias = useCarga(() => productosApi.categorias(), [])
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [buscar, setBuscar] = useState('')
  const [aviso, setAviso] = useState({ tipo: 'success', texto: '' })
  // { tipo: 'crear' } | { tipo: 'editar', producto } | { tipo: 'eliminar', producto }
  const [dialogo, setDialogo] = useState(null)

  const visibles = useMemo(() => {
    const texto = buscar.trim().toLowerCase()
    return (productos.datos ?? []).filter(
      (p) =>
        (!filtroCategoria || String(p.categoriaId) === filtroCategoria) &&
        (!texto || p.nombre.toLowerCase().includes(texto) || p.codigo.toLowerCase().includes(texto)),
    )
  }, [productos.datos, filtroCategoria, buscar])

  const avisar = (texto, tipo = 'success') => setAviso({ tipo, texto })
  const cerrarDialogo = () => setDialogo(null)
  const recargar = productos.recargar

  const guardar = async (datos) => {
    if (dialogo.tipo === 'crear') {
      await productosApi.crear(datos)
      avisar(`Producto ${datos.codigo} creado.`)
    } else {
      await productosApi.actualizar(dialogo.producto.codigo, datos)
      avisar(`Producto ${dialogo.producto.codigo} actualizado.`)
    }
    cerrarDialogo()
    recargar()
  }

  const guardarStock = async (p, stock) => {
    try {
      await productosApi.cambiarStock(p.codigo, stock)
      avisar(`Stock de ${p.nombre}: ${stock} unidades.`)
      recargar()
    } catch (e) {
      avisar(e.message, 'danger')
    }
  }

  const alternarActivo = async (p) => {
    try {
      await productosApi.actualizar(p.codigo, { ...p, activo: !p.activo })
      avisar(`${p.nombre} ${p.activo ? 'ya no se muestra' : 'vuelve a mostrarse'} en el catálogo.`)
      recargar()
    } catch (e) {
      avisar(e.message, 'danger')
    }
  }

  const eliminar = async () => {
    await productosApi.eliminar(dialogo.producto.codigo)
    avisar(`Producto ${dialogo.producto.codigo} eliminado.`)
    recargar()
  }

  return (
    <>
      <Encabezado
        titulo="Productos y stock"
        descripcion="Catálogo, precios y stock disponible en bodega."
        acciones={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setDialogo({ tipo: 'crear' })}
            disabled={!categorias.datos?.length}
          >
            + Nuevo producto
          </button>
        }
      />

      <Aviso tipo={aviso.tipo} onCerrar={() => avisar('')}>{aviso.texto}</Aviso>
      <Aviso tipo="danger">{productos.error || categorias.error}</Aviso>

      <section className="admin-tarjeta">
        <div className="admin-filtros">
          <div>
            <label htmlFor="filtro-categoria" className="form-label">Categoría</label>
            <select id="filtro-categoria" className="form-select" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="">Todas</option>
              {(categorias.datos ?? []).map((c) => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-producto" className="form-label">Buscar</label>
            <input
              id="filtro-producto"
              type="search"
              className="form-control"
              placeholder="Código o nombre"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
        </div>

        {productos.cargando ? (
          <Cargando />
        ) : visibles.length === 0 ? (
          <SinResultados>No hay productos que coincidan con el filtro.</SinResultados>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover admin-tabla">
              <caption className="visually-hidden">Productos del catálogo</caption>
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Producto</th>
                  <th scope="col" className="text-end">Precio</th>
                  <th scope="col" className="text-end d-none d-md-table-cell">Comercial</th>
                  <th scope="col">Stock</th>
                  <th scope="col" className="d-none d-sm-table-cell">Estado</th>
                  <th scope="col" className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((p) => (
                  <tr key={p.codigo} className={p.activo ? '' : 'fila-inactiva'}>
                    <td className="fw-semibold">{p.codigo}</td>
                    <td>
                      {p.nombre}
                      <div className="admin-muted">{p.categoria}</div>
                    </td>
                    <td className="text-end">{formatearDinero(p.precio)}</td>
                    <td className="text-end d-none d-md-table-cell">{formatearDinero(p.precioComercial)}</td>
                    <td>
                      {/* key con el stock: si cambia desde el servidor, el campo se reinicia. */}
                      <StockEditable key={p.stock} producto={p} onGuardar={(stock) => guardarStock(p, stock)} />
                    </td>
                    <td className="d-none d-sm-table-cell">
                      <span className={`badge ${p.activo ? 'text-bg-success' : 'text-bg-secondary'}`}>
                        {p.activo ? 'Activo' : 'Oculto'}
                      </span>
                    </td>
                    <td className="acciones">
                      <button type="button" className="btn btn-sm btn-outline-primary"
                        onClick={() => setDialogo({ tipo: 'editar', producto: p })} aria-label={`Editar ${p.nombre}`}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-secondary"
                        onClick={() => alternarActivo(p)} aria-label={`${p.activo ? 'Ocultar' : 'Mostrar'} ${p.nombre}`}>
                        {p.activo ? 'Ocultar' : 'Mostrar'}
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger"
                        onClick={() => setDialogo({ tipo: 'eliminar', producto: p })} aria-label={`Eliminar ${p.nombre}`}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {(dialogo?.tipo === 'crear' || dialogo?.tipo === 'editar') && (
        <FormProducto
          producto={dialogo.producto}
          categorias={categorias.datos ?? []}
          onGuardar={guardar}
          onCerrar={cerrarDialogo}
        />
      )}

      {dialogo?.tipo === 'eliminar' && (
        <ModalConfirmar
          titulo="Eliminar producto"
          mensaje={`¿Eliminar ${dialogo.producto.codigo} · ${dialogo.producto.nombre}? Si ya aparece en pedidos no se podrá eliminar: en ese caso usa "Ocultar".`}
          onConfirmar={eliminar}
          onCerrar={cerrarDialogo}
        />
      )}
    </>
  )
}
