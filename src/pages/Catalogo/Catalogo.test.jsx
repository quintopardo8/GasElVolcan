import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../../App.jsx'
import { iniciarSesion } from '../../utils/sesion.js'

// El catálogo es una página privada: los tests parten con la sesión iniciada.
function renderEn(ruta) {
  iniciarSesion('Camila')
  window.history.pushState({}, '', ruta)
  const user = userEvent.setup()
  render(<App />)
  return user
}

const pedido = () => screen.getByRole('complementary', { name: 'Tu pedido' })

describe('Catálogo', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('muestra los 14 productos del catálogo con precio residencial y el título de la pestaña', () => {
    renderEn('/catalogo')
    expect(screen.getByRole('heading', { level: 1, name: 'Elige tus productos' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(14)
    const cilindro = screen.getByRole('heading', { name: 'Cilindro GLP 11 kg' }).closest('article')
    expect(cilindro).toHaveTextContent('$12.000')
    expect(document.title).toBe('Catálogo | Gas El Volcán')
  })

  it('filtra por categoría', async () => {
    const user = renderEn('/catalogo')

    await user.click(screen.getByRole('button', { name: 'Reguladores' }))
    expect(screen.getByRole('button', { name: 'Reguladores' })).toHaveAttribute('aria-pressed', 'true')
    const nombres = screen.getAllByRole('article').map((a) => within(a).getByRole('heading').textContent)
    expect(nombres).toEqual(['Regulador doméstico estándar', 'Regulador de alta presión', 'Regulador dual (2 salidas)'])

    await user.click(screen.getByRole('button', { name: 'Todos' }))
    expect(screen.getAllByRole('article')).toHaveLength(14)
  })

  it('avisa cuando quedan pocas unidades', () => {
    renderEn('/catalogo')
    const detector = screen.getByRole('heading', { name: 'Detector de gas a batería' }).closest('article')
    expect(detector).toHaveTextContent('Últimas 8 unidades')
  })

  it('agregar, sumar, restar y quitar actualizan el pedido y el total', async () => {
    const user = renderEn('/catalogo')
    expect(within(pedido()).getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar a dirección →' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Agregar Cilindro GLP 11 kg al pedido' }))
    await user.click(screen.getByRole('button', { name: 'Agregar Cilindro GLP 11 kg al pedido' }))
    await user.click(screen.getByRole('button', { name: 'Agregar Manguera gas 1.5 m al pedido' }))

    expect(pedido()).toHaveTextContent('3 productos')
    expect(pedido()).toHaveTextContent('$27.990') // 2 × 12.000 + 3.990
    expect(screen.getByText('2 en tu pedido')).toBeInTheDocument()

    await user.click(within(pedido()).getByRole('button', { name: 'Restar uno de Cilindro GLP 11 kg' }))
    expect(pedido()).toHaveTextContent('$15.990')

    await user.click(within(pedido()).getByRole('button', { name: 'Quitar Manguera gas 1.5 m del pedido' }))
    expect(pedido()).toHaveTextContent('1 producto')
    expect(pedido()).not.toHaveTextContent('Manguera')
  })

  it('no deja agregar más unidades que el stock', async () => {
    const user = renderEn('/catalogo')
    const agregar = screen.getByRole('button', { name: 'Agregar Detector de gas a batería al pedido' })

    for (let i = 0; i < 10; i++) {
      if (!agregar.disabled) await user.click(agregar)
    }

    expect(agregar).toBeDisabled()
    expect(agregar).toHaveTextContent('Sin stock')
    expect(screen.getByText('8 en tu pedido')).toBeInTheDocument()
  })

  it('el carrito se mantiene al recargar la página', async () => {
    const user = renderEn('/catalogo')
    await user.click(screen.getByRole('button', { name: 'Agregar Cilindro GLP 5 kg al pedido' }))
    expect(JSON.parse(localStorage.getItem('gev:carrito'))).toEqual({ CL001: 1 })
  })

  it('"Continuar a dirección" lleva al checkout', async () => {
    const user = renderEn('/catalogo')
    await user.click(screen.getByRole('button', { name: 'Agregar Cilindro GLP 15 kg al pedido' }))
    await user.click(screen.getByRole('button', { name: 'Continuar a dirección →' }))
    expect(window.location.pathname).toBe('/checkout')
  })
})
