import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App.jsx'
import { guardarPedidoEnCurso, limpiarPedidoEnCurso } from './utils/pedidoEnCurso.js'

function renderEn(ruta) {
  window.history.pushState({}, '', ruta)
  const user = userEvent.setup()
  render(<App />)
  return user
}

describe('App - navegación', () => {
  afterEach(() => {
    limpiarPedidoEnCurso()
  })

  it('la página de inicio muestra el navbar con Inicio, Catálogo y Contacto', () => {
    renderEn('/')
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(within(nav).getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Catálogo' })).toHaveAttribute('href', '/catalogo')
    expect(within(nav).getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto')
  })

  it('navega a la página de Contacto y vuelve al inicio con el logo', async () => {
    const user = renderEn('/')

    await user.click(screen.getByRole('link', { name: 'Contacto' }))
    expect(screen.getByRole('heading', { name: 'Contacto - Distribuidora de Gas' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Logo Distribuidora de Gas' }))
    expect(screen.getByRole('heading', { level: 1, name: '¿Necesitas gas hoy?' })).toBeInTheDocument()
  })

  it('con un pedido en curso, navega a Rastreo y vuelve al inicio con el logo', async () => {
    guardarPedidoEnCurso({ id: 'EV-48213', hora: '17:42', estado: 'en-camino', lineas: [{ id: 'c15', cantidad: 1 }] })
    const user = renderEn('/')

    await user.click(screen.getByRole('link', { name: 'Rastrea tu pedido' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Rastrea tu pedido' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Logo Distribuidora de Gas' }))
    expect(screen.getByRole('heading', { level: 1, name: '¿Necesitas gas hoy?' })).toBeInTheDocument()
  })
})
