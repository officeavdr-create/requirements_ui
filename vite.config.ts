import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
// export default defineConfig({
//   root: '.',
//   resolve: {
//     alias: {
//       '/src': path.resolve(__dirname, 'src'),
//     },
//   },
//   build: {
//     outDir: 'dist',
//   },
// });
export default defineConfig({
  plugins: [react()],
  root: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow external connections
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Backend running on localhost
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // base: '/app/frontend/dist/', // For production deployment
  base: '/app', // For production deployment

})
