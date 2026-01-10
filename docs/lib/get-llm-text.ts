import { typescriptSource } from '@/lib/source';
import type { InferPageType } from 'fumadocs-core/source';

export async function getLLMText(page: InferPageType<typeof typescriptSource>): Promise<string> {
  // Get the raw MDX content from the page data
  const content = page.data.body;

  return `# ${page.data.title}
URL: ${page.url}
${page.data.description ? `Description: ${page.data.description}` : ''}

${typeof content === 'string' ? content : 'Content available at the URL above.'}
`;
}
