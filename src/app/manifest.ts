import type { MetadataRoute } from 'next'

import { THEME_COLORS } from '@/lib/theme'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ClippingKK',
    short_name: 'ClippingKK',
    description: 'Your reading highlights, kept and shared.',
    start_url: '/',
    display: 'standalone',
    background_color: THEME_COLORS.light,
    theme_color: THEME_COLORS.light,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
