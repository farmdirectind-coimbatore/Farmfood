import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FarmDirect | Agriculture & Aagritech',
    short_name: 'FarmDirect',
    description: 'FarmDirect connects people with real agricultural operations in Coimbatore — crop cultivation, livestock, fresh farm produce, wholesale distribution and agro-tourism.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafdf7',
    theme_color: '#2d6a4f',
    icons: [
      {
        src: '/images/favicon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}