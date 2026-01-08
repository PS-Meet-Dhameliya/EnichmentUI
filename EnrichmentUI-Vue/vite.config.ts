import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'd3': ['d3'],
          'vendor': ['vue', 'pinia', 'vue-router']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  worker: {
    format: 'es'  // Enable Web Workers
  }
})
