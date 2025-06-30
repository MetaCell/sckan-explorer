import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const API_URL = process.env.VITE_API_URL;

  return {
    plugins: [react()],
    server: {
      ...(API_URL && {
        proxy: {
          '/api/': {
            target: API_URL,
            changeOrigin: true,
            secure: false,
          },
        },
      }),
    },
  };
});
