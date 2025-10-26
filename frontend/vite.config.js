import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to your Node.js backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Proxy WebSocket connections
      '/socket': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    }
  }
})