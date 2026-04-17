import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.VITE_API_URL ? new URL(process.env.VITE_API_URL).origin : '/'

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
