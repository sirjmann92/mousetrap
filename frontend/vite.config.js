import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(() => {
  // Allow overriding the backend URL via Vite env vars in development.
  // Priority: VITE_BACKEND_URL if set, otherwise construct from host/port/protocol.
  const envUrl = process.env.VITE_BACKEND_URL;
  const backendPort = process.env.VITE_BACKEND_PORT || '39842';
  const backendHost = process.env.VITE_BACKEND_HOST || 'localhost';
  const backendProtocol = (process.env.VITE_BACKEND_PROTOCOL || 'http').replace(':', '');
  const defaultUrl = `${backendProtocol}://${backendHost}:${backendPort}`;
  const backendUrl = envUrl || defaultUrl;

  return {
    server: {
      // Vite's dev server defaults to 5173. Explicitly set it and
      // proxy API requests to the backend uvicorn server so the
      // frontend can use relative paths like /api/... in development.
      port: 5173,
      proxy: {
        // Proxy API calls to the backend
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        // Proxy logs (served by backend) so fetch('/logs/...') works in dev
        '/logs': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'build',
    },
    plugins: [react(), svgr({ svgrOptions: { icon: true } })],
  };
});
