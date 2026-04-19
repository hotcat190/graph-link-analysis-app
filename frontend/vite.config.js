import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Quan trọng: Cho phép Docker expose port ra ngoài
    port: 5173,
    watch: {
      usePolling: true // Quan trọng: Giúp tính năng hot-reload hoạt động trên Windows/Mac qua Docker
    }
  }
})