import { typescriptSource, pythonSource } from '@/lib/source';
import { createSearchAPI } from 'fumadocs-core/search/server';

// Create a combined search across both sources
export const { GET } = createSearchAPI('advanced', {
  indexes: [
    ...typescriptSource.getPages().map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
    })),
    ...pythonSource.getPages().map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
    })),
  ],
});
