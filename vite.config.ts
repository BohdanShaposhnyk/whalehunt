import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  preview: {
    allowedHosts: ['whalehunt-fe-production.up.railway.app']
  },
  // base: './', // Use relative paths for Electron compatibility
});
