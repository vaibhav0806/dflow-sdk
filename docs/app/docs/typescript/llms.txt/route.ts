import { typescriptSource } from '@/lib/source';
import { cleanMdxContent } from '@/lib/mdx-utils';

export const revalidate = false;

const SITE_URL = 'https://dflow-sdk.vercel.app';

export async function GET() {
  const pages = typescriptSource.getPages();
  
  // Sort pages logically
  const sortOrder = ['index', 'installation', 'quickstart', 'client', 'events', 'markets'];
  pages.sort((a, b) => {
    const aIdx = sortOrder.findIndex(s => a.url.includes(s));
    const bIdx = sortOrder.findIndex(s => b.url.includes(s));
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.url.localeCompare(b.url);
  });

  // Generate documentation content from each page
  const sections: string[] = [];
  
  for (const page of pages) {
    const title = page.data.title;
    const description = page.data.description;
    const url = `${SITE_URL}${page.url}`;
    
    // Get the raw content if available, otherwise use structured data
    let content = '';
    
    // Try to get content from the page's structured data (TOC)
    if (page.data.structuredData) {
      const toc = page.data.structuredData;
      if (toc.contents && Array.isArray(toc.contents)) {
        content = toc.contents
          .map((item: { heading?: string; content?: string }) => {
            const parts = [];
            if (item.heading) parts.push(`\n=== ${item.heading} ===\n`);
            if (item.content) parts.push(cleanMdxContent(item.content));
            return parts.join('');
          })
          .join('\n');
      }
    }
    
    // Build the section
    sections.push(`
################################################################################
${title.toUpperCase()}
################################################################################
URL: ${url}
${description ? `\nDescription: ${description}\n` : ''}
${content || `See documentation at: ${url}`}
`);
  }

  const header = `################################################################################
#                        DFLOW TYPESCRIPT SDK DOCUMENTATION                      #
################################################################################

This is the complete documentation for the DFlow TypeScript SDK - a unified SDK
for building on DFlow's Solana-based prediction markets and trading platform.

RESOURCES:
• Website: ${SITE_URL}
• Documentation: ${SITE_URL}/docs/typescript
• GitHub: https://github.com/vaibhav0806/dflow-sdk
• NPM: https://www.npmjs.com/package/dflow-sdk

INSTALLATION:
[BASH]
pnpm add dflow-sdk
# or
npm install dflow-sdk
# or
bun add dflow-sdk
[END BASH]

QUICK START:
[TYPESCRIPT]
import { DFlowClient } from 'dflow-sdk';

const dflow = new DFlowClient();

// Get active markets
const markets = await dflow.markets.getMarkets({ status: 'active' });

// Subscribe to real-time prices
await dflow.ws.connect();
dflow.ws.subscribePrices(['market-ticker']);
dflow.ws.onPrice((update) => console.log(update));
[END TYPESCRIPT]

################################################################################
#                              TABLE OF CONTENTS                                #
################################################################################

${pages.map(p => `• ${p.data.title} - ${SITE_URL}${p.url}`).join('\n')}

################################################################################
#                              FULL DOCUMENTATION                               #
################################################################################
${sections.join('\n')}

################################################################################
#                              END OF DOCUMENTATION                             #
################################################################################
`;

  return new Response(header, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
