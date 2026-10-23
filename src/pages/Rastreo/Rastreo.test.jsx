import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { guardarPedidoEnCurso, limpiarPedidoEnCurso } from '../../utils/pedidoEnCurso.js'
import Rastreo from './Rastreo.jsx'

const PEDIDO = {
  id: 'EV-48213',
  hora: '17:42',
  estado: 'en-camino',
  lineas: [{ id: 'CL003', cantidad: 1 }, { id: 'RG001', cantidad: 2 }],
  pago: 'efectivo',
  direccion: { street: 'Av. Libertad 1234', unit: 'Depto 5', comuna: 'Chillán', slot: 'asap' },
}

function renderRastreo(pedido) {
  if (pedido) guardarPedidoEnCurso(pedido)
  render(
    <MemoryRouter>
      <Rastreo />
    </MemoryRouter>,
  )
}

const pasos = () => within(screen.getByRole('list', { name: 'Estado del pedido' })).getAllByRole('listitem')

describe('Rastreo', () => {
  afterEach(() => {
    limpiarPedidoEnCurso()
  })

  it('muestra el título, la descripción y el título de la pestaña', () => {
    renderRastreo(PEDIDO)
    expect(screen.getByText('SEGUIMIENTO EN LÍNEA')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Rastrea tu pedido' })).toBeInTheDocument()
    expect(screen.getByText('Revisa aquí el estado de tu pedido actual en tiempo real.')).toBeInTheDocument()
    expect(document.title).toBe('Rastrea tu pedido | Gas El Volcán')
  })

  it('sin pedido en curso invita a pedir desde el catálogo', () => {
    renderRastreo()
    expect(screen.getByRole('heading', { level: 2, name: 'No tienes pedidos en curso' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pedir gas' })).toHaveAttribute('href', '/catalogo')
    expect(screen.queryByRole('list', { name: 'Estado del pedido' })).not.toBeInTheDocument()
  })

  it('muestra el número, el estado y la hora estimada del pedido en camino', () => {
    renderRastreo(PEDIDO)
    expect(screen.getByText('N° EV-48213')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '¡Tu pedido está en camino!' })).toBeInTheDocument()
    expect(screen.getByText(/Llegará aproximadamente entre/)).toHaveTextContent('18:27 y 18:57 hrs.')
    expect(screen.getByText('En reparto')).toBeInTheDocument()
    expect(screen.getByText('El repartidor se encuentra a 8 minutos de tu dirección')).toBeInTheDocument()
  })

  it('marca los pasos según el estado del pedido', () => {
    renderRastreo(PEDIDO)
    const lista = pasos()
    expect(lista).toHaveLength(4)
    expect(lista[0]).toHaveTextContent('Pedido confirmadoHoy, 17:42 hrs.')
    expect(lista[0]).toHaveClass('complete')
    expect(lista[1]).toHaveClass('complete')
    expect(lista[2]).toHaveTextContent('En camino a tu domicilioActualizado hace un momento')
    expect(lista[2]).toHaveClass('active')
    expect(lista[3]).toHaveTextContent('Pedido entregadoPróximamente')
    expect(lista[3]).not.toHaveAttribute('class')
  })

  it('un pedido recién confirmado no muestra el mapa y respeta el horario elegido', () => {
    renderRastreo({ ...PEDIDO, estado: 'confirmado', direccion: { ...PEDIDO.direccion, slot: 'pm' } })
    expect(screen.getByRole('heading', { level: 2, name: '¡Recibimos tu pedido!' })).toBeInTheDocument()
    expect(screen.getByText(/Llegará/)).toHaveTextContent('Llegará durante la tarde.')
    expect(screen.queryByLabelText('Ubicación estimada de tu pedido')).not.toBeInTheDocument()
    expect(pasos()[0]).toHaveClass('active')
    expect(pasos()[1]).not.toHaveAttribute('class')
  })

  it('muestra los productos, el total, el pago y la dirección', () => {
    renderRastreo(PEDIDO)
    const detalle = screen.getByRole('complementary', { name: 'Detalles de entrega' })
    expect(detalle).toHaveTextContent('1 × Cilindro GLP 15 kg')
    expect(detalle).toHaveTextContent('2 × Regulador doméstico estándar')
    expect(detalle).toHaveTextContent('Total $33.980 · Pago al recibir en efectivo')
    expect(detalle).toHaveTextContent('Entrega en Av. Libertad 1234 (Depto 5), Chillán')
  })
})
