import { useState } from 'react'
import CampoFormulario from '../../../components/CampoFormulario.jsx'
import {
  correoValido, validarDireccion, validarMensaje, validarMotivo, validarNombre, validarTelefono,
} from '../../../utils/validadores.js'

const VALORES_INICIALES = {
  nombre: '', telefono: '', telefonoAlternativo: '', email: '',
  motivo: 'pedido', direccion: '', mensaje: '',
}

function validar(valores) {
  return {
    nombre: validarNombre(valores.nombre),
    telefono: validarTelefono(valores.telefono),
    telefonoAlternativo: validarTelefono(valores.telefonoAlternativo, false),
    email: correoValido(valores.email),
    motivo: validarMotivo(valores.motivo),
    direccion: validarDireccion(valores.direccion),
    mensaje: validarMensaje(valores.mensaje),
  }
}

export default function FormularioContacto() {
  const [valores, setValores] = useState(VALORES_INICIALES)
  const [errores, setErrores] = useState({})
  const [exito, setExito] = useState('')

  const cambiar = (evento) => {
    const { name, value } = evento.target
    setValores((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: null }))
    setExito('')
  }

  const enviar = (evento) => {
    evento.preventDefault()
    const nuevosErrores = validar(valores)
    setErrores(nuevosErrores)
    setExito('')

    const primero = Object.keys(nuevosErrores).find((campo) => nuevosErrores[campo])
    if (primero) {
      evento.target.elements[primero].focus()
      return
    }

    setExito('Tu mensaje fue validado y enviado correctamente. Te contactaremos pronto.')
    setValores(VALORES_INICIALES)
  }

  // Props comunes de cada input: id, name, value, onChange y aria-invalid.
  const props = (nombre) => ({
    id: nombre,
    name: nombre,
    value: valores[nombre],
    onChange: cambiar,
    'aria-invalid': Boolean(errores[nombre]),
  })

  return (
    <form onSubmit={enviar} noValidate>
      <CampoFormulario id="nombre" etiqueta="Nombre completo" error={errores.nombre}>
        <input type="text" required placeholder="Ej. Juan Pérez" {...props('nombre')} />
      </CampoFormulario>

      <CampoFormulario id="telefono" etiqueta="Teléfono principal" error={errores.telefono}>
        <input type="tel" required placeholder="Ej. 987654321" {...props('telefono')} />
      </CampoFormulario>

      <CampoFormulario
        id="telefonoAlternativo"
        etiqueta="Teléfono alternativo (contacto de respaldo)"
        error={errores.telefonoAlternativo}
      >
        <input type="tel" placeholder="Ej. 912345678 (en caso de emergencia)" {...props('telefonoAlternativo')} />
      </CampoFormulario>

      <CampoFormulario id="email" etiqueta="Correo electrónico" error={errores.email}>
        <input type="email" placeholder="ejemplo@correo.com" {...props('email')} />
      </CampoFormulario>

      <CampoFormulario id="motivo" etiqueta="Motivo de contacto" error={errores.motivo}>
        <select {...props('motivo')}>
          <option value="pedido">Pedido de Gas (Balones)</option>
          <option value="consulta">Consulta general / Precios</option>
          <option value="proveedor">Quiero ofrecer / vender gas o servicios</option>
          <option value="reclamo">Reclamo o soporte</option>
        </select>
      </CampoFormulario>

      <CampoFormulario id="direccion" etiqueta="Dirección (opcional o de entrega)" error={errores.direccion}>
        <textarea rows="2" placeholder="Calle, número, referencia, distrito..." {...props('direccion')} />
      </CampoFormulario>

      <CampoFormulario id="mensaje" etiqueta="Mensaje o detalles de tu solicitud" error={errores.mensaje}>
        <textarea
          rows="3"
          required
          placeholder="Escribe aquí los detalles de tu pedido, consulta o propuesta..."
          {...props('mensaje')}
        />
      </CampoFormulario>

      <button type="submit">Enviar Mensaje</button>
      <p className="success-message" role="status" aria-live="polite">{exito}</p>
    </form>
  )
}
