import { useMemo, useState } from 'react'
import { usuariosApi } from '../../utils/api.js'
import { obtenerSesion } from '../../utils/sesion.js'
import { CLASE_ROL, ETIQUETA_ROL, ROLES, formatearFecha, useCarga } from './adminUtils.js'
import { Aviso, Cargando, Encabezado, SinResultados } from './components/Comunes.jsx'
import FormUsuario from './components/FormUsuario.jsx'
import ModalConfirmar from './components/ModalConfirmar.jsx'

export default function UsuariosAdmin() {
  const idActual = obtenerSesion()?.id
  const { datos: usuarios, error, cargando, recargar } = useCarga(() => usuariosApi.listar(), [])
  const [filtroRol, setFiltroRol] = useState('')
  const [buscar, setBuscar] = useState('')
  const [aviso, setAviso] = useState({ tipo: 'success', texto: '' })
  // { tipo: 'crear' } | { tipo: 'editar', usuario } | { tipo: 'eliminar', usuario }
  const [dialogo, setDialogo] = useState(null)

  const visibles = useMemo(() => {
    const texto = buscar.trim().toLowerCase()
    return (usuarios ?? []).filter(
      (u) =>
        (!filtroRol || u.rol === filtroRol) &&
        (!texto || u.nombre.toLowerCase().includes(texto) || u.correo.includes(texto)),
    )
  }, [usuarios, filtroRol, buscar])

  const cerrarDialogo = () => setDialogo(null)
  const avisar = (texto, tipo = 'success') => setAviso({ tipo, texto })

  const guardar = async (datos) => {
    if (dialogo.tipo === 'crear') {
      await usuariosApi.crear(datos)
      avisar(`Usuario ${datos.nombre} creado.`)
    } else {
      await usuariosApi.actualizar(dialogo.usuario.id, datos)
      avisar(`Cambios de ${datos.nombre} guardados.`)
    }
    cerrarDialogo()
    recargar()
  }

  const alternarActivo = async (u) => {
    try {
      await usuariosApi.cambiarActivo(u.id, !u.activo)
      avisar(`${u.nombre} quedó ${u.activo ? 'desactivado' : 'activo'}.`)
      recargar()
    } catch (e) {
      avisar(e.message, 'danger')
    }
  }

  const eliminar = async () => {
    await usuariosApi.eliminar(dialogo.usuario.id)
    avisar(`Usuario ${dialogo.usuario.nombre} eliminado.`)
    recargar()
  }

  return (
    <>
      <Encabezado
        titulo="Usuarios"
        descripcion="Crea, edita y desactiva cuentas, y asigna el rol de cada persona."
        acciones={
          <button type="button" className="btn btn-primary" onClick={() => setDialogo({ tipo: 'crear' })}>
            + Nuevo usuario
          </button>
        }
      />

      <Aviso tipo={aviso.tipo} onCerrar={() => avisar('')}>{aviso.texto}</Aviso>
      <Aviso tipo="danger">{error}</Aviso>

      <section className="admin-tarjeta">
        <div className="admin-filtros">
          <div>
            <label htmlFor="filtro-rol" className="form-label">Rol</label>
            <select id="filtro-rol" className="form-select" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
              <option value="">Todos</option>
              {ROLES.map((r) => <option key={r} value={r}>{ETIQUETA_ROL[r]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-buscar" className="form-label">Buscar</label>
            <input
              id="filtro-buscar"
              type="search"
              className="form-control"
              placeholder="Nombre o correo"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
        </div>

        {cargando ? (
          <Cargando />
        ) : visibles.length === 0 ? (
          <SinResultados>No hay usuarios que coincidan con el filtro.</SinResultados>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover admin-tabla">
              <caption className="visually-hidden">Usuarios del sistema</caption>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Correo</th>
                  <th scope="col" className="d-none d-md-table-cell">Teléfono</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Estado</th>
                  <th scope="col" className="d-none d-lg-table-cell">Creado</th>
                  <th scope="col" className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((u) => {
                  const esUnoMismo = u.id === idActual
                  return (
                    <tr key={u.id} className={u.activo ? '' : 'fila-inactiva'}>
                      <td>
                        {u.nombre}
                        {esUnoMismo && <span className="badge text-bg-light border ms-2">Tú</span>}
                      </td>
                      <td>{u.correo}</td>
                      <td className="d-none d-md-table-cell">{u.telefono || '—'}</td>
                      <td><span className={`badge ${CLASE_ROL[u.rol]}`}>{ETIQUETA_ROL[u.rol]}</span></td>
                      <td>
                        <span className={`badge ${u.activo ? 'text-bg-success' : 'text-bg-secondary'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="d-none d-lg-table-cell">{formatearFecha(u.creadoEn)}</td>
                      <td className="acciones">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setDialogo({ tipo: 'editar', usuario: u })}
                          aria-label={`Editar a ${u.nombre}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => alternarActivo(u)}
                          disabled={esUnoMismo}
                          aria-label={`${u.activo ? 'Desactivar' : 'Activar'} a ${u.nombre}`}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDialogo({ tipo: 'eliminar', usuario: u })}
                          disabled={esUnoMismo}
                          aria-label={`Eliminar a ${u.nombre}`}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {(dialogo?.tipo === 'crear' || dialogo?.tipo === 'editar') && (
        <FormUsuario
          usuario={dialogo.usuario}
          esUnoMismo={dialogo.usuario?.id === idActual}
          onGuardar={guardar}
          onCerrar={cerrarDialogo}
        />
      )}

      {dialogo?.tipo === 'eliminar' && (
        <ModalConfirmar
          titulo="Eliminar usuario"
          mensaje={`¿Eliminar definitivamente a ${dialogo.usuario.nombre} (${dialogo.usuario.correo})? Si solo quieres quitarle el acceso, usa "Desactivar".`}
          onConfirmar={eliminar}
          onCerrar={cerrarDialogo}
        />
      )}
    </>
  )
}
