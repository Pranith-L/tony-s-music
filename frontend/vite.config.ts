import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const norm = id.replace(/\\/g, '/');
          if (norm.includes('node_modules')) {
            if (norm.includes('/three/') || norm.includes('@react-three') || norm.includes('three-stdlib')) {
              return 'vendor-three';
            }
            if (norm.includes('framer-motion')) {
              return 'vendor-framer';
            }
            if (norm.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (norm.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (norm.includes('/react/') || norm.includes('/react-dom/') || norm.includes('react-router')) {
              return 'vendor-react';
            }
            return 'vendor-libs';
          }
        },
      },
    },
  },
})
