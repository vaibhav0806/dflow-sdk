import { typescriptSource, pythonSource } from '@/lib/source';
import { createSearchAPI } from 'fumadocs-core/search/server';

// Combined search for both SDKs (used by homepage/general search)
export const { GET } = createSearchAPI('advanced', {
  indexes: [
    ...typescriptSource.getPages().map((page) => ({
      title: `[TS] ${page.data.title}`,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
    })),
    ...pythonSource.getPages().map((page) => ({
      title: `[Py] ${page.data.title}`,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
    })),
  ],
});
