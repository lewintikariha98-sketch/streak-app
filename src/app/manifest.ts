import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Streak — Build Better Habits',
    short_name: 'Streak',
    description: 'Track habits, earn XP, grow your streak. A gamified habit builder that actually works.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F0D2A',
    theme_color: '#0F0D2A',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
