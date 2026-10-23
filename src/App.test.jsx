import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App.jsx'
import { guardarPedidoEnCurso, limpiarPedidoEnCurso } from './utils/pedidoEnCurso.js'
import { cerrarSesion, iniciarSesion } from './utils/sesion.js'

// Por defecto los tests parten con la sesión iniciada.
function renderEn(ruta, { conSesion = true } = {}) {
  if (conSesion) iniciarSesion('Camila')
  window.history.pushState({}, '', ruta)
  const user = userEvent.setup()
  render(<App />)
  return user
}

const navbar = () => screen.getByRole('navigation', { name: 'Navegación principal' })

describe('App - autenticación', () => {
  afterEach(() => {
    cerrarSesion()
  })

  it.each(['/', '/catalogo', '/contacto', '/checkout', '/rastreo'])('sin sesión, %s manda primero a iniciar sesión, sin navbar', (ruta) => {
    renderEn(ruta, { conSesion: false })
    expect(window.location.pathname).toBe('/iniciar-sesion')
    expect(screen.getByText('Ingresa con tu correo y contraseña')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).not.toBeInTheDocument()
  })

  it('al ingresar entra al inicio y el navbar saluda con el nombre del correo', async () => {
    const user = renderEn('/', { conSesion: false })

    await user.type(screen.getByLabelText(/Correo/), 'camila.rojas@correo.cl')
    await user.type(screen.getByLabelText(/Contraseña/), 'Clave1234')
    await user.click(screen.getByRole('button', { name: /Iniciar sesi[oó]n/ }))

    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('heading', { level: 1, name: '¿Necesitas gas hoy?' })).toBeInTheDocument()
    expect(screen.getByText('Camila')).toBeInTheDocument()
  })

  it('al registrarse entra al inicio con su primer nombre', async () => {
    const user = renderEn('/registro', { conSesion: false })

    await user.type(screen.getByLabelText(/Nombre/), 'Pedro Soto')
    await user.type(screen.getByLabelText(/Correo/), 'pedro@correo.cl')
    await user.type(screen.getByLabelText(/Teléfono/), '912345678')
    await user.type(screen.getByLabelText(/^Contraseña/), 'Clave1234')
    await user.type(screen.getByLabelText(/Confirmar contraseña/), 'Clave1234')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(window.location.pathname).toBe('/')
    expect(screen.getByText('Pedro')).toBeInTheDocument()
  })

  it('cerrar sesión vuelve al login y ya no deja entrar', async () => {
    const user = renderEn('/')

    await user.click(screen.getByRole('link', { name: 'Cerrar sesión' }))
    expect(window.location.pathname).toBe('/iniciar-sesion')
    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).not.toBeInTheDocument()
  })
})

describe('App - navegación', () => {
  afterEach(() => {
    limpiarPedidoEnCurso()
    cerrarSesion()
  })

  it('la página de inicio muestra el navbar con Inicio, Catálogo y Contacto', () => {
    renderEn('/')
    expect(within(navbar()).getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(within(navbar()).getByRole('link', { name: 'Catálogo' })).toHaveAttribute('href', '/catalogo')
    expect(within(navbar()).getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto')
  })

  it.each([
    ['/catalogo', 'Elige tus productos'],
    ['/contacto', 'Contacto - Distribuidora de Gas'],
    ['/rastreo', 'Rastrea tu pedido'],
    ['/checkout', '¿Dónde entregamos?'],
  ])('%s muestra el navbar y se puede volver al inicio', async (ruta, titulo) => {
    const user = renderEn(ruta)
    expect(screen.getByRole('heading', { level: 1, name: titulo })).toBeInTheDocument()

    await user.click(within(navbar()).getByRole('link', { name: 'Inicio' }))
    expect(screen.getByRole('heading', { level: 1, name: '¿Necesitas gas hoy?' })).toBeInTheDocument()
  })

  it('"Pedir gas" lleva al catálogo', async () => {
    const user = renderEn('/')
    await user.click(screen.getByRole('link', { name: 'Pedir gas' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Elige tus productos' })).toBeInTheDocument()
  })

  it('con un pedido en curso, navega a Rastreo', async () => {
    guardarPedidoEnCurso({ id: 'EV-48213', hora: '17:42', estado: 'en-camino', lineas: [{ id: 'CL003', cantidad: 1 }] })
    const user = renderEn('/')

    await user.click(screen.getByRole('link', { name: 'Rastrea tu pedido' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Rastrea tu pedido' })).toBeInTheDocument()
  })
})
