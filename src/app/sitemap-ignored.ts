import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const links = [
    { url: '/', changefreq: 'monthly', priority: 1 },
    { url: '/auth/signin', changefreq: 'monthly', priority: 0.1 },
    { url: '/auth/phone', changefreq: 'monthly', priority: 0.1 },
  ]
  return links
}
