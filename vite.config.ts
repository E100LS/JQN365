import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  buildEnd: () => {
    // Copy _routes.json to dist/ so Cloudflare Pages picks it up
    const src = resolve(__dirname, '_routes.json')
    const dest = resolve(__dirname, 'dist', '_routes.json')
    try {
      copyFileSync(src, dest)
    } catch {
      // file may not exist
    }
  },
})
