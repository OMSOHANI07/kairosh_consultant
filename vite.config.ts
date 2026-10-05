import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from the root of a custom domain on GitHub Pages, so base stays '/'.
// The admin dashboard (charts, drag-and-drop) and the auth SDK are lazy-loaded
// chunks, so public pages only download what they need.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 700,
  },
})
