import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      // Watch for changes in the core package
      ignored: ['!**/node_modules/**', '!**/packages/core/dist/**'],
    },
  },
  optimizeDeps: {
    // Include workspace dependencies for HMR
    include: ['@aruizca-resume/core'],
  },
})
