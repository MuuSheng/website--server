import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 26315,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:26314',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:26314',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:26314',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'socket.io-client']
        }
      }
    }
  }
})