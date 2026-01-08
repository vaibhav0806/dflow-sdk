import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dflow-sdk.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages();

  const docPages = pages.map((page) => ({
    url: `${siteUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: page.slugs.length === 0 ? 1 : 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...docPages,
  ];
}
