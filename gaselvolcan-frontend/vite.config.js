import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // En desarrollo (npm run dev) las llamadas a /api van a los microservicios.
  // El primer prefijo que coincide gana: auth y usuarios → 8081, el resto → 8082.
  server: {
    proxy: {
      '/api/auth': 'http://localhost:8081',
      '/api/usuarios': 'http://localhost:8081',
      '/api': 'http://localhost:8082',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
  },
})
