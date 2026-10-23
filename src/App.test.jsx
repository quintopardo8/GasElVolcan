import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'

describe('App - navegación', () => {
  it('la página de inicio muestra el enlace a Contacto', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(nav).toHaveTextContent('Contacto')
  })

  it('navega a la página de Contacto y vuelve al inicio con el logo', async () => {
    window.history.pushState({}, '', '/')
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('link', { name: 'Contacto' }))
    expect(screen.getByRole('heading', { name: 'Contacto - Distribuidora de Gas' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Logo Distribuidora de Gas' }))
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
  })
})
