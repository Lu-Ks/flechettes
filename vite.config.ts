import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    // Keep every SVG as a real file URL — Safari's mask-image chokes on the
    // inlined data: URIs Vite would otherwise emit for small assets.
    assetsInlineLimit: 0,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon-32.png', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        scope: '/',
        lang: 'fr',
        name: 'MORI SCORE - Darts Pursuit',
        short_name: 'MORI SCORE',
        description: 'Compteur de points pour fléchettes avec mode Poursuite',
        theme_color: '#1c1c1e',
        background_color: '#1c1c1e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
