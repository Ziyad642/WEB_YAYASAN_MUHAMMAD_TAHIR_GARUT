import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const routes = [
    '',
    '/tentang',
    '/unit-pendidikan',
    '/unit-pendidikan/ra',
    '/unit-pendidikan/mi',
    '/unit-pendidikan/smp',
    '/berita',
    '/galeri',
    '/agenda',
    '/ppdb',
    '/cek-pendaftaran',
    '/kontak',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/berita' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route === '/ppdb' ? 0.9 : 0.8,
  }));
}
