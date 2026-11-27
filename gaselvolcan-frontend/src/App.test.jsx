import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { guardarPedidoEnCurso, limpiarPedidoEnCurso } from './utils/pedidoEnCurso.js'
import { cerrarSesion, iniciarSesion } from './utils/sesion.js'
import { crearFetchFalso } from './test/apiFalsa.js'

// Por defecto los tests parten con la sesión iniciada.
function renderEn(ruta, { conSesion = true } = {}) {
  if (conSesion) iniciarSesion('Camila')
  window.history.pushState({}, '', ruta)
  const user = userEvent.setup()
  render(<App />)
  return user
}

const navbar = () => screen.getByRole('navigation', { name: 'Navegación principal' })

// Simula las respuestas del backend: el catálogo responde solo (GET /api/productos) y
// cada otra llamada a fetch devuelve la siguiente respuesta indicada.
function simularApi(...respuestas) {
  const fetchFalso = crearFetchFalso(respuestas)
  vi.stubGlobal('fetch', fetchFalso)
  return fetchFalso
}

// JWT de prueba (firma falsa): solo interesa el "exp" que lee el frontend.
const tokenQueVence = (segundos) => {
  const payload = btoa(JSON.stringify({ sub: '1', rol: 'CLIENTE', exp: Math.floor(Date.now() / 1000) + segundos }))
  return `x.${payload}.y`
}

const sesionApi = (nombre, rol = 'CLIENTE') => ({
  cuerpo: { token: 'token-de-prueba', usuario: { id: 1, nombre, correo: 'x@correo.cl', rol, activo: true } },
})

