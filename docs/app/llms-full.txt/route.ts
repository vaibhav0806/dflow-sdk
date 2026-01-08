import { source } from '@/lib/source';

// Cached forever for performance
export const revalidate = false;

export async function GET() {
  const pages = source.getPages();

  const content = pages
    .map((page) => {
      return `# ${page.data.title}
URL: ${page.url}
${page.data.description ? `Description: ${page.data.description}` : ''}

---`;
    })
    .join('\n\n');

  const header = `# DFlow SDK Documentation
This is the complete documentation for the DFlow SDK - a unified TypeScript SDK for building on DFlow's Solana-based prediction markets and trading platform.

Website: https://pond.dflow.net
SDK Repository: https://github.com/dflow-protocol/dflow-sdk

---

## Table of Contents

${pages.map((page) => `- ${page.data.title} (${page.url})`).join('\n')}

---

## Full Documentation

`;

  return new Response(header + content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
