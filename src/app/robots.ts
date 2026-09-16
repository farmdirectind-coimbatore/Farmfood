import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/api/', '/login'],
    },
    sitemap: 'https://farmdirect.co.in/sitemap.xml',
  };
}