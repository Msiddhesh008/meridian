import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Repo name on GitHub Pages: https://<user>.github.io/meridian/
  base: '/meridian/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Meridian',
        short_name: 'Meridian',
        description: 'Daily work, attendance, and team allocation for leads',
        theme_color: '#1B2740',
        background_color: '#E8EDF5',
        display: 'standalone',
        start_url: '/meridian/',
        scope: '/meridian/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png,jpg}'],
        navigateFallback: '/meridian/index.html',
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
