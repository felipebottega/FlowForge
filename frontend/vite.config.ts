/**
 * Vite Configuration File.
 * Includes a proxy server to redirect API calls to the FastAPI backend,
 * preventing CORS issues during local development.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Redirects all requests starting with /api to the backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Optional: Proxy for ComfyUI static outputs if needed
      '/outputs': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});