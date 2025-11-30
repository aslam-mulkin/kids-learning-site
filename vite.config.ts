import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': '/src' } },
  base: '/kids-learning-site/',
  build: {
    // Split big vendor bundles into smaller chunks for faster loads
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom')) return 'router'
            if (id.includes('react')) return 'react'
            return 'vendor'
          }
          if (id.includes('/src/views/FlashcardsView')) return 'flashcards'
          if (id.includes('/src/views/QuizView')) return 'quiz'
        }
      }
    },
    chunkSizeWarningLimit: 900
  }
})
