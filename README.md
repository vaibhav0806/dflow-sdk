# DFlow SDK

Unified TypeScript SDK for DFlow on Solana - prediction markets and trading.

## Installation

```bash
pnpm add dflow-sdk
# or
npm install dflow-sdk
```

## Quick Start

```typescript
import { DFlowClient } from 'dflow-sdk';

const dflow = new DFlowClient({
  apiKey: 'your-api-key', // optional, for higher rate limits
});

// Discover markets
const events = await dflow.events.getEvents({ status: 'active' });
const market = await dflow.markets.getMarket('BTCD-25DEC0313-T92749.99');

// Get a quote and trade
const quote = await dflow.swap.getQuote({
  inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  outputMint: market.accounts.usdc.yesMint,
  amount: 1000000, // 1 USDC
});
```

## Features

- **Prediction Markets API**: Events, Markets, Orderbook, Trades, Live Data, Series, Tags, Sports, Search
- **Trade API**: Orders, Swaps, Intents, Market Initialization, Tokens, Venues
- **Real-time WebSocket**: Subscribe to price updates, trades, and orderbook changes
- **Solana Helpers**: Transaction signing, position tracking, redemption utilities

---

## Prediction Markets API

### Events

```typescript
// Get single event
const event = await dflow.events.getEvent('event-id');
const eventWithMarkets = await dflow.events.getEvent('event-id', true);

// List events
const events = await dflow.events.getEvents({
  status: 'active',
  limit: 50,
  seriesTicker: 'KXBTC',
});

// Forecast history
const forecast = await dflow.events.getEventForecastHistory('series-ticker', 'event-id');
const forecastByMint = await dflow.events.getEventForecastByMint('mint-address');

// Candlesticks
const candles = await dflow.events.getEventCandlesticks('event-ticker');
```

### Markets

```typescript
// Get single market
const market = await dflow.markets.getMarket('market-ticker');
const marketByMint = await dflow.markets.getMarketByMint('mint-address');

// List markets
const markets = await dflow.markets.getMarkets({
  status: 'active',
  eventTicker: 'event-ticker',
});

// Batch queries (max 100 items)
const batch = await dflow.markets.getMarketsBatch({
  tickers: ['ticker1', 'ticker2'],
  mints: ['mint1', 'mint2'],
});

// Outcome mints
const allMints = await dflow.markets.getOutcomeMints();
const filteredMints = await dflow.markets.filterOutcomeMints(['address1', 'address2']);

// Candlesticks
const candles = await dflow.markets.getMarketCandlesticks('market-ticker');
const candlesByMint = await dflow.markets.getMarketCandlesticksByMint('mint-address');
```

### Orderbook

```typescript
const orderbook = await dflow.orderbook.getOrderbook('market-ticker');
const orderbookByMint = await dflow.orderbook.getOrderbookByMint('mint-address');

// Orderbook structure
// { yesAsk, yesBid, noAsk, noBid } - each with price and quantity
```

### Trades

```typescript
const trades = await dflow.trades.getTrades({
  marketTicker: 'ticker',
  limit: 100,
});
const tradesByMint = await dflow.trades.getTradesByMint('mint-address');
```

### Live Data

```typescript
const liveData = await dflow.liveData.getLiveData(['milestone1', 'milestone2']);
const liveByEvent = await dflow.liveData.getLiveDataByEvent('event-ticker');
const liveByMint = await dflow.liveData.getLiveDataByMint('mint-address');
```

### Series, Tags, Sports & Search

```typescript
// Series
const allSeries = await dflow.series.getSeries();
const series = await dflow.series.getSeriesByTicker('series-ticker');

// Tags & Sports
const tags = await dflow.tags.getTagsByCategories();
const sports = await dflow.sports.getFiltersBySports();

// Search
const results = await dflow.search.search({ query: 'bitcoin' });
```

---

## Trade API

### Orders

