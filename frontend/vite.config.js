import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Only use proxy for local development
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  define: {
    __DEV__: true
  }
})