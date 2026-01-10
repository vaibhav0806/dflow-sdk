import { pythonSource } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  const pages = pythonSource.getPages();

  const header = `# DFlow Python SDK Documentation
This is the complete documentation for the DFlow Python SDK - a Pythonic SDK for building on DFlow's Solana-based prediction markets and trading platform.

Website: https://dflow-sdk.vercel.app
SDK Repository: https://github.com/vaibhav0806/dflow-sdk
PyPI Package: https://pypi.org/project/dflow-sdk/

## Installation

\`\`\`bash
pip install dflow-sdk
# or
uv add dflow-sdk
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
