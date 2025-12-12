import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'axios': ['axios'],
          'ui': ['lucide-react'],
        },
      },
    },
  },
  preview: {
    port: 4173,
  },
})