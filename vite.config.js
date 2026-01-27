import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vercelApiPlugin from './vite-plugin-vercel-api'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiPlugin()],
  server: {
    proxy: {
      '/api/airbnb': {
        target: 'https://airbnb-data.p.rapidapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/airbnb/, ''),
      },
    },
  },
})
