import { pythonSource } from '@/lib/source';
import { cleanMdxContent } from '@/lib/mdx-utils';

export const revalidate = false;

const SITE_URL = 'https://dflow-sdk.vercel.app';

export async function GET() {
  const pages = pythonSource.getPages();
  
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
#                          DFLOW PYTHON SDK DOCUMENTATION                        #
################################################################################

This is the complete documentation for the DFlow Python SDK - a Pythonic SDK
for building on DFlow's Solana-based prediction markets and trading platform.

RESOURCES:
• Website: ${SITE_URL}
• Documentation: ${SITE_URL}/docs/python
• GitHub: https://github.com/vaibhav0806/dflow-sdk
• PyPI: https://pypi.org/project/dflow-sdk/

INSTALLATION:
[BASH]
pip install dflow-sdk
# or
uv add dflow-sdk
# or
poetry add dflow-sdk
[END BASH]

QUICK START:
[PYTHON]
from dflow import DFlowClient

client = DFlowClient()

# Get active markets
markets = client.markets.get_markets(status="active")

# Subscribe to real-time prices (async)
async with client.ws as ws:
    await ws.subscribe_prices(["market-ticker"])
    async for price in ws.prices():
        print(price)
[END PYTHON]

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