```typescript
import { USDC_MINT } from 'dflow-sdk';

// Get order quote and transaction
const order = await dflow.orders.getOrder({
  inputMint: USDC_MINT,
  outputMint: market.accounts.usdc.yesMint,
  amount: 1000000, // 1 USDC (6 decimals)
  slippageBps: 50,
  userPublicKey: wallet.publicKey.toBase58(),
  platformFeeBps: 10, // optional
  platformFeeAccount: 'fee-account', // optional
});

// Check order status (for async trades)
const status = await dflow.orders.getOrderStatus(signature);
// status: 'open' | 'closed' | 'failed' | 'pendingClose'
```

### Swaps (Imperative)

```typescript
// Get quote
const quote = await dflow.swap.getQuote({
  inputMint: USDC_MINT,
  outputMint: 'yes-mint',
  amount: 1000000,
  slippageBps: 50,
});

// Create swap transaction
const swap = await dflow.swap.createSwap({
  inputMint: USDC_MINT,
  outputMint: 'yes-mint',
  amount: 1000000,
  slippageBps: 50,
  userPublicKey: wallet.publicKey.toBase58(),
  wrapUnwrapSol: true,
  priorityFee: { type: 'exact', amount: 10000 },
});

// Get swap instructions (for custom composition)
const instructions = await dflow.swap.getSwapInstructions({
  inputMint: USDC_MINT,
  outputMint: 'yes-mint',
  amount: 1000000,
  slippageBps: 50,
  userPublicKey: wallet.publicKey.toBase58(),
});
```

### Intents (Declarative)

```typescript
// Get intent quote
const intentQuote = await dflow.intent.getIntentQuote({
  inputMint: USDC_MINT,
  outputMint: 'yes-mint',
  amount: 1000000,
  mode: 'ExactIn', // or 'ExactOut'
});

// Submit intent
const intent = await dflow.intent.submitIntent({
  inputMint: USDC_MINT,
  outputMint: 'yes-mint',
  amount: 1000000,
  mode: 'ExactIn',
  slippageBps: 50,
  userPublicKey: wallet.publicKey.toBase58(),
});
```

### Prediction Market Initialization

```typescript
// Initialize a new prediction market
const init = await dflow.predictionMarket.initializeMarket({
  marketTicker: 'MARKET-TICKER',
  userPublicKey: wallet.publicKey.toBase58(),
  settlementMint: USDC_MINT, // optional, defaults to USDC
});
// Returns: { transaction, yesMint, noMint }
```

### Tokens & Venues

```typescript
// Get available tokens
const tokens = await dflow.tokens.getTokens();
const tokensWithDecimals = await dflow.tokens.getTokensWithDecimals();

// Get trading venues
const venues = await dflow.venues.getVenues();
```

---

## WebSocket

```typescript
// Connect
await dflow.ws.connect();

// Subscribe to specific markets
dflow.ws.subscribePrices(['BTCD-25DEC0313-T92749.99']);
dflow.ws.subscribeTrades(['BTCD-25DEC0313-T92749.99']);
dflow.ws.subscribeOrderbook(['BTCD-25DEC0313-T92749.99']);

// Subscribe to all
dflow.ws.subscribeAllPrices();
dflow.ws.subscribeAllTrades();
dflow.ws.subscribeAllOrderbook();

// Handle updates
const unsubPrice = dflow.ws.onPrice((update) => {
  console.log(`${update.ticker}: YES=${update.yesPrice} NO=${update.noPrice}`);
});

const unsubTrade = dflow.ws.onTrade((trade) => {
  console.log(`Trade: ${trade.side} @ ${trade.price}`);
});

const unsubBook = dflow.ws.onOrderbook((book) => {
  console.log(`Orderbook update for ${book.ticker}`);
});

// Connection events
dflow.ws.onError((error) => console.error('WS error:', error));
dflow.ws.onClose(() => console.log('WS closed'));

// Cleanup
unsubPrice();
dflow.ws.disconnect();
```

---

## Solana Helpers

### Transaction Management

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import {
  signAndSendTransaction,
  waitForConfirmation,
  signSendAndConfirm,
} from 'dflow-sdk';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const keypair = Keypair.fromSecretKey(/* your secret key */);

// Sign and send a transaction
const signature = await signAndSendTransaction(
  connection,
  order.transaction,
  keypair
);

// Wait for confirmation
const confirmation = await waitForConfirmation(connection, signature, 'confirmed');

