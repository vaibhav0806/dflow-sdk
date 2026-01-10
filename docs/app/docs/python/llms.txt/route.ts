import { join } from 'path';
import { generateLLMDocs } from '@/lib/extract-mdx-content';

export const revalidate = false;

const SITE_URL = 'https://dflow-sdk.vercel.app';

export async function GET() {
  const contentDir = join(process.cwd(), 'content/docs/python');
  const fullDocs = generateLLMDocs(contentDir, 'Python', `${SITE_URL}/docs/python`);

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
[BASH CODE]
pip install dflow-sdk
# or
uv add dflow-sdk
# or
poetry add dflow-sdk
[END CODE]

QUICK START:
[PYTHON CODE]
from dflow import DFlowClient

client = DFlowClient()

# Get active markets
markets = client.markets.get_markets(status="active")

# Subscribe to real-time prices (async)
async with client.ws as ws:
    await ws.subscribe_prices(["market-ticker"])
    async for price in ws.prices():
        print(price)
[END CODE]

################################################################################
#                              FULL DOCUMENTATION                               #
################################################################################

${fullDocs}

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
