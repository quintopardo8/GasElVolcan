import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../../App.jsx'
import { obtenerPedidoEnCurso } from '../../utils/pedidoEnCurso.js'
import { iniciarSesion } from '../../utils/sesion.js'

function renderEn(ruta, carrito = {}) {
  iniciarSesion('Camila')
  localStorage.setItem('gev:carrito', JSON.stringify(carrito))
  window.history.pushState({}, '', ruta)
  const user = userEvent.setup()
  render(<App />)
  return user
}

const navbar = () => screen.getByRole('navigation', { name: 'Navegación principal' }).closest('header')
const resumen = () => screen.getByRole('heading', { name: 'Resumen' }).closest('aside')

async function completarDireccion(user) {
  await user.type(screen.getByLabelText(/Calle y número/), 'Av. Libertad 1234')
  await user.type(screen.getByLabelText(/Teléfono de contacto/), '912345678')
  await user.click(screen.getByRole('button', { name: 'Continuar al pago →' }))
}

async function pagarEnEfectivo(user) {
  await user.click(screen.getByRole('button', { name: /Efectivo contra entrega/ }))
  await user.click(screen.getByRole('button', { name: 'Confirmar y finalizar pedido' }))
}

describe('Checkout', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('con el carrito vacío invita a ir al catálogo', () => {
    renderEn('/checkout')
    expect(screen.getByRole('heading', { level: 1, name: 'Tu carrito está vacío' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir al catálogo' })).toHaveAttribute('href', '/catalogo')
    expect(document.title).toBe('Checkout | Gas El Volcán')
  })

  it('el resumen muestra los productos del catálogo con sus precios', () => {
    renderEn('/checkout', { CL002: 2, MG001: 1 })
    expect(screen.getByRole('heading', { level: 1, name: '¿Dónde entregamos?' })).toBeInTheDocument()
    expect(resumen()).toHaveTextContent('2× Cilindro GLP 11 kg$24.000')
    expect(resumen()).toHaveTextContent('1× Manguera gas 1.5 m$3.990')
    expect(resumen()).toHaveTextContent('Total$27.990')
  })

  it('el navbar muestra cuántos productos hay en el carrito', () => {
    renderEn('/checkout', { CL002: 2, MG001: 1 })
    expect(within(navbar()).getByRole('link', { name: 'Ver carrito: 3 productos' })).toHaveTextContent('3')
  })

  it('"Editar" y "Volver al catálogo" llevan al catálogo con el mismo carrito', async () => {
    const user = renderEn('/checkout', { CL001: 1 })
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    expect(window.location.pathname).toBe('/catalogo')
    expect(screen.getByRole('complementary', { name: 'Tu pedido' })).toHaveTextContent('Cilindro GLP 5 kg')
  })

  it('al confirmar guarda el pedido, vacía el carrito y muestra el detalle real', async () => {
    const user = renderEn('/checkout', { CL003: 1, RG001: 1 })
    await completarDireccion(user)
    await pagarEnEfectivo(user)

    expect(screen.getByRole('heading', { level: 1, name: '¡Pedido confirmado!' })).toBeInTheDocument()
    expect(screen.getByText('Cilindro GLP 15 kg', { exact: false }).closest('li')).toHaveTextContent('1× Cilindro GLP 15 kg$16.000')
    expect(screen.getByText('Paga $24.990 al repartidor')).toBeInTheDocument()

    const pedido = obtenerPedidoEnCurso()
    expect(pedido.id).toMatch(/^EV-\d{5}$/)
    expect(screen.getByText(pedido.id)).toBeInTheDocument()
    expect(pedido).toMatchObject({
      estado: 'confirmado',
      pago: 'efectivo',
      total: 24990,
      direccion: { street: 'Av. Libertad 1234', comuna: 'Chillán', slot: 'asap' },
    })
    expect(pedido.lineas.map((l) => [l.codigo, l.cantidad])).toEqual([['CL003', 1], ['RG001', 1]])

    expect(JSON.parse(localStorage.getItem('gev:carrito'))).toEqual({})
    expect(within(navbar()).getByRole('link', { name: 'Ver carrito: vacío' })).toBeInTheDocument()
  })

  it('después de confirmar, "Rastrear pedido" muestra el mismo pedido', async () => {
    const user = renderEn('/checkout', { CL002: 1 })
    await completarDireccion(user)
    await pagarEnEfectivo(user)
    const { id } = obtenerPedidoEnCurso()

    await user.click(screen.getByRole('button', { name: 'Rastrear pedido' }))
    expect(window.location.pathname).toBe('/rastreo')
    expect(screen.getByText(`N° ${id}`)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '¡Recibimos tu pedido!' })).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Detalles de entrega' })).toHaveTextContent('1 × Cilindro GLP 11 kg')
  })

  it('después de confirmar, el inicio muestra el pedido en curso', async () => {
    const user = renderEn('/checkout', { CL002: 1 })
    await completarDireccion(user)
    await pagarEnEfectivo(user)
    const { id } = obtenerPedidoEnCurso()

    await user.click(screen.getByRole('button', { name: 'Volver al inicio' }))
    expect(screen.getByRole('region', { name: 'Pedido en curso' })).toHaveTextContent(`N° ${id}`)
  })
})