describe('App - autenticación', () => {
  afterEach(() => {
    cerrarSesion()
    vi.unstubAllGlobals()
  })

  it.each(['/', '/catalogo', '/contacto'])('sin sesión, %s es pública: muestra el navbar con "Iniciar sesión"', (ruta) => {
    renderEn(ruta, { conSesion: false })
    expect(window.location.pathname).toBe(ruta)
    expect(navbar()).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/iniciar-sesion')
  })

  it.each(['/checkout', '/rastreo', '/admin'])('sin sesión, %s manda primero a iniciar sesión, sin navbar', (ruta) => {
    renderEn(ruta, { conSesion: false })
    expect(window.location.pathname).toBe('/iniciar-sesion')
    expect(screen.getByText('Ingresa con tu correo y contraseña')).toBeInTheDocument()
    expect(screen.getByText('Inicia sesión para continuar.')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).not.toBeInTheDocument()
  })

  it('después de iniciar sesión vuelve a la página privada que pidió', async () => {
    simularApi(sesionApi('Camila Rojas'))
    const user = renderEn('/rastreo', { conSesion: false })
    await user.type(screen.getByLabelText(/Correo/), 'camila.rojas@correo.cl')
    await user.type(screen.getByLabelText(/Contraseña/), 'Clave1234')
    await user.click(screen.getByRole('button', { name: /Iniciar sesi[oó]n/ }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Rastrea tu pedido' })).toBeInTheDocument()
  })

  it('la sesión se mantiene al recargar la página (queda en localStorage)', () => {
    iniciarSesion('Camila', { token: tokenQueVence(60), rol: 'CLIENTE' })
    window.history.pushState({}, '', '/rastreo')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Rastrea tu pedido' })).toBeInTheDocument()
    expect(screen.getByText('Camila')).toBeInTheDocument()
  })

  it('con el token vencido la sesión se limpia y vuelve al login', () => {
    iniciarSesion('Camila', { token: tokenQueVence(-60), rol: 'CLIENTE' })
    window.history.pushState({}, '', '/rastreo')
    render(<App />)
    expect(window.location.pathname).toBe('/iniciar-sesion')
    expect(localStorage.getItem('gev:sesion')).toBeNull()
    expect(screen.getByText('Tu sesión expiró. Vuelve a iniciar sesión para continuar.')).toBeInTheDocument()
  })

  it('al ingresar llama al backend, entra al inicio y el navbar saluda con su primer nombre', async () => {
    const fetchFalso = simularApi(sesionApi('Camila Rojas'))
    const user = renderEn('/iniciar-sesion', { conSesion: false })

    await user.type(screen.getByLabelText(/Correo/), 'camila.rojas@correo.cl')
    await user.type(screen.getByLabelText(/Contraseña/), 'Clave1234')
    await user.click(screen.getByRole('button', { name: /Iniciar sesi[oó]n/ }))

    expect(await screen.findByRole('heading', { level: 1, name: '¿Necesitas gas hoy?' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
    expect(screen.getByText('Camila')).toBeInTheDocument()
    expect(fetchFalso).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }))
  })

  it('si el backend rechaza las credenciales muestra el error y no entra', async () => {
    simularApi({ estado: 401, cuerpo: { mensaje: 'Correo o contraseña incorrectos' } })
    const user = renderEn('/iniciar-sesion', { conSesion: false })

    await user.type(screen.getByLabelText(/Correo/), 'camila.rojas@correo.cl')
    await user.type(screen.getByLabelText(/Contraseña/), 'Clave1234')
    await user.click(screen.getByRole('button', { name: /Iniciar sesi[oó]n/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos')
    expect(window.location.pathname).toBe('/iniciar-sesion')
  })

  it('la administradora entra directo al panel de administración', async () => {
    simularApi(sesionApi('Ana Admin', 'ADMINISTRADOR'), {
      cuerpo: { pedidosHoy: 3, pendientes: 1, enCurso: 1, entregadosHoy: 1, ventasHoy: 12000, umbralStockBajo: 15, stockBajo: [] },
    })
    const user = renderEn('/iniciar-sesion', { conSesion: false })

    await user.type(screen.getByLabelText(/Correo/), 'admin@elvolcan.cl')
    await user.type(screen.getByLabelText(/Contraseña/), 'Admin1234')
    await user.click(screen.getByRole('button', { name: /Iniciar sesi[oó]n/ }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Resumen del día' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin')
    expect(await screen.findByText('$12.000')).toBeInTheDocument()
  })

  it('al registrarse entra al inicio con su primer nombre', async () => {
    simularApi({ ...sesionApi('Pedro Soto'), estado: 201 })
    const user = renderEn('/registro', { conSesion: false })

    await user.type(screen.getByLabelText(/Nombre/), 'Pedro Soto')
    await user.type(screen.getByLabelText(/Correo/), 'pedro@correo.cl')
    await user.type(screen.getByLabelText(/Teléfono/), '912345678')
    await user.type(screen.getByLabelText(/^Contraseña/), 'Clave1234')
    await user.type(screen.getByLabelText(/Confirmar contraseña/), 'Clave1234')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Pedro')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('cerrar sesión vuelve al login y ya no deja entrar', async () => {
    const user = renderEn('/')

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(window.location.pathname).toBe('/iniciar-sesion')
    expect(screen.getByText('Cerraste sesión correctamente.')).toBeInTheDocument()
    expect(localStorage.getItem('gev:sesion')).toBeNull()
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
    ['/checkout', 'Tu carrito está vacío'],
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

describe('App - panel de administración', () => {
  afterEach(() => {
    cerrarSesion()
    vi.unstubAllGlobals()
  })

  it('un cliente que intenta entrar a /admin ve "Acceso restringido"', () => {
    iniciarSesion('Camila', { token: 't', rol: 'CLIENTE' })
    window.history.pushState({}, '', '/admin')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Acceso restringido' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Secciones de administración' })).not.toBeInTheDocument()
  })

  it('un cliente no ve el enlace "Administración" en el navbar', () => {
    iniciarSesion('Camila', { token: 't', rol: 'CLIENTE' })
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(within(navbar()).queryByRole('link', { name: 'Administración' })).not.toBeInTheDocument()
  })

  it('la operadora ve Resumen y Pedidos, pero no Usuarios ni Productos', () => {
    simularApi({ cuerpo: { pedidosHoy: 0, pendientes: 0, enCurso: 0, entregadosHoy: 0, ventasHoy: 0, umbralStockBajo: 15, stockBajo: [] } })
    iniciarSesion('Marta', { token: 't', rol: 'OPERADORA' })
    window.history.pushState({}, '', '/admin')
    render(<App />)

    const menu = screen.getByRole('navigation', { name: 'Secciones de administración' })
    expect(within(menu).getByRole('link', { name: /Resumen/ })).toBeInTheDocument()
    expect(within(menu).getByRole('link', { name: /Pedidos/ })).toBeInTheDocument()
    expect(within(menu).queryByRole('link', { name: /Usuarios/ })).not.toBeInTheDocument()
    expect(within(menu).queryByRole('link', { name: /Productos/ })).not.toBeInTheDocument()
  })

  it('la operadora no puede abrir /admin/usuarios', () => {
    simularApi({ cuerpo: { pedidosHoy: 0, pendientes: 0, enCurso: 0, entregadosHoy: 0, ventasHoy: 0, umbralStockBajo: 15, stockBajo: [] } })
    iniciarSesion('Marta', { token: 't', rol: 'OPERADORA' })
    window.history.pushState({}, '', '/admin/usuarios')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Acceso restringido' })).toBeInTheDocument()
    expect(screen.getByText(/Disponible solo para: Administrador/)).toBeInTheDocument()
  })
})
