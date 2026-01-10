import { typescriptSource, pythonSource } from '@/lib/source';

// Cached forever for performance
export const revalidate = false;

export async function GET() {
  const tsPages = typescriptSource.getPages();
  const pyPages = pythonSource.getPages();

  const formatPages = (pages: typeof tsPages, sdkName: string) =>
    pages
      .map((page) => {
        return `# ${page.data.title}
SDK: ${sdkName}
URL: ${page.url}
${page.data.description ? `Description: ${page.data.description}` : ''}

---`;
      })
      .join('\n\n');

  const header = `# DFlow SDK Documentation
This is the complete documentation for the DFlow SDK - available in both TypeScript and Python for building on DFlow's Solana-based prediction markets and trading platform.

Website: https://pond.dflow.net
SDK Repository: https://github.com/vaibhav0806/dflow-sdk

---

## Table of Contents

### TypeScript SDK
${tsPages.map((page) => `- ${page.data.title} (${page.url})`).join('\n')}

### Python SDK
${pyPages.map((page) => `- ${page.data.title} (${page.url})`).join('\n')}

---

## Full Documentation

### TypeScript SDK

`;

  const tsContent = formatPages(tsPages, 'TypeScript');
  const pyContent = formatPages(pyPages, 'Python');

  return new Response(header + tsContent + '\n\n### Python SDK\n\n' + pyContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
