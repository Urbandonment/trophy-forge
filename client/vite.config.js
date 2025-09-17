import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This is the proxy for your API calls
      '/api': 'http://localhost:5000',
      // This is the proxy for your assets
      '/assets': 'http://localhost:5000'
    }
  }
});
