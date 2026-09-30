import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Otantikos Concept | Squishy & Hediyelik Dünyası',
    short_name: 'Otantikos',
    description: "Türkiye'nin en sevimli squishy, kupa ve hediyelik konsept ürünleri.",
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F8F5F0',
    theme_color: '#e60012',
    lang: 'tr',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
