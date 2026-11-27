import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { crearFetchFalso } from './apiFalsa.js'

// Cada test parte con un backend falso (catálogo y pedidos); un test puede reemplazarlo con vi.stubGlobal.
beforeEach(() => {
  vi.stubGlobal('fetch', crearFetchFalso())
})

// Desmonta los componentes renderizados después de cada test.
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
