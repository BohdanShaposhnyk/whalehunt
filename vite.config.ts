import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), visualizer({ open: true, filename: 'bundle-report.html' })],
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