// Or do both in one call
const result = await signSendAndConfirm(
  connection,
  swap.transaction,
  keypair,
  'confirmed'
);
```

### Position Management

```typescript
import {
  getTokenBalances,
  getUserPositions,
  isRedemptionEligible,
  calculateScalarPayout,
} from 'dflow-sdk';

// Get all token balances (TOKEN_2022)
const balances = await getTokenBalances(connection, keypair.publicKey);

// Get prediction market positions
const positions = await getUserPositions(
  connection,
  keypair.publicKey,
  dflow.markets
);

// Check if position is redeemable
for (const position of positions) {
  if (position.market && isRedemptionEligible(position.market, position.mint)) {
    console.log(`Position ${position.mint} is redeemable!`);

    // For scalar markets, calculate payout
    const payout = calculateScalarPayout(position.market, position.mint, position.balance);
  }
}
```

---

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

// Set API key after initialization
dflow.setApiKey('new-api-key');
```

### Development Endpoints

```typescript
import {
  DEV_METADATA_API_BASE_URL,
  DEV_TRADE_API_BASE_URL,
  DEV_WEBSOCKET_URL,
} from 'dflow-sdk';

const devClient = new DFlowClient({
  metadataBaseUrl: DEV_METADATA_API_BASE_URL,
  tradeBaseUrl: DEV_TRADE_API_BASE_URL,
});
```

---

## Constants

```typescript
import {
  // API URLs
  METADATA_API_BASE_URL,
  TRADE_API_BASE_URL,
  WEBSOCKET_URL,
  DEV_METADATA_API_BASE_URL,
  DEV_TRADE_API_BASE_URL,
  DEV_WEBSOCKET_URL,

  // Token mints
  USDC_MINT,
  SOL_MINT,

  // Trading defaults
  DEFAULT_SLIPPAGE_BPS,      // 50 (0.5%)
  OUTCOME_TOKEN_DECIMALS,    // 6

  // Limits
  MAX_BATCH_SIZE,            // 100
  MAX_FILTER_ADDRESSES,      // 200
} from 'dflow-sdk';
```

---

## Error Handling

```typescript
import { DFlowApiError } from 'dflow-sdk';

try {
  const market = await dflow.markets.getMarket('invalid-ticker');
} catch (error) {
  if (error instanceof DFlowApiError) {
    console.error(`API Error ${error.statusCode}: ${error.message}`);
    console.error('Response:', error.response);
  }
}
```

---

## End-to-End Example

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import {
  DFlowClient,
  USDC_MINT,
  signSendAndConfirm,
  getUserPositions,
} from 'dflow-sdk';

async function tradePredictionMarket() {
  const dflow = new DFlowClient();
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const keypair = Keypair.fromSecretKey(/* your key */);

  // 1. Find a market
  const events = await dflow.events.getEvents({ status: 'active', limit: 1 });
  const market = events.events[0].markets?.[0];

  if (!market) throw new Error('No market found');

  // 2. Get a quote
  const quote = await dflow.swap.getQuote({
    inputMint: USDC_MINT,
    outputMint: market.accounts.usdc.yesMint,
    amount: 1000000, // 1 USDC
  });

  console.log(`Buying YES tokens: ${quote.outAmount} for ${quote.inAmount} USDC`);

  // 3. Create and execute swap
  const swap = await dflow.swap.createSwap({
    inputMint: USDC_MINT,
    outputMint: market.accounts.usdc.yesMint,
    amount: 1000000,
    slippageBps: 50,
    userPublicKey: keypair.publicKey.toBase58(),
  });

  const result = await signSendAndConfirm(connection, swap.transaction, keypair);
  console.log(`Trade executed: ${result.signature}`);

  // 4. Check positions
  const positions = await getUserPositions(connection, keypair.publicKey, dflow.markets);
  console.log('Your positions:', positions);
}
```

---

## Resources

- [DFlow Documentation](https://pond.dflow.net)
- [Metadata API Reference](https://pond.dflow.net/prediction-market-metadata-api-reference/introduction)
- [Trade API Reference](https://pond.dflow.net/concepts/trade-api)

## License

MIT
