import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_URL = process.env.VITE_API_URL;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    ...(API_URL && {
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
        },
      },
    }),
  },
});
