import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import Inicio from './Inicio.jsx'
import { guardarPedidoEnCurso, limpiarPedidoEnCurso } from '../../utils/pedidoEnCurso.js'

function renderInicio() {
  render(
    <MemoryRouter>
      <Inicio />
    </MemoryRouter>,
  )
}

describe('Inicio', () => {
  afterEach(() => {
    limpiarPedidoEnCurso()
  })

  it('muestra el título, el botón para pedir gas y el título de la pestaña', () => {
    renderInicio()
    expect(screen.getByRole('heading', { level: 1, name: '¿Necesitas gas hoy?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pedir gas' })).toHaveAttribute('href', '/catalogo')
    expect(document.title).toBe('Gas El Volcán | Gas a domicilio en Chillán')
  })

  it('muestra los cuatro pasos de "Así funciona"', () => {
    renderInicio()
    const seccion = screen.getByRole('heading', { name: 'Así funciona' }).closest('section')
    const pasos = within(seccion).getAllByRole('listitem')
    expect(pasos).toHaveLength(4)
    expect(pasos[0]).toHaveTextContent('Elige tus cilindros')
    expect(pasos[3]).toHaveTextContent('Sigue tu pedido')
  })

  it('sin pedido en curso no muestra el seguimiento', () => {
    renderInicio()
    expect(screen.queryByRole('region', { name: 'Pedido en curso' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Rastrea tu pedido' })).not.toBeInTheDocument()
  })

  it('con pedido en curso muestra el resumen, el estado y el enlace a Rastreo', () => {
    guardarPedidoEnCurso({
      id: 'EV-48213',
      hora: '17:42',
      estado: 'en-camino',
      lineas: [{ id: 'CL002', cantidad: 2 }, { id: 'CL001', cantidad: 1 }],
    })
    renderInicio()

    const pedido = screen.getByRole('region', { name: 'Pedido en curso' })
    expect(within(pedido).getByRole('heading', { name: 'N° EV-48213' })).toBeInTheDocument()
    expect(pedido).toHaveTextContent('2 × Cilindro GLP 11 kg, 1 × Cilindro GLP 5 kg · $30.500')
    expect(within(pedido).getByRole('link', { name: 'Rastrea tu pedido' })).toHaveAttribute('href', '/rastreo')

    const pasos = within(pedido).getAllByRole('listitem')
    expect(pasos).toHaveLength(4)
    expect(pasos[0]).toHaveClass('hecho')
    expect(pasos[0]).toHaveTextContent('Hoy, 17:42')
    expect(pasos[1]).toHaveClass('hecho')
    expect(pasos[2]).toHaveClass('en-curso')
    expect(pasos[2]).toHaveAttribute('aria-current', 'step')
    expect(pasos[3]).not.toHaveAttribute('class')
  })

  it('ignora un pedido guardado con datos inválidos', () => {
    localStorage.setItem('gev:pedidoEnCurso', '{no es json')
    renderInicio()
    expect(screen.queryByRole('region', { name: 'Pedido en curso' })).not.toBeInTheDocument()
  })
})
