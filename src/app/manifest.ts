import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FarmDirect - Fresh Farm Investment Platform',
    short_name: 'FarmDirect',
    description: 'Invest in a real working farm. Earn daily returns from farm revenue.',
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