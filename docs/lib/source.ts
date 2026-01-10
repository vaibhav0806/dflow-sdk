import { typescriptDocs, pythonDocs } from '@/.source';
import { loader } from 'fumadocs-core/source';

export const typescriptSource = loader({
  baseUrl: '/docs/typescript',
  source: typescriptDocs.toFumadocsSource(),
});

export const pythonSource = loader({
  baseUrl: '/docs/python',
  source: pythonDocs.toFumadocsSource(),
});

// Helper to get source by SDK type
export function getSource(sdk: 'typescript' | 'python') {
  return sdk === 'typescript' ? typescriptSource : pythonSource;
}
