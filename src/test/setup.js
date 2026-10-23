import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Desmonta los componentes renderizados después de cada test.
afterEach(() => {
  cleanup()
})
