import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/bgm': {
        target: 'https://api.bgm.tv',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bgm/, ''),
        headers: {
          'User-Agent': 'desolate-snow/0.1.0 (agedm clone study project)',
        },
      },
    },
  },
})
