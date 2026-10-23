import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Rastreo from './Rastreo.jsx'

function renderRastreo() {
  render(
    <MemoryRouter>
      <Rastreo />
    </MemoryRouter>,
  )
}

describe('Rastreo - textos', () => {
  it('muestra el título, la descripción y el título de la pestaña', () => {
    renderRastreo()
    expect(screen.getByText('SEGUIMIENTO EN LÍNEA')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Rastrea tu pedido' })).toBeInTheDocument()
    expect(screen.getByText('Revisa aquí el estado de tu pedido actual en tiempo real.')).toBeInTheDocument()
    expect(document.title).toBe('Rastrea tu pedido | Gas El Volcán')
  })

  it('muestra el resumen del pedido', () => {
    renderRastreo()
    expect(screen.getByRole('heading', { level: 2, name: '¡Tu pedido está en camino!' })).toBeInTheDocument()
    expect(screen.getByText(/Llegará aproximadamente entre/)).toHaveTextContent('18:30 y 19:00 hrs.')
    expect(screen.getByText('En reparto')).toBeInTheDocument()
    expect(screen.getByText('El repartidor se encuentra a 8 minutos de tu dirección')).toBeInTheDocument()
  })

  it('muestra los pasos del pedido con su estado', () => {
    renderRastreo()
    const pasos = within(screen.getByRole('list', { name: 'Estado del pedido' })).getAllByRole('listitem')
    expect(pasos).toHaveLength(4)
    expect(pasos[0]).toHaveTextContent('Pedido confirmadoHoy, 17:42 hrs.')
    expect(pasos[0]).toHaveClass('complete')
    expect(pasos[1]).toHaveTextContent('Pedido preparadoHoy, 18:03 hrs.')
    expect(pasos[1]).toHaveClass('complete')
    expect(pasos[2]).toHaveTextContent('En camino a tu domicilioActualizado hace un momento')
    expect(pasos[2]).toHaveClass('active')
    expect(pasos[3]).toHaveTextContent('Pedido entregadoPróximamente')
    expect(pasos[3]).not.toHaveAttribute('class')
  })

  it('muestra el detalle de entrega', () => {
    renderRastreo()
    const detalle = screen.getByRole('complementary', { name: 'Detalles de entrega' })
    expect(detalle).toHaveTextContent('1 balón de gas de 15 kg')
    expect(detalle).toHaveTextContent('Pago al recibir: efectivo, tarjeta o transferencia')
  })
})
