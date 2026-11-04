import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El cliente corre en :5173 y reenvía las llamadas /api al servidor Express en :3001
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
