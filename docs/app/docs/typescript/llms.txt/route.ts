import { typescriptSource } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  const pages = typescriptSource.getPages();

  const header = `# DFlow TypeScript SDK Documentation
This is the complete documentation for the DFlow TypeScript SDK - a unified SDK for building on DFlow's Solana-based prediction markets and trading platform.

Website: https://dflow-sdk.vercel.app
SDK Repository: https://github.com/vaibhav0806/dflow-sdk
NPM Package: https://www.npmjs.com/package/dflow-sdk

## Installation

\`\`\`bash
pnpm add dflow-sdk
# or
npm install dflow-sdk
\`\`\`

---

## Table of Contents

${pages.map((page) => `- ${page.data.title} (${page.url})`).join('\n')}

---

## Full Documentation

`;

  const content = pages
    .map((page) => {
      return `### ${page.data.title}
URL: https://dflow-sdk.vercel.app${page.url}
${page.data.description ? `Description: ${page.data.description}` : ''}

---`;
    })
    .join('\n\n');

  return new Response(header + content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
