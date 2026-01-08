# @dflow-dev/prediction-markets

TypeScript SDK for the DFlow Prediction Markets API on Solana. Easily integrate Kalshi prediction markets into your applications.

## Installation

```bash
pnpm add @dflow-dev/prediction-markets
# or
npm install @dflow-dev/prediction-markets
```

## Quick Start

```typescript
import { DFlowClient } from '@dflow-dev/prediction-markets';

const dflow = new DFlowClient({
  apiKey: 'your-api-key', // optional, for higher rate limits
});

// Discover markets
const events = await dflow.events.getEvents({ status: 'active' });
const market = await dflow.markets.getMarket('BTCD-25DEC0313-T92749.99');

// Get orderbook
const orderbook = await dflow.orderbook.getOrderbook('BTCD-25DEC0313-T92749.99');

// Search markets
const results = await dflow.search.search({ query: 'bitcoin' });
```

## Features

- **Full Metadata API**: Events, Markets, Orderbook, Trades, Live Data, Series, Tags, Sports, Search
- **Trade API**: Orders, Swaps (Imperative & Declarative), Prediction Market Initialization
- **Real-time WebSocket**: Subscribe to price updates, trades, and orderbook changes
- **Solana Helpers**: Transaction signing, position tracking, redemption utilities

## API Reference

### Metadata API

```typescript
// Events
await dflow.events.getEvent('event-ticker');
await dflow.events.getEvents({ status: 'active', limit: 50 });
await dflow.events.getEventCandlesticks('event-ticker');

// Markets
await dflow.markets.getMarket('market-ticker');
await dflow.markets.getMarketByMint('mint-address');
await dflow.markets.getMarkets({ status: 'active' });
await dflow.markets.getMarketsBatch({ tickers: ['ticker1', 'ticker2'] });
await dflow.markets.filterOutcomeMints(['mint1', 'mint2']);

// Orderbook
await dflow.orderbook.getOrderbook('market-ticker');
await dflow.orderbook.getOrderbookByMint('mint-address');

// Trades
await dflow.trades.getTrades({ marketTicker: 'ticker' });
await dflow.trades.getTradesByMint('mint-address');

// Live Data
await dflow.liveData.getLiveDataByEvent('event-ticker');

// Series
await dflow.series.getSeries();
await dflow.series.getSeriesByTicker('series-ticker');

// Tags & Sports
await dflow.tags.getTagsByCategories();
await dflow.sports.getFiltersBySports();

// Search
await dflow.search.search({ query: 'bitcoin' });
```

### Trade API

```typescript
import { USDC_MINT } from '@dflow-dev/prediction-markets';

// Get order quote and transaction
const order = await dflow.orders.getOrder({
  inputMint: USDC_MINT,
  outputMint: market.accounts.usdc.yesMint,
  amount: 1000000, // 1 USDC (6 decimals)
  slippageBps: 50,
  userPublicKey: wallet.publicKey.toBase58(),
});

// Check order status (for async trades)
const status = await dflow.orders.getOrderStatus(signature);

// Imperative swaps
const quote = await dflow.swap.getQuote({
  inputMint: USDC_MINT,
  outputMint: 'yes-mint',
  amount: 1000000,
});

const swap = await dflow.swap.createSwap({
  inputMint: USDC_MINT,
  outputMint: 'yes-mint',
  amount: 1000000,
  slippageBps: 50,
  userPublicKey: wallet.publicKey.toBase58(),
});

// Declarative swaps (intent-based)
const intent = await dflow.intent.submitIntent({
  inputMint: USDC_MINT,
  outputMint: 'yes-mint',
  amount: 1000000,
  mode: 'ExactIn',
  userPublicKey: wallet.publicKey.toBase58(),
});
```

### WebSocket

```typescript
// Connect to WebSocket
await dflow.ws.connect();

// Subscribe to specific markets
dflow.ws.subscribePrices(['BTCD-25DEC0313-T92749.99']);
dflow.ws.subscribeTrades(['BTCD-25DEC0313-T92749.99']);
dflow.ws.subscribeOrderbook(['BTCD-25DEC0313-T92749.99']);

// Or subscribe to all
dflow.ws.subscribeAllPrices();

// Handle updates
const unsubscribe = dflow.ws.onPrice((update) => {
  console.log(`${update.ticker}: YES=${update.yesPrice} NO=${update.noPrice}`);
});

dflow.ws.onTrade((trade) => {
  console.log(`Trade: ${trade.side} @ ${trade.price}`);
});

dflow.ws.onOrderbook((book) => {
  console.log(`Orderbook update for ${book.ticker}`);
});

// Cleanup
unsubscribe();
dflow.ws.disconnect();
```

### Solana Helpers

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import {
  signAndSendTransaction,
  waitForConfirmation,
  getUserPositions,
  isRedemptionEligible,
} from '@dflow-dev/prediction-markets';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const keypair = Keypair.fromSecretKey(/* your secret key */);

// Sign and send a transaction
const signature = await signAndSendTransaction(
  connection,
  order.transaction,
  keypair
);

// Wait for confirmation
const confirmation = await waitForConfirmation(connection, signature);

// Get user positions
const positions = await getUserPositions(
  connection,
  keypair.publicKey,
  dflow.markets
);

// Check if position is redeemable
for (const position of positions) {
  if (position.market && isRedemptionEligible(position.market, position.mint)) {
    console.log(`Position ${position.mint} is redeemable!`);
  }
}
```

## Configuration

```typescript
const dflow = new DFlowClient({
  apiKey: 'your-api-key',
  metadataBaseUrl: 'https://prediction-markets-api.dflow.net/api/v1',
  tradeBaseUrl: 'https://quote-api.dflow.net',
  wsOptions: {
    reconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  },
});
```

## Constants

```typescript
import {
  METADATA_API_BASE_URL,
  TRADE_API_BASE_URL,
  WEBSOCKET_URL,
  USDC_MINT,
  SOL_MINT,
  DEFAULT_SLIPPAGE_BPS,
  OUTCOME_TOKEN_DECIMALS,
} from '@dflow-dev/prediction-markets';
```

## Error Handling

```typescript
import { DFlowApiError } from '@dflow-dev/prediction-markets';

try {
  const market = await dflow.markets.getMarket('invalid-ticker');
} catch (error) {
  if (error instanceof DFlowApiError) {
    console.error(`API Error ${error.statusCode}: ${error.message}`);
    console.error('Response:', error.response);
  }
}
```

## Resources

- [DFlow Documentation](https://pond.dflow.net)
- [API Reference](https://pond.dflow.net/prediction-market-metadata-api-reference/introduction)
- [Discord](https://discord.gg/dflow)

## License

MIT
