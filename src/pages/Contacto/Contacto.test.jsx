import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Contacto from './Contacto.jsx'

function renderContacto() {
  render(
    <MemoryRouter>
      <Contacto />
    </MemoryRouter>,
  )
  return userEvent.setup()
}

describe('Contacto - textos', () => {
  it('muestra el título, la descripción y el título de la pestaña', () => {
    renderContacto()
    expect(screen.getByRole('heading', { level: 1, name: 'Contacto - Distribuidora de Gas' })).toBeInTheDocument()
    expect(screen.getByText('Ponte en contacto con nosotros para pedidos, consultas o propuestas.')).toBeInTheDocument()
    expect(document.title).toBe('Contacto | Gas El Volcán')
  })

  it('muestra los canales de atención', () => {
    renderContacto()
    const info = screen.getByRole('heading', { name: 'Nuestros Números y Canales de Atención' }).closest('section')
    const items = within(info).getAllByRole('listitem')
    expect(items).toHaveLength(4)
    expect(items[0]).toHaveTextContent('Teléfono Principal: +56 9 1234 5678 (Pedidos y Consultas)')
    expect(items[1]).toHaveTextContent('Línea de Respaldo: +56 9 9887 7665 (Emergencias / Si la principal no conecta)')
    expect(items[2]).toHaveTextContent('WhatsApp Directo: +56 9 0011 1222')
    expect(items[3]).toHaveTextContent('Horario: Lunes a Sábado de 7:00 am a 8:00 pm')
  })

  it('muestra las etiquetas de todos los campos', () => {
    renderContacto()
    expect(screen.getByLabelText('Nombre completo')).toHaveAttribute('placeholder', 'Ej. Juan Pérez')
    expect(screen.getByLabelText('Teléfono principal')).toHaveAttribute('placeholder', 'Ej. 987654321')
    expect(screen.getByLabelText('Teléfono alternativo (contacto de respaldo)')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Motivo de contacto')).toHaveValue('pedido')
    expect(screen.getByLabelText('Dirección (opcional o de entrega)')).toBeInTheDocument()
    expect(screen.getByLabelText('Mensaje o detalles de tu solicitud')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar Mensaje' })).toBeInTheDocument()
  })

  it('muestra las opciones del motivo de contacto', () => {
    renderContacto()
    const opciones = within(screen.getByLabelText('Motivo de contacto')).getAllByRole('option')
    expect(opciones.map((o) => o.textContent)).toEqual([
      'Pedido de Gas (Balones)',
      'Consulta general / Precios',
      'Quiero ofrecer / vender gas o servicios',
      'Reclamo o soporte',
    ])
  })
})

describe('Contacto - formulario', () => {
  it('muestra los errores de los campos obligatorios y enfoca el primero', async () => {
    const user = renderContacto()
    await user.click(screen.getByRole('button', { name: 'Enviar Mensaje' }))

    expect(screen.getByText('El nombre completo es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El teléfono principal es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El mensaje es obligatorio')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Nombre completo')).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('valida el formato de los campos opcionales', async () => {
    const user = renderContacto()
    await user.type(screen.getByLabelText('Nombre completo'), 'Juan Pérez')
    await user.type(screen.getByLabelText('Teléfono principal'), '912345678')
    await user.type(screen.getByLabelText('Teléfono alternativo (contacto de respaldo)'), '123')
    await user.type(screen.getByLabelText('Correo electrónico'), 'correo-malo')
    await user.type(screen.getByLabelText('Mensaje o detalles de tu solicitud'), 'Necesito un balón de gas')
    await user.click(screen.getByRole('button', { name: 'Enviar Mensaje' }))

    expect(screen.getByText('Ingresa un celular válido de 9 dígitos (ej: 912345678)')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un correo electrónico válido')).toBeInTheDocument()
    expect(screen.getByLabelText('Teléfono alternativo (contacto de respaldo)')).toHaveFocus()
  })

  it('borra el error de un campo al escribir en él', async () => {
    const user = renderContacto()
    await user.click(screen.getByRole('button', { name: 'Enviar Mensaje' }))
    expect(screen.getByText('El nombre completo es obligatorio')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nombre completo'), 'J')
    expect(screen.queryByText('El nombre completo es obligatorio')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveAttribute('aria-invalid', 'false')
  })

  it('envía el formulario válido, muestra el éxito y limpia los campos', async () => {
    const user = renderContacto()
    await user.type(screen.getByLabelText('Nombre completo'), 'Juan Pérez')
    await user.type(screen.getByLabelText('Teléfono principal'), '912345678')
    await user.selectOptions(screen.getByLabelText('Motivo de contacto'), 'consulta')
    await user.type(screen.getByLabelText('Mensaje o detalles de tu solicitud'), '¿Cuánto cuesta el balón de 15 kg?')
    await user.click(screen.getByRole('button', { name: 'Enviar Mensaje' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Tu mensaje fue validado y enviado correctamente. Te contactaremos pronto.',
    )
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('')
    expect(screen.getByLabelText('Teléfono principal')).toHaveValue('')
    expect(screen.getByLabelText('Motivo de contacto')).toHaveValue('pedido')
    expect(screen.getByLabelText('Mensaje o detalles de tu solicitud')).toHaveValue('')
  })

  it('oculta el mensaje de éxito al volver a escribir', async () => {
    const user = renderContacto()
    await user.type(screen.getByLabelText('Nombre completo'), 'Juan Pérez')
    await user.type(screen.getByLabelText('Teléfono principal'), '912345678')
    await user.type(screen.getByLabelText('Mensaje o detalles de tu solicitud'), 'Necesito un balón de gas')
    await user.click(screen.getByRole('button', { name: 'Enviar Mensaje' }))
    expect(screen.getByRole('status')).not.toHaveTextContent('')

    await user.type(screen.getByLabelText('Nombre completo'), 'A')
    expect(screen.getByRole('status')).toHaveTextContent('')
  })
})
