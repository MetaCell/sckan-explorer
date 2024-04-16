import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://composer.sckan.dev.metacell.us',
        changeOrigin: true,
        rewrite: path => path
      }
    }
  }
})
