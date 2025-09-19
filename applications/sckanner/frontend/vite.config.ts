import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const API_URL =
    mode === 'production'
      ? process.env.VITE_API_URL
      : 'https://sckanner.dev.metacell.us';

  return {
    plugins: [react()],
    assetsInclude: ['**/*.svg'],
    build: {
      assetsInlineLimit: 0, // This prevents small assets from being inlined
    },
    server: {
      ...(API_URL && {
        proxy: {
          '/api': {
            target: API_URL,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path,
            configure: (proxy) => {
              proxy.on('error', (err) => {
                console.log('proxy error', err);
              });
              proxy.on('proxyReq', (proxyReq, req) => {
                console.log(
                  'Sending Request to the Target:',
                  req.method,
                  req.url,
                );
              });
              proxy.on('proxyRes', (proxyRes, req) => {
                console.log(
                  'Received Response from the Target:',
                  proxyRes.statusCode,
                  req.url,
                );
              });
            },
          },
          '/media': {
            target: API_URL,
            changeOrigin: true,
            secure: false,
          },
        },
      }),
      cors: false,
    },
  };
});
