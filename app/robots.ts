import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = 'https://detube.slope726.in';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/deposit', '/withdraw', '/statement'] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
