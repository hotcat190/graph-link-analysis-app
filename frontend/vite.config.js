import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: true, // Quan trọng: Cho phép Docker expose port ra ngoài
      port: 5173,
      watch: {
        usePolling: true // Quan trọng: Giúp tính năng hot-reload hoạt động trên Windows/Mac qua Docker
      }
    },
  }
})