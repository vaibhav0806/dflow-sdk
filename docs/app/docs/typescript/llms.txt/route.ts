import { join } from 'path';
import { generateLLMDocs } from '@/lib/extract-mdx-content';

export const revalidate = false;

const SITE_URL = 'https://dflow-sdk.vercel.app';

export async function GET() {
  const contentDir = join(process.cwd(), 'content/docs/typescript');
  const fullDocs = generateLLMDocs(contentDir, 'TypeScript', `${SITE_URL}/docs/typescript`);

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
[BASH CODE]
pnpm add dflow-sdk
# or
npm install dflow-sdk
# or
bun add dflow-sdk
[END CODE]

QUICK START:
[TYPESCRIPT CODE]
import { DFlowClient } from 'dflow-sdk';

const dflow = new DFlowClient();

// Get active markets
const markets = await dflow.markets.getMarkets({ status: 'active' });

// Subscribe to real-time prices
await dflow.ws.connect();
dflow.ws.subscribePrices(['market-ticker']);
dflow.ws.onPrice((update) => console.log(update));
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
