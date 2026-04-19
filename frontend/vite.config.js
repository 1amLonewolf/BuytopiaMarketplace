import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.VITE_API_URL 
  ? (process.env.VITE_API_URL.startsWith('http') ? new URL(process.env.VITE_API_URL).origin : '/') 
  : '/'

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
        target: 'https://buytopia-backend-production-3994.up.railway.app',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://buytopia-backend-production-3994.up.railway.app',
        changeOrigin: true,
      }
    }
  }
})