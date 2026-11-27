import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { crearFetchFalso } from '../../test/apiFalsa.js'
import { cerrarSesion, iniciarSesion } from '../../utils/sesion.js'
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
    cerrarSesion()
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

  it('un pedido recién confirmado muestra el camión en la distribuidora y respeta el horario elegido', () => {
    renderRastreo({ ...PEDIDO, estado: 'confirmado', direccion: { ...PEDIDO.direccion, slot: 'pm' } })
    expect(screen.getByRole('heading', { level: 2, name: '¡Recibimos tu pedido!' })).toBeInTheDocument()
    expect(screen.getByText(/Llegará/)).toHaveTextContent('Llegará durante la tarde.')
    expect(screen.getByLabelText('Ubicación estimada de tu pedido')).toBeInTheDocument()
    expect(screen.getByText('Tu pedido está en la distribuidora')).toBeInTheDocument()
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

  it('consulta el estado al backend y actualiza el seguimiento y el mapa', async () => {
    iniciarSesion('Camila', { token: 't', rol: 'CLIENTE' })
    vi.stubGlobal('fetch', crearFetchFalso([{ cuerpo: { id: 42, codigo: 'EV-00042', estado: 'EN_CAMINO' } }]))
    renderRastreo({ ...PEDIDO, estado: 'confirmado', idApi: 42 })

    expect(await screen.findByRole('heading', { level: 2, name: '¡Tu pedido está en camino!' })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/pedidos/42', expect.objectContaining({ method: 'GET' }))
    expect(screen.getByText(/El repartidor se encuentra a \d+ minutos? de tu dirección/)).toBeInTheDocument()
    // El estado nuevo queda guardado para el inicio.
    expect(JSON.parse(localStorage.getItem('gev:pedidoEnCurso')).estado).toBe('en-camino')
  })

  it('un pedido cancelado en el panel muestra el aviso y oculta el mapa', async () => {
    iniciarSesion('Camila', { token: 't', rol: 'CLIENTE' })
    vi.stubGlobal('fetch', crearFetchFalso([{ cuerpo: { id: 42, estado: 'CANCELADO' } }]))
    renderRastreo({ ...PEDIDO, estado: 'confirmado', idApi: 42 })

    expect(await screen.findByText(/Este pedido fue cancelado/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Ubicación estimada de tu pedido')).not.toBeInTheDocument()
  })
})
