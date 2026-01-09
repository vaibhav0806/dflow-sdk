# DFlow SDK

[![npm](https://img.shields.io/npm/v/dflow-sdk)](https://www.npmjs.com/package/dflow-sdk)
[![PyPI](https://img.shields.io/pypi/v/dflow-sdk)](https://pypi.org/project/dflow-sdk/)
[![Documentation](https://img.shields.io/badge/docs-dflow--sdk.vercel.app-blue)](https://dflow-sdk.vercel.app)

Unified SDK for DFlow on Solana - prediction markets and trading.

**Available in both TypeScript and Python!**

---

## Installation

### TypeScript / JavaScript

```bash
pnpm add dflow-sdk
# or
npm install dflow-sdk
# or
bun install dflow-sdk
```

### Python

```bash
pip install dflow-sdk
# or
poetry add dflow-sdk
# or
uv add dflow-sdk
```

---

## Quick Start

### TypeScript

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

### Python

```python
from dflow import DFlowClient

dflow = DFlowClient(
    api_key="your-api-key",  # optional, for higher rate limits
)

# Discover markets
events = dflow.events.get_events(status="active")
market = dflow.markets.get_market("BTCD-25DEC0313-T92749.99")

# Get a quote and trade
quote = dflow.swap.get_quote(
    input_mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
    output_mint=market.accounts["usdc"].yes_mint,
    amount=1_000_000,  # 1 USDC
)
```

---

## Features

- **Prediction Markets API**: Events, Markets, Orderbook, Trades, Live Data, Series, Tags, Sports, Search
- **Trade API**: Orders, Swaps, Intents, Market Initialization, Tokens, Venues
- **Real-time WebSocket**: Subscribe to price updates, trades, and orderbook changes
- **Solana Helpers**: Transaction signing, position tracking, redemption utilities

---

## Prediction Markets API

### Events

<details>
<summary><strong>TypeScript</strong></summary>

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

</details>

<details>
<summary><strong>Python</strong></summary>

```python
# Get single event
event = dflow.events.get_event("event-id")
event_with_markets = dflow.events.get_event("event-id", with_nested_markets=True)

# List events
events = dflow.events.get_events(
    status="active",
    limit=50,
    series_ticker="KXBTC",
)

# Forecast history
forecast = dflow.events.get_event_forecast_history("series-ticker", "event-id")
forecast_by_mint = dflow.events.get_event_forecast_by_mint("mint-address")

# Candlesticks
candles = dflow.events.get_event_candlesticks("event-ticker")
```

</details>

### Markets

<details>
<summary><strong>TypeScript</strong></summary>

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

</details>

<details>
<summary><strong>Python</strong></summary>

```python
# Get single market
market = dflow.markets.get_market("market-ticker")
market_by_mint = dflow.markets.get_market_by_mint("mint-address")

# List markets
markets = dflow.markets.get_markets(
    status="active",
    event_ticker="event-ticker",
)

# Batch queries (max 100 items)
batch = dflow.markets.get_markets_batch(
    tickers=["ticker1", "ticker2"],
    mints=["mint1", "mint2"],
)

# Outcome mints
all_mints = dflow.markets.get_outcome_mints()
filtered_mints = dflow.markets.filter_outcome_mints(["address1", "address2"])

# Candlesticks
candles = dflow.markets.get_market_candlesticks("market-ticker")
candles_by_mint = dflow.markets.get_market_candlesticks_by_mint("mint-address")
```

</details>

### Orderbook

<details>
<summary><strong>TypeScript</strong></summary>

```typescript
const orderbook = await dflow.orderbook.getOrderbook('market-ticker');
const orderbookByMint = await dflow.orderbook.getOrderbookByMint('mint-address');

// Orderbook structure
// { yesAsk, yesBid, noAsk, noBid } - each with price and quantity
```

</details>

<details>
<summary><strong>Python</strong></summary>

```python
orderbook = dflow.orderbook.get_orderbook("market-ticker")
orderbook_by_mint = dflow.orderbook.get_orderbook_by_mint("mint-address")

# Orderbook structure
# yes_ask, yes_bid, no_ask, no_bid - each with price and quantity
```

</details>

### Trades

<details>
<summary><strong>TypeScript</strong></summary>

```typescript
const trades = await dflow.trades.getTrades({
  marketTicker: 'ticker',
  limit: 100,
});
const tradesByMint = await dflow.trades.getTradesByMint('mint-address');
```

</details>

<details>
<summary><strong>Python</strong></summary>

```python
trades = dflow.trades.get_trades(
    market_ticker="ticker",
    limit=100,
)
trades_by_mint = dflow.trades.get_trades_by_mint("mint-address")
```

</details>

### Live Data

<details>
<summary><strong>TypeScript</strong></summary>

```typescript
const liveData = await dflow.liveData.getLiveData(['milestone1', 'milestone2']);
const liveByEvent = await dflow.liveData.getLiveDataByEvent('event-ticker');
const liveByMint = await dflow.liveData.getLiveDataByMint('mint-address');
```

</details>

<details>
<summary><strong>Python</strong></summary>

```python
live_data = dflow.live_data.get_live_data(["milestone1", "milestone2"])
live_by_event = dflow.live_data.get_live_data_by_event("event-ticker")
live_by_mint = dflow.live_data.get_live_data_by_mint("mint-address")
```

</details>

### Series, Tags, Sports & Search

<details>
<summary><strong>TypeScript</strong></summary>

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

</details>

<details>
<summary><strong>Python</strong></summary>

```python
# Series
all_series = dflow.series.get_series()
series = dflow.series.get_series_by_ticker("series-ticker")

# Tags & Sports
tags = dflow.tags.get_tags_by_categories()
sports = dflow.sports.get_filters_by_sports()

# Search
results = dflow.search.search("bitcoin")
```

</details>

---

## Trade API

### Orders

<details>
<summary><strong>TypeScript</strong></summary>

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

</details>

<details>
<summary><strong>Python</strong></summary>

```python
from dflow import USDC_MINT

# Get order quote and transaction
order = dflow.orders.get_order(
    input_mint=USDC_MINT,
    output_mint=market.accounts["usdc"].yes_mint,
    amount=1_000_000,  # 1 USDC (6 decimals)
    slippage_bps=50,
    user_public_key=str(wallet.pubkey()),
    platform_fee_bps=10,  # optional
    platform_fee_account="fee-account",  # optional
)

# Check order status (for async trades)
status = dflow.orders.get_order_status(signature)
# status: "open" | "closed" | "failed" | "pendingClose"
```

</details>

### Swaps (Imperative)

<details>
<summary><strong>TypeScript</strong></summary>

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

</details>

<details>
<summary><strong>Python</strong></summary>

```python
from dflow import PriorityFeeConfig

# Get quote
quote = dflow.swap.get_quote(
    input_mint=USDC_MINT,
    output_mint="yes-mint",
    amount=1_000_000,
    slippage_bps=50,
)

# Create swap transaction
swap = dflow.swap.create_swap(
    input_mint=USDC_MINT,
    output_mint="yes-mint",
    amount=1_000_000,
    slippage_bps=50,
    user_public_key=str(wallet.pubkey()),
    wrap_unwrap_sol=True,
    priority_fee=PriorityFeeConfig(type="exact", amount=10000),
)

# Get swap instructions (for custom composition)
instructions = dflow.swap.get_swap_instructions(
    input_mint=USDC_MINT,
    output_mint="yes-mint",
    amount=1_000_000,
    slippage_bps=50,
    user_public_key=str(wallet.pubkey()),
)
```

</details>

### Intents (Declarative)

<details>
<summary><strong>TypeScript</strong></summary>

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

</details>

<details>
<summary><strong>Python</strong></summary>

```python
# Get intent quote
intent_quote = dflow.intent.get_intent_quote(
    input_mint=USDC_MINT,
    output_mint="yes-mint",
    amount=1_000_000,
    mode="ExactIn",  # or "ExactOut"
)

# Submit intent
intent = dflow.intent.submit_intent(
    input_mint=USDC_MINT,
    output_mint="yes-mint",
    amount=1_000_000,
    mode="ExactIn",
    slippage_bps=50,
    user_public_key=str(wallet.pubkey()),
)
```

</details>

### Prediction Market Initialization

<details>
<summary><strong>TypeScript</strong></summary>

```typescript
// Initialize a new prediction market
const init = await dflow.predictionMarket.initializeMarket({
  marketTicker: 'MARKET-TICKER',
  userPublicKey: wallet.publicKey.toBase58(),
  settlementMint: USDC_MINT, // optional, defaults to USDC
});
// Returns: { transaction, yesMint, noMint }
```

</details>

<details>
<summary><strong>Python</strong></summary>

```python
# Initialize a new prediction market
init = dflow.prediction_market.initialize_market(
    market_ticker="MARKET-TICKER",
    user_public_key=str(wallet.pubkey()),
    settlement_mint=USDC_MINT,  # optional, defaults to USDC
)
# Returns: PredictionMarketInitResponse with transaction, yes_mint, no_mint
```

</details>

### Tokens & Venues

<details>
<summary><strong>TypeScript</strong></summary>

```typescript
// Get available tokens
const tokens = await dflow.tokens.getTokens();
const tokensWithDecimals = await dflow.tokens.getTokensWithDecimals();

// Get trading venues
const venues = await dflow.venues.getVenues();
```

</details>

<details>
<summary><strong>Python</strong></summary>

```python
# Get available tokens
tokens = dflow.tokens.get_tokens()
tokens_with_decimals = dflow.tokens.get_tokens_with_decimals()

# Get trading venues
venues = dflow.venues.get_venues()
```

</details>

---

## WebSocket

<details>
<summary><strong>TypeScript</strong></summary>

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

</details>

<details>
<summary><strong>Python</strong></summary>

```python
import asyncio

async def main():
    dflow = DFlowClient()

    # Connect
    await dflow.ws.connect()

    # Subscribe to specific markets
    await dflow.ws.subscribe_prices(["BTCD-25DEC0313-T92749.99"])
    await dflow.ws.subscribe_trades(["BTCD-25DEC0313-T92749.99"])
    await dflow.ws.subscribe_orderbook(["BTCD-25DEC0313-T92749.99"])

    # Subscribe to all
    await dflow.ws.subscribe_all_prices()
    await dflow.ws.subscribe_all_trades()
    await dflow.ws.subscribe_all_orderbook()

    # Handle updates
    def on_price(update):
        print(f"{update.ticker}: YES={update.yes_price} NO={update.no_price}")

    def on_trade(trade):
        print(f"Trade: {trade.side} @ {trade.price}")

    def on_orderbook(book):
        print(f"Orderbook update for {book.ticker}")

    unsub_price = dflow.ws.on_price(on_price)
    unsub_trade = dflow.ws.on_trade(on_trade)
    unsub_book = dflow.ws.on_orderbook(on_orderbook)

    # Connection events
    dflow.ws.on_error(lambda e: print(f"WS error: {e}"))
    dflow.ws.on_close(lambda: print("WS closed"))

    # Keep running
    await asyncio.sleep(60)

    # Cleanup
    unsub_price()
    dflow.ws.disconnect()

asyncio.run(main())
```

</details>

---

## Solana Helpers

### Transaction Management

<details>
<summary><strong>TypeScript</strong></summary>

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

</details>

<details>
<summary><strong>Python</strong></summary>

```python
from solana.rpc.api import Client
from solders.keypair import Keypair
from dflow import sign_and_send_transaction, wait_for_confirmation, sign_send_and_confirm

connection = Client("https://api.mainnet-beta.solana.com")
keypair = Keypair.from_bytes(your_secret_key)

# Sign and send a transaction
signature = sign_and_send_transaction(
    connection,
    order.transaction,
    keypair,
)

# Wait for confirmation
confirmation = wait_for_confirmation(connection, signature, "confirmed")

# Or do both in one call
result = sign_send_and_confirm(
    connection,
    swap.swap_transaction,
    keypair,
    "confirmed",
)
```

</details>

### Position Management

<details>
<summary><strong>TypeScript</strong></summary>

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

</details>

<details>
<summary><strong>Python</strong></summary>

```python
from solders.pubkey import Pubkey
from dflow import (
    get_token_balances,
    get_user_positions,
    is_redemption_eligible,
    calculate_scalar_payout,
)

# Get all token balances (TOKEN_2022)
balances = get_token_balances(connection, keypair.pubkey())

# Get prediction market positions
positions = get_user_positions(
    connection,
    keypair.pubkey(),
    dflow.markets,
)

# Check if position is redeemable
for position in positions:
    if position.market and is_redemption_eligible(position.market, position.mint):
        print(f"Position {position.mint} is redeemable!")

        # For scalar markets, calculate payout
        payout = calculate_scalar_payout(position.market, position.mint, position.balance)
```

</details>

---

## Configuration

### Environments

The SDK supports two environments:

| Environment | API Key Required | Description |
|-------------|------------------|-------------|
| `development` (default) | No | Uses `dev-*.dflow.net` endpoints. For testing with real capital against Kalshi. |
| `production` | Yes | Uses `*.dflow.net` endpoints. For production deployments. |

<details>
<summary><strong>TypeScript</strong></summary>

```typescript
// Development (default) - no API key required
const dflow = new DFlowClient();

// Or explicitly:
const dflow = new DFlowClient({ environment: 'development' });

// Production - API key required
const dflow = new DFlowClient({
  environment: 'production',
  apiKey: 'your-api-key',
});
```

</details>

<details>
<summary><strong>Python</strong></summary>

```python
# Development (default) - no API key required
dflow = DFlowClient()

# Or explicitly:
dflow = DFlowClient(environment="development")

# Production - API key required
dflow = DFlowClient(
    environment="production",
    api_key="your-api-key",
)
```

</details>

### Additional Options

<details>
<summary><strong>TypeScript</strong></summary>

```typescript
const dflow = new DFlowClient({
  environment: 'production',
  apiKey: 'your-api-key',
  wsOptions: {
    reconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  },
});

// Set API key after initialization
dflow.setApiKey('new-api-key');
```

</details>

<details>
<summary><strong>Python</strong></summary>

```python
dflow = DFlowClient(
    environment="production",
    api_key="your-api-key",
)

# Set API key after initialization
dflow.set_api_key("new-api-key")

# Use as context manager
with DFlowClient() as dflow:
    markets = dflow.markets.get_markets()
```

</details>

---

## Constants

<details>
<summary><strong>TypeScript</strong></summary>

```typescript
import {
  // API URLs (development - default)
  METADATA_API_BASE_URL,       // dev-prediction-markets-api.dflow.net
  TRADE_API_BASE_URL,          // dev-quote-api.dflow.net
  WEBSOCKET_URL,               // dev-prediction-markets-api.dflow.net/ws

  // API URLs (production - requires API key)
  PROD_METADATA_API_BASE_URL,  // prediction-markets-api.dflow.net
  PROD_TRADE_API_BASE_URL,     // quote-api.dflow.net
  PROD_WEBSOCKET_URL,          // prediction-markets-api.dflow.net/ws

  // Token mints
  USDC_MINT,
  SOL_MINT,

  // Trading defaults
  DEFAULT_SLIPPAGE_BPS,        // 50 (0.5%)
  OUTCOME_TOKEN_DECIMALS,      // 6

  // Limits
  MAX_BATCH_SIZE,              // 100
  MAX_FILTER_ADDRESSES,        // 200
} from 'dflow-sdk';
```

</details>

<details>
<summary><strong>Python</strong></summary>

```python
from dflow import (
    # API URLs (development - default)
    METADATA_API_BASE_URL,       # dev-prediction-markets-api.dflow.net
    TRADE_API_BASE_URL,          # dev-quote-api.dflow.net
    WEBSOCKET_URL,               # dev-prediction-markets-api.dflow.net/ws

    # API URLs (production - requires API key)
    PROD_METADATA_API_BASE_URL,  # prediction-markets-api.dflow.net
    PROD_TRADE_API_BASE_URL,     # quote-api.dflow.net
    PROD_WEBSOCKET_URL,          # prediction-markets-api.dflow.net/ws

    # Token mints
    USDC_MINT,
    SOL_MINT,

    # Trading defaults
    DEFAULT_SLIPPAGE_BPS,        # 50 (0.5%)
    OUTCOME_TOKEN_DECIMALS,      # 6

    # Limits
    MAX_BATCH_SIZE,              # 100
    MAX_FILTER_ADDRESSES,        # 200
)
```

</details>

---

## Error Handling

<details>
<summary><strong>TypeScript</strong></summary>

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

</details>

<details>
<summary><strong>Python</strong></summary>

```python
from dflow import DFlowApiError

try:
    market = dflow.markets.get_market("invalid-ticker")
except DFlowApiError as e:
    print(f"API Error {e.status_code}: {e}")
    print(f"Response: {e.response}")
```

</details>

---

## End-to-End Example

<details>
<summary><strong>TypeScript</strong></summary>

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

</details>

<details>
<summary><strong>Python</strong></summary>

```python
from solana.rpc.api import Client
from solders.keypair import Keypair
from dflow import (
    DFlowClient,
    USDC_MINT,
    sign_send_and_confirm,
    get_user_positions,
)

def trade_prediction_market():
    dflow = DFlowClient()
    connection = Client("https://api.mainnet-beta.solana.com")
    keypair = Keypair.from_bytes(your_secret_key)

    # 1. Find a market
    events = dflow.events.get_events(status="active", limit=1)
    market = events.events[0].markets[0] if events.events[0].markets else None

    if not market:
        raise ValueError("No market found")

    # 2. Get a quote
    quote = dflow.swap.get_quote(
        input_mint=USDC_MINT,
        output_mint=market.accounts["usdc"].yes_mint,
        amount=1_000_000,  # 1 USDC
    )

    print(f"Buying YES tokens: {quote.out_amount} for {quote.in_amount} USDC")

    # 3. Create and execute swap
    swap = dflow.swap.create_swap(
        input_mint=USDC_MINT,
        output_mint=market.accounts["usdc"].yes_mint,
        amount=1_000_000,
        slippage_bps=50,
        user_public_key=str(keypair.pubkey()),
    )

    result = sign_send_and_confirm(connection, swap.swap_transaction, keypair)
    print(f"Trade executed: {result.signature}")

    # 4. Check positions
    positions = get_user_positions(connection, keypair.pubkey(), dflow.markets)
    print("Your positions:", positions)

if __name__ == "__main__":
    trade_prediction_market()
```

</details>

---

## Resources

- [DFlow Documentation](https://pond.dflow.net)
- [Metadata API Reference](https://pond.dflow.net/prediction-market-metadata-api-reference/introduction)
- [Trade API Reference](https://pond.dflow.net/concepts/trade-api)

## License

MIT
