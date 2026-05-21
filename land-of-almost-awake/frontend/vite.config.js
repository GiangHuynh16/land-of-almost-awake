import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Keep the initial bundle lean — vendor libs hash separately from app code
    // so the browser can cache them across deploys, and route-level lazy chunks
    // split off Signup/Join/Login/CinematicStage/KingdomDetail naturally.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/react') || id.includes('/scheduler')) return 'react-vendor'
          if (id.includes('react-router')) return 'react-vendor'
          if (id.includes('animejs')) return 'anime-vendor'
          if (id.includes('@supabase') || id.includes('/zustand') || id.includes('date-fns')) return 'data-vendor'
          return 'vendor'
        },
      },
    },
  },
})
