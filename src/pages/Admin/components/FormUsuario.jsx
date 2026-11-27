import { useState } from 'react'
import Modal from './Modal.jsx'
import { Campo } from './Comunes.jsx'
import { ETIQUETA_ROL, ROLES, telefonoValido } from '../adminUtils.js'

// Crear (usuario = null) o editar un usuario. onGuardar(datos) debe devolver una promesa.
export default function FormUsuario({ usuario, esUnoMismo, onGuardar, onCerrar }) {
  const editando = Boolean(usuario)
  const [datos, setDatos] = useState({
    nombre: usuario?.nombre ?? '',
    correo: usuario?.correo ?? '',
    telefono: usuario?.telefono ?? '',
    rol: usuario?.rol ?? 'OPERADORA',
    contrasena: '',
    activo: usuario?.activo ?? true,
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
    if (!datos.nombre.trim()) e.nombre = 'El nombre es obligatorio.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) e.correo = 'Ingresa un correo válido.'
    if (datos.telefono.trim() && !telefonoValido(datos.telefono)) e.telefono = 'Celular chileno, ej: 912345678.'
    if (!editando && datos.contrasena.length < 6) e.contrasena = 'Mínimo 6 caracteres.'
    if (editando && datos.contrasena && datos.contrasena.length < 6) e.contrasena = 'Mínimo 6 caracteres.'
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
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        telefono: datos.telefono.trim() || null,
        rol: datos.rol,
        contrasena: datos.contrasena || null,
        activo: datos.activo,
      })
    } catch (error) {
      setErrores(error.campos || {})
      setErrorGeneral(error.message)
      setEnviando(false)
    }
  }

  const clase = (campo) => `form-control ${errores[campo] ? 'is-invalid' : ''}`

  return (
    <Modal
      titulo={editando ? `Editar usuario: ${usuario.nombre}` : 'Nuevo usuario'}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>Cancelar</button>
          <button type="submit" form="form-usuario" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </>
      }
    >
      <form id="form-usuario" onSubmit={enviar} noValidate>
        {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

        <Campo id="u-nombre" etiqueta="Nombre completo *" error={errores.nombre}>
          <input id="u-nombre" name="nombre" className={clase('nombre')} value={datos.nombre} onChange={cambiar} maxLength={100} />
        </Campo>

        <div className="row">
          <Campo id="u-correo" etiqueta="Correo *" error={errores.correo} className="col-md-7">
            <input id="u-correo" name="correo" type="email" className={clase('correo')} value={datos.correo} onChange={cambiar} maxLength={120} />
          </Campo>
          <Campo id="u-telefono" etiqueta="Teléfono" error={errores.telefono} className="col-md-5">
            <input id="u-telefono" name="telefono" type="tel" className={clase('telefono')} value={datos.telefono} onChange={cambiar} placeholder="912345678" />
          </Campo>
        </div>

        <Campo
          id="u-rol"
          etiqueta="Rol *"
          error={errores.rol}
          ayuda={esUnoMismo ? 'No puedes quitarte tu propio rol de administrador.' : 'Define a qué vistas y operaciones puede acceder.'}
        >
          <select id="u-rol" name="rol" className="form-select" value={datos.rol} onChange={cambiar} disabled={esUnoMismo}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ETIQUETA_ROL[r]}</option>
            ))}
          </select>
        </Campo>

        <Campo
          id="u-contrasena"
          etiqueta={editando ? 'Nueva contraseña' : 'Contraseña *'}
          error={errores.contrasena}
          ayuda={editando ? 'Déjala en blanco para mantener la actual.' : 'Mínimo 6 caracteres. Se guarda cifrada (BCrypt).'}
        >
          <input
            id="u-contrasena"
            name="contrasena"
            type="password"
            autoComplete="new-password"
            className={clase('contrasena')}
            value={datos.contrasena}
            onChange={cambiar}
            maxLength={50}
          />
        </Campo>

        {editando && (
          <div className="form-check">
            <input
              id="u-activo"
              name="activo"
              type="checkbox"
              className="form-check-input"
              checked={datos.activo}
              onChange={cambiar}
              disabled={esUnoMismo}
            />
            <label htmlFor="u-activo" className="form-check-label">Usuario activo (puede iniciar sesión)</label>
          </div>
        )}
      </form>
    </Modal>
  )
}
