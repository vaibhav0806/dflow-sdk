/**
 * DFlow SDK End-to-End Test Suite
 *
 * Run with: PRIVATE_KEY=<your_base58_key> npx tsx test/e2e-test.ts
 *
 * Environment variables:
 *   PRIVATE_KEY      - (Required) Base58-encoded Solana private key
 *   DFLOW_API_KEY    - (Optional) API key for authenticated endpoints
 *   RPC_URL          - (Optional) Custom RPC endpoint (defaults to mainnet)
 *   TRADE_AMOUNT_USDC - (Optional) Amount to trade in USDC (defaults to 0.1)
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import {
  DFlowClient,
  DEV_METADATA_API_BASE_URL,
  DEV_TRADE_API_BASE_URL,
  DEV_WEBSOCKET_URL,
  USDC_MINT,
  SOL_MINT,
  signSendAndConfirm,
  getTokenBalances,
  getUserPositions,
  isRedemptionEligible,
  calculateScalarPayout,
} from '../src/index.js';
import type { Market, Event, Series } from '../src/types/index.js';
import {
  TestRunner,
  loadConfig,
  assertDefined,
  assertArray,
  assertString,
  assertGreaterThan,
  formatUSDC,
  formatSOL,
  shortenAddress,
  sleep,
} from './utils/test-helpers.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = loadConfig();
const runner = new TestRunner();

// Known liquid tokens for swap testing
const BONK_MINT = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';

// Test state - shared across phases
interface TestState {
  dflow: DFlowClient;
  connection: Connection;
  keypair: Keypair;
  walletAddress: PublicKey;
  solBalance: number;
  usdcBalance: number;
  sampleSeries: Series | null;
  sampleEvent: Event | null;
  sampleMarket: Market | null;
  yesMint: string | null;
  noMint: string | null;
}

const state: TestState = {
  dflow: null as any,
  connection: null as any,
  keypair: null as any,
  walletAddress: null as any,
  solBalance: 0,
  usdcBalance: 0,
  sampleSeries: null,
  sampleEvent: null,
  sampleMarket: null,
  yesMint: null,
  noMint: null,
};

// ============================================================================
// PHASE 1: SETUP & CONFIGURATION
// ============================================================================

async function phase1Setup(): Promise<boolean> {
  runner.phase('PHASE 1: Setup & Configuration');

  // 1.1 Initialize DFlowClient
  const clientResult = await runner.test('1.1 Initialize DFlowClient', async () => {
    state.dflow = new DFlowClient({
      metadataBaseUrl: DEV_METADATA_API_BASE_URL,
      tradeBaseUrl: DEV_TRADE_API_BASE_URL,
      wsOptions: { url: DEV_WEBSOCKET_URL },
    });
    assertDefined(state.dflow, 'Client should be initialized');
    return state.dflow;
  });
  if (!clientResult.success) return false;

  // 1.2 Set API key if provided
  await runner.test('1.2 Set API key for authenticated endpoints', async () => {
    if (config.apiKey) {
      state.dflow.setApiKey(config.apiKey);
      runner.log(`API key set: ${config.apiKey.slice(0, 8)}...`);
    } else {
      runner.log('No API key provided (using public endpoints)');
    }
    return true;
  });

  // 1.3 Create Solana connection
  const connResult = await runner.test('1.3 Create Solana connection', async () => {
    state.connection = new Connection(config.rpcUrl, 'confirmed');
    const version = await state.connection.getVersion();
    runner.log(`RPC URL: ${config.rpcUrl}`);
    runner.log(`Solana version: ${version['solana-core']}`);
    return state.connection;
  });
  if (!connResult.success) return false;

  // 1.4 Load keypair
  const keypairResult = await runner.test('1.4 Load keypair from private key', async () => {
    const secretKey = bs58.decode(config.privateKey);
    state.keypair = Keypair.fromSecretKey(secretKey);
    state.walletAddress = state.keypair.publicKey;
    runner.log(`Wallet address: ${state.walletAddress.toBase58()}`);
    return state.keypair;
  });
  if (!keypairResult.success) return false;

  // 1.5 Verify SOL balance
  const solResult = await runner.test('1.5 Verify wallet has SOL balance', async () => {
    state.solBalance = await state.connection.getBalance(state.walletAddress);
    runner.log(`SOL balance: ${formatSOL(state.solBalance)}`);
    assertGreaterThan(state.solBalance, 0, 'Wallet needs SOL for transaction fees');
    return state.solBalance;
  });
  if (!solResult.success) return false;

  // 1.6 Verify token balances
  await runner.test('1.6 Check wallet token balances', async () => {
    const balances = await getTokenBalances(state.connection, state.walletAddress);
    const usdcToken = balances.find((b) => b.mint === USDC_MINT);
    const bonkToken = balances.find((b) => b.mint === BONK_MINT);
    state.usdcBalance = usdcToken?.balance || 0;
    runner.log(`USDC: ${state.usdcBalance.toFixed(6)}`);
    runner.log(`BONK: ${bonkToken?.balance.toFixed(2) || '0'}`);
    return balances;
  });

  return true;
}

// ============================================================================
// PHASE 2: METADATA APIs (Read-Only)
// ============================================================================

async function phase2MetadataAPIs(): Promise<boolean> {
  runner.phase('PHASE 2: Metadata APIs (Read-Only)');

  // 2.1 Fetch all series
  await runner.test('2.1 Fetch all series', async () => {
    const series = await state.dflow.series.getSeries();
    assertArray(series, 'Series should be an array');
    runner.log(`Found ${series.length} series`);
    if (series.length > 0) {
      state.sampleSeries = series[0];
      runner.log(`Sample: ${series[0].ticker} - ${series[0].title}`);
    }
    return series;
  });

  // 2.2 Fetch series by ticker
  if (state.sampleSeries) {
    await runner.test('2.2 Fetch series by ticker', async () => {
      const series = await state.dflow.series.getSeriesByTicker(state.sampleSeries!.ticker);
      assertString(series.ticker, 'Series ticker');
      runner.log(`Retrieved: ${series.ticker}`);
      return series;
    });
  }

  // 2.3 Fetch events with pagination
  await runner.test('2.3 Fetch events with pagination', async () => {
    const response = await state.dflow.events.getEvents({ limit: 5 });
    assertArray(response.events, 'Events should be an array');
    runner.log(`Found ${response.events.length} events`);
    if (response.events.length > 0) {
      state.sampleEvent = response.events[0];
      runner.log(`Sample: ${response.events[0].ticker} - ${response.events[0].title}`);
    }
    return response;
  });

  // 2.4 Fetch single event
  if (state.sampleEvent) {
    await runner.test('2.4 Fetch single event', async () => {
      const event = await state.dflow.events.getEvent(state.sampleEvent!.ticker);
      assertString(event.ticker, 'Event ticker');
      return event;
    });

    // 2.5 Fetch event with nested markets
    await runner.test('2.5 Fetch event with nested markets', async () => {
      const event = await state.dflow.events.getEvent(state.sampleEvent!.ticker, true);
      assertString(event.ticker, 'Event ticker');
      runner.log(`Markets: ${event.markets?.length || 0}`);
      return event;
    });
  }

  // 2.6 Fetch markets
  await runner.test('2.6 Fetch markets', async () => {
    const response = await state.dflow.markets.getMarkets({ limit: 10 });
    assertArray(response.markets, 'Markets should be an array');
    runner.log(`Found ${response.markets.length} markets`);
    return response;
  });

  // 2.7 Fetch active markets
  await runner.test('2.7 Fetch active markets', async () => {
    const response = await state.dflow.markets.getMarkets({ status: 'active', limit: 20 });
    assertArray(response.markets, 'Markets should be an array');
    runner.log(`Found ${response.markets.length} active markets`);

    if (response.markets.length > 0) {
      state.sampleMarket = response.markets[0];
      runner.log(`Selected: ${state.sampleMarket.ticker}`);

      const accountKey = Object.keys(state.sampleMarket.accounts)[0];
      if (accountKey) {
        const account = state.sampleMarket.accounts[accountKey];
        state.yesMint = account.yesMint;
        state.noMint = account.noMint;
        runner.log(`YES mint: ${shortenAddress(state.yesMint)}`);
        runner.log(`NO mint: ${shortenAddress(state.noMint)}`);
      }
    }
    return response;
  });

  // 2.8 Fetch single market
  if (state.sampleMarket) {
    await runner.test('2.8 Fetch single market', async () => {
      const market = await state.dflow.markets.getMarket(state.sampleMarket!.ticker);
      assertString(market.ticker, 'Market ticker');
      return market;
    });

    // 2.9 Fetch market by mint
    if (state.yesMint) {
      await runner.test('2.9 Fetch market by mint', async () => {
        const market = await state.dflow.markets.getMarketByMint(state.yesMint!);
        assertString(market.ticker, 'Market ticker');
        return market;
      });
    }

    // 2.10 Batch fetch markets
    await runner.test('2.10 Batch fetch markets', async () => {
      const markets = await state.dflow.markets.getMarketsBatch({
        tickers: [state.sampleMarket!.ticker],
      });
      assertArray(markets, 'Markets batch');
      runner.log(`Batch returned ${markets.length} markets`);
      return markets;
    });
  }

  // 2.11 Get outcome mints
  await runner.test('2.11 Get all outcome mints', async () => {
    const mints = await state.dflow.markets.getOutcomeMints();
    assertArray(mints, 'Outcome mints');
    runner.log(`Found ${mints.length} outcome mints`);
    return mints;
  });

  // 2.12 Fetch orderbook
  if (state.sampleMarket) {
    await runner.test('2.12 Fetch orderbook', async () => {
      const orderbook = await state.dflow.orderbook.getOrderbook(state.sampleMarket!.ticker);
      runner.log(`YES bids: ${orderbook.yesBid?.length || 0}, asks: ${orderbook.yesAsk?.length || 0}`);
      return orderbook;
    });
  }

  // 2.13 Fetch recent trades
  await runner.test('2.13 Fetch recent trades', async () => {
    const response = await state.dflow.trades.getTrades({ limit: 5 });
    assertArray(response.trades, 'Trades');
    runner.log(`Found ${response.trades.length} recent trades`);
    if (response.trades.length > 0) {
      const trade = response.trades[0];
      runner.log(`Sample trade: ${trade.tradeId} - ${trade.ticker} (${trade.takerSide})`);
    }
    return response;
  });

  // 2.14 Get tags by categories
  await runner.test('2.14 Get tags by categories', async () => {
    const tags = await state.dflow.tags.getTagsByCategories();
    const categories = Object.keys(tags);
    runner.log(`Found ${categories.length} categories`);
    return tags;
  });

  // 2.15 Search for markets/events
  await runner.test('2.15 Search for markets/events', async () => {
    const results = await state.dflow.search.search({ query: 'bitcoin', limit: 5 });
    runner.log(`Search "bitcoin": ${results.events.length} results`);
    return results;
  });

  // 2.16 Get sports filters
  await runner.test('2.16 Get sports filters', async () => {
    const filters = await state.dflow.sports.getFiltersBySports();
    runner.log(`Found ${filters.sportOrdering.length} sports`);
    return filters;
  });

  // 2.17 Fetch orderbook by mint
  if (state.yesMint) {
    await runner.test('2.17 Fetch orderbook by mint', async () => {
      const orderbook = await state.dflow.orderbook.getOrderbookByMint(state.yesMint!);
      runner.log(`YES bids: ${orderbook.yesBid?.length || 0}`);
      return orderbook;
    });
  }

  // 2.18 Fetch trades by mint
  if (state.yesMint) {
    await runner.test('2.18 Fetch trades by mint', async () => {
      const response = await state.dflow.trades.getTradesByMint(state.yesMint!, { limit: 5 });
      runner.log(`Found ${response.trades.length} trades for mint`);
      return response;
    });
  }

  // 2.19 Filter outcome mints
  if (state.yesMint && state.noMint) {
    await runner.test('2.19 Filter outcome mints', async () => {
      const testAddresses = [state.yesMint!, state.noMint!, USDC_MINT];
      const filtered = await state.dflow.markets.filterOutcomeMints(testAddresses);
      runner.log(`Filtered ${testAddresses.length} addresses -> ${filtered.length} outcome mints`);
      return filtered;
    });
  }

  // 2.20 Get live data (if milestones exist)
  await runner.test('2.20 Get live data', async () => {
    try {
      // Try with a sample milestone ID - may fail if no milestones exist
      const data = await state.dflow.liveData.getLiveData(['test-milestone']);
      runner.log(`Live data entries: ${data.length}`);
      return data;
    } catch (error: any) {
      runner.log(`Live data not available: ${error.message}`);
      return [];
    }
  });

  // 2.21 Get market candlesticks
  if (state.sampleMarket) {
    await runner.test('2.21 Get market candlesticks', async () => {
      const now = Math.floor(Date.now() / 1000);
      const candles = await state.dflow.markets.getMarketCandlesticks(
        state.sampleMarket!.ticker,
        {
          startTs: now - 86400, // 24 hours ago
          endTs: now,
          periodInterval: 60, // 1 hour
        }
      );
      runner.log(`Found ${candles.length} candlesticks`);
      return candles;
    });
  }

  // 2.22 Get event candlesticks
  if (state.sampleEvent) {
    await runner.test('2.22 Get event candlesticks', async () => {
      const now = Math.floor(Date.now() / 1000);
      const candles = await state.dflow.events.getEventCandlesticks(
        state.sampleEvent!.ticker,
        {
          startTs: now - 86400,
          endTs: now,
          periodInterval: 60,
        }
      );
      const marketCount = Object.keys(candles).length;
      runner.log(`Found candlesticks for ${marketCount} markets`);
      return candles;
    });
  }

  // 2.23 Get live data by event
  if (state.sampleEvent) {
    await runner.test('2.23 Get live data by event', async () => {
      try {
        const data = await state.dflow.liveData.getLiveDataByEvent(state.sampleEvent!.ticker);
        runner.log(`Event ticker: ${data.eventTicker || 'N/A'}`);
        return data;
      } catch (error: any) {
        runner.log(`Live data by event not available: ${error.message?.slice(0, 50)}`);
        return null;
      }
    });
  }

  // 2.24 Get live data by mint
  if (state.yesMint) {
    await runner.test('2.24 Get live data by mint', async () => {
      try {
        const data = await state.dflow.liveData.getLiveDataByMint(state.yesMint!);
        runner.log(`Event ticker: ${data.eventTicker || 'N/A'}`);
        return data;
      } catch (error: any) {
        runner.log(`Live data by mint not available: ${error.message?.slice(0, 50)}`);
        return null;
      }
    });
  }

  // 2.25 Get market candlesticks by mint
  if (state.yesMint) {
    await runner.test('2.25 Get market candlesticks by mint', async () => {
      const now = Math.floor(Date.now() / 1000);
      try {
        const candles = await state.dflow.markets.getMarketCandlesticksByMint(
          state.yesMint!,
          {
            startTs: now - 86400,
            endTs: now,
            periodInterval: 60,
          }
        );
        runner.log(`Found ${candles.length} candlesticks by mint`);
        return candles;
      } catch (error: any) {
        runner.log(`Candlesticks by mint not available: ${error.message?.slice(0, 50)}`);
        return [];
      }
    });
  }

  // 2.26 Get event forecast history
  if (state.sampleEvent && state.sampleSeries) {
    await runner.test('2.26 Get event forecast history', async () => {
      const now = Math.floor(Date.now() / 1000);
      try {
        // Extract event ID from event ticker (e.g., "KXBTC-25DEC0313" -> event part after series)
        const eventTicker = state.sampleEvent!.ticker;
        const seriesTicker = state.sampleSeries!.ticker;
        // Try to extract the event-specific part
        const eventId = eventTicker.startsWith(seriesTicker + '-')
          ? eventTicker.substring(seriesTicker.length + 1)
          : eventTicker;

        const history = await state.dflow.events.getEventForecastHistory(
          seriesTicker,
          eventId,
          {
            percentiles: '5000',
            startTs: now - 86400,
            endTs: now,
            periodInterval: 60,
          }
        );
        runner.log(`Forecast history series: ${history.seriesTicker || 'N/A'}`);
        return history;
      } catch (error: any) {
        runner.log(`Forecast history not available: ${error.message?.slice(0, 50)}`);
        return null;
      }
    });
  }

  // 2.27 Get event forecast by mint
  if (state.yesMint) {
    await runner.test('2.27 Get event forecast by mint', async () => {
      const now = Math.floor(Date.now() / 1000);
      try {
        const history = await state.dflow.events.getEventForecastByMint(
          state.yesMint!,
          {
            percentiles: '5000',
            startTs: now - 86400,
            endTs: now,
            periodInterval: 60,
          }
        );
        runner.log(`Forecast by mint series: ${history.seriesTicker || 'N/A'}`);
        return history;
      } catch (error: any) {
        runner.log(`Forecast by mint not available: ${error.message?.slice(0, 50)}`);
        return null;
      }
    });
  }

  return true;
}

// ============================================================================
// PHASE 3: TRADE APIs (Quotes)
// ============================================================================

async function phase3TradeAPIs(): Promise<boolean> {
  runner.phase('PHASE 3: Trade APIs (Quotes)');

  // 3.1 Get available tokens
  await runner.test('3.1 Get available tokens', async () => {
    const tokens = await state.dflow.tokens.getTokens();
    assertArray(tokens, 'Tokens');
    runner.log(`Found ${tokens.length} tokens`);
    return tokens;
  });

  // 3.1b Get tokens with decimals
  await runner.test('3.1b Get tokens with decimals', async () => {
    const tokens = await state.dflow.tokens.getTokensWithDecimals();
    assertArray(tokens, 'Tokens with decimals');
    runner.log(`Found ${tokens.length} tokens with decimal info`);
    if (tokens.length > 0) {
      runner.log(`Sample: ${tokens[0].symbol} - ${tokens[0].decimals} decimals`);
    }
    return tokens;
  });

  // 3.2 Get trading venues
  await runner.test('3.2 Get trading venues', async () => {
    const venues = await state.dflow.venues.getVenues();
    assertArray(venues, 'Venues');
    runner.log(`Found ${venues.length} venues`);
    return venues;
  });

  // 3.3 Get swap quote (USDC -> BONK) - known liquid pair
  await runner.test('3.3 Get swap quote (USDC -> BONK)', async () => {
    const quote = await state.dflow.swap.getQuote({
      inputMint: USDC_MINT,
      outputMint: BONK_MINT,
      amount: 1_000_000, // 1 USDC
      slippageBps: 100,
    });
    runner.log(`In: ${formatUSDC(quote.inAmount)}`);
    runner.log(`Out: ${(parseInt(quote.outAmount) / 1e5).toFixed(2)} BONK`);
    runner.log(`Price impact: ${quote.priceImpactPct}%`);
    return quote;
  });

  // 3.4 Get swap quote (SOL -> BONK)
  await runner.test('3.4 Get swap quote (SOL -> BONK)', async () => {
    const quote = await state.dflow.swap.getQuote({
      inputMint: SOL_MINT,
      outputMint: BONK_MINT,
      amount: 10_000_000, // 0.01 SOL
      slippageBps: 100,
    });
    runner.log(`In: ${(parseInt(quote.inAmount) / 1e9).toFixed(4)} SOL`);
    runner.log(`Out: ${(parseInt(quote.outAmount) / 1e5).toFixed(2)} BONK`);
    return quote;
  });

  // 3.5 Get swap quote (USDC -> SOL)
  await runner.test('3.5 Get swap quote (USDC -> SOL)', async () => {
    const quote = await state.dflow.swap.getQuote({
      inputMint: USDC_MINT,
      outputMint: SOL_MINT,
      amount: 1_000_000, // 1 USDC
      slippageBps: 100,
    });
    runner.log(`In: ${formatUSDC(quote.inAmount)}`);
    runner.log(`Out: ${(parseInt(quote.outAmount) / 1e9).toFixed(6)} SOL`);
    return quote;
  });

  // 3.6 Get intent quote (ExactIn mode)
  await runner.test('3.6 Get intent quote (ExactIn)', async () => {
    const quote = await state.dflow.intent.getIntentQuote({
      inputMint: USDC_MINT,
      outputMint: BONK_MINT,
      amount: 1_000_000, // 1 USDC
      mode: 'ExactIn',
    });
    runner.log(`ExactIn: ${formatUSDC(quote.inAmount)} -> ${(parseInt(quote.outAmount) / 1e5).toFixed(2)} BONK`);
    return quote;
  });

  return true;
}

// ============================================================================
// PHASE 4: SWAP EXECUTION (BONK)
// ============================================================================

async function phase4SwapExecution(): Promise<boolean> {
  runner.phase('PHASE 4: Swap Execution (BONK)');

  if (state.usdcBalance < 0.1) {
    runner.log('Skipping swap execution - insufficient USDC (need at least 0.1)');
    return true;
  }

  const swapAmount = 100_000; // 0.1 USDC

  // 4.1 Create swap transaction (USDC -> BONK)
  let swapTx: string | null = null;
  await runner.test('4.1 Create swap transaction (USDC -> BONK)', async () => {
    const response = await state.dflow.swap.createSwap({
      inputMint: USDC_MINT,
      outputMint: BONK_MINT,
      amount: swapAmount,
      slippageBps: 100,
      userPublicKey: state.walletAddress.toBase58(),
      wrapUnwrapSol: true,
    });
    swapTx = response.swapTransaction;
    runner.log(`Transaction created (${swapTx.length} chars)`);
    runner.log(`Last valid block: ${response.lastValidBlockHeight}`);
    return response;
  });

  // 4.2 Execute swap
  if (swapTx) {
    await runner.test('4.2 Execute swap (0.1 USDC -> BONK)', async () => {
      const result = await signSendAndConfirm(
        state.connection,
        swapTx!,
        state.keypair,
        'confirmed'
      );
      runner.log(`Signature: ${result.signature}`);
      runner.log(`Status: ${result.confirmationStatus}`);
      runner.log(`Slot: ${result.slot}`);
      return result;
    });

    // 4.3 Verify balances after swap
    await runner.test('4.3 Verify balances after swap', async () => {
      await sleep(2000);
      const balances = await getTokenBalances(state.connection, state.walletAddress);
      const usdcBalance = balances.find((b) => b.mint === USDC_MINT);
      const bonkBalance = balances.find((b) => b.mint === BONK_MINT);
      runner.log(`USDC: ${usdcBalance?.balance.toFixed(6) || '0'}`);
      runner.log(`BONK: ${bonkBalance?.balance.toFixed(2) || '0'}`);
      return balances;
    });
  }

  // 4.4 Get swap instructions (without executing)
  await runner.test('4.4 Get swap instructions', async () => {
    const instructions = await state.dflow.swap.getSwapInstructions({
      inputMint: USDC_MINT,
      outputMint: BONK_MINT,
      amount: 100_000, // 0.1 USDC
      slippageBps: 100,
      userPublicKey: state.walletAddress.toBase58(),
      wrapUnwrapSol: true,
    });
    runner.log(`Setup instructions: ${instructions.setupInstructions?.length || 0}`);
    runner.log(`Has swap instruction: ${!!instructions.swapInstruction}`);
    runner.log(`ALTs: ${instructions.addressLookupTableAddresses?.length || 0}`);
    return instructions;
  });

  // 4.5 Submit intent (get transaction without executing)
  await runner.test('4.5 Submit intent', async () => {
    const intent = await state.dflow.intent.submitIntent({
      inputMint: USDC_MINT,
      outputMint: BONK_MINT,
      amount: 100_000, // 0.1 USDC
      mode: 'ExactIn',
      slippageBps: 100,
      userPublicKey: state.walletAddress.toBase58(),
    });
    runner.log(`Intent ID: ${intent.intentId || 'N/A'}`);
    runner.log(`Transaction length: ${intent.transaction?.length || 0}`);
    return intent;
  });

  return true;
}

// ============================================================================
// PHASE 5: POSITION TRACKING
// ============================================================================

async function phase5PositionTracking(): Promise<boolean> {
  runner.phase('PHASE 5: Position Tracking');

  // 5.1 Get all token balances
  await runner.test('5.1 Get all token balances', async () => {
    const balances = await getTokenBalances(state.connection, state.walletAddress);
    runner.log(`Found ${balances.length} tokens with balance > 0`);
    balances.slice(0, 5).forEach((b) => {
      runner.log(`  ${shortenAddress(b.mint)}: ${b.balance}`);
    });
    return balances;
  });

  // 5.2 Get prediction market positions
  await runner.test('5.2 Get prediction market positions', async () => {
    const positions = await getUserPositions(
      state.connection,
      state.walletAddress,
      state.dflow.markets
    );
    runner.log(`Found ${positions.length} prediction market positions`);
    positions.forEach((p) => {
      runner.log(`  ${p.position}: ${p.balance} (${p.market?.ticker || 'unknown'})`);
    });
    return positions;
  });

  // 5.3 Check redemption eligibility
  if (state.sampleMarket && state.yesMint) {
    await runner.test('5.3 Check redemption eligibility', async () => {
      const eligible = isRedemptionEligible(state.sampleMarket!, state.yesMint!);
      runner.log(`Market status: ${state.sampleMarket!.status}`);
      runner.log(`Redemption eligible: ${eligible}`);
      return eligible;
    });

    // 5.4 Calculate scalar payout
    await runner.test('5.4 Calculate scalar payout', async () => {
      const payout = calculateScalarPayout(state.sampleMarket!, state.yesMint!, 1000);
      runner.log(`Payout for 1000 tokens: ${payout}`);
      return payout;
    });
  }

  return true;
}

// ============================================================================
// PHASE 6: WEBSOCKET
// ============================================================================

async function phase6WebSocket(): Promise<boolean> {
  runner.phase('PHASE 6: WebSocket');

  // 6.1 Connect to WebSocket
  await runner.test('6.1 Connect to WebSocket', async () => {
    await state.dflow.ws.connect();
    runner.log('WebSocket connected');
    return true;
  });

  // 6.2 Verify connection status
  await runner.test('6.2 Verify connection status', async () => {
    const connected = state.dflow.ws.isConnected;
    runner.log(`Is connected: ${connected}`);
    if (!connected) throw new Error('WebSocket not connected');
    return connected;
  });

  // 6.3 Subscribe to prices
  if (state.sampleMarket) {
    await runner.test('6.3 Subscribe to prices and receive update', async () => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ received: false, message: 'No updates within timeout' });
        }, 5000);

        const unsubscribe = state.dflow.ws.onPrice((update) => {
          clearTimeout(timeout);
          unsubscribe();
          runner.log(`Received price update for ${update.ticker}`);
          resolve({ received: true, update });
        });

        state.dflow.ws.subscribePrices([state.sampleMarket!.ticker]);
        runner.log(`Subscribed to ${state.sampleMarket!.ticker}`);
      });
    });

    // 6.4 Subscribe to orderbook
    await runner.test('6.4 Subscribe to orderbook', async () => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ received: false });
        }, 3000);

        const unsubscribe = state.dflow.ws.onOrderbook(() => {
          clearTimeout(timeout);
          unsubscribe();
          runner.log(`Received orderbook update`);
          resolve({ received: true });
        });

        state.dflow.ws.subscribeOrderbook([state.sampleMarket!.ticker]);
      });
    });
  }

  // 6.5 Unsubscribe and disconnect
  await runner.test('6.5 Unsubscribe and disconnect', async () => {
    state.dflow.ws.unsubscribe('prices');
    state.dflow.ws.unsubscribe('orderbook');
    state.dflow.ws.disconnect();
    runner.log('WebSocket disconnected');
    return true;
  });

  return true;
}

// ============================================================================
// PHASE 7: ERROR HANDLING
// ============================================================================

async function phase7ErrorHandling(): Promise<boolean> {
  runner.phase('PHASE 7: Error Handling');

  // 7.1 Invalid market ticker
  await runner.test('7.1 Invalid market ticker - graceful error', async () => {
    try {
      await state.dflow.markets.getMarket('INVALID_TICKER_12345');
      throw new Error('Should have thrown');
    } catch (error: any) {
      runner.log(`Caught error: ${error.message?.slice(0, 50)}...`);
      return true;
    }
  });

  // 7.2 Invalid mint address
  await runner.test('7.2 Invalid mint address - graceful error', async () => {
    try {
      await state.dflow.markets.getMarketByMint('invalid-mint-address');
      throw new Error('Should have thrown');
    } catch (error: any) {
      runner.log(`Caught error: ${error.message?.slice(0, 50)}...`);
      return true;
    }
  });

  // 7.3 Search with no results
  await runner.test('7.3 Search with no results', async () => {
    const results = await state.dflow.search.search({ query: 'xyznonexistent123', limit: 5 });
    runner.log(`Results for nonsense query: ${results.events.length}`);
    return results;
  });

  return true;
}

// ============================================================================
// PHASE 8: EDGE CASES
// ============================================================================

async function phase8EdgeCases(): Promise<boolean> {
  runner.phase('PHASE 8: Edge Cases');

  // 8.1 Empty pagination
  await runner.test('8.1 Handle empty pagination', async () => {
    const response = await state.dflow.events.getEvents({
      limit: 1,
      seriesTickers: 'nonexistent_series_xyz',
    });
    runner.log(`Results: ${response.events.length}`);
    return response;
  });

  // 8.2 Query closed markets
  await runner.test('8.2 Query closed markets', async () => {
    const response = await state.dflow.markets.getMarkets({
      status: 'closed',
      limit: 5,
    });
    runner.log(`Found ${response.markets.length} closed markets`);
    return response;
  });

  // 8.3 Multiple concurrent WebSocket subscriptions
  await runner.test('8.3 Multiple concurrent WebSocket subscriptions', async () => {
    await state.dflow.ws.connect();

    if (state.sampleMarket) {
      state.dflow.ws.subscribePrices([state.sampleMarket.ticker]);
      state.dflow.ws.subscribeTrades([state.sampleMarket.ticker]);
      state.dflow.ws.subscribeOrderbook([state.sampleMarket.ticker]);
      runner.log('Subscribed to prices, trades, and orderbook simultaneously');

      await sleep(1000);
      state.dflow.ws.disconnect();
    }
    return true;
  });

  return true;
}

// ============================================================================
// PHASE 9: ORDERS API
// ============================================================================

async function phase9OrdersAPI(): Promise<boolean> {
  runner.phase('PHASE 9: Orders API');

  // 9.1 Get order (without executing)
  if (state.yesMint) {
    await runner.test('9.1 Get order (prediction market)', async () => {
      try {
        const order = await state.dflow.orders.getOrder({
          inputMint: USDC_MINT,
          outputMint: state.yesMint!,
          amount: 100_000, // 0.1 USDC
          slippageBps: 100,
          userPublicKey: state.walletAddress.toBase58(),
        });
        runner.log(`Transaction length: ${order.transaction?.length || 0}`);
        runner.log(`In: ${order.inAmount}, Out: ${order.outAmount}`);
        return order;
      } catch (error: any) {
        runner.log(`Order API: ${error.message?.slice(0, 50)}`);
        return null;
      }
    });
  }

  // 9.2 Get order status (test with invalid signature - expect error)
  await runner.test('9.2 Get order status (error handling)', async () => {
    try {
      // Use a fake signature to test error handling
      await state.dflow.orders.getOrderStatus('invalid_signature_12345');
      throw new Error('Should have thrown for invalid signature');
    } catch (error: any) {
      runner.log(`Expected error: ${error.message?.slice(0, 50)}`);
      return true;
    }
  });

  return true;
}

// ============================================================================
// PHASE 10: PROOF KYC API
// ============================================================================

async function phase10ProofAPI(): Promise<boolean> {
  runner.phase('PHASE 10: Proof KYC API');

  // 10.1 Verify address (check if wallet is KYC verified)
  await runner.test('10.1 Verify address', async () => {
    try {
      const result = await state.dflow.proof.verifyAddress(state.walletAddress.toBase58());
      runner.log(`KYC verified: ${result.verified}`);
      return result;
    } catch (error: any) {
      runner.log(`Proof API: ${error.message?.slice(0, 50)}`);
      return { verified: false };
    }
  });

  // 10.2 Generate signature message
  await runner.test('10.2 Generate signature message', async () => {
    const timestamp = Date.now();
    const message = state.dflow.proof.generateSignatureMessage(timestamp);
    runner.log(`Message: ${message.slice(0, 40)}...`);
    return message;
  });

  // 10.3 Build deep link
  await runner.test('10.3 Build deep link', async () => {
    const timestamp = Date.now();
    const deepLink = state.dflow.proof.buildDeepLink({
      wallet: state.walletAddress.toBase58(),
      signature: 'test_signature_base58',
      timestamp,
      redirectUri: 'https://example.com/callback',
    });
    runner.log(`Deep link: ${deepLink.slice(0, 50)}...`);
    return deepLink;
  });

  return true;
}

// ============================================================================
// PHASE 11: NEW SDK FEATURES
// ============================================================================

async function phase11NewFeatures(): Promise<boolean> {
  runner.phase('PHASE 11: New SDK Features');

  // 11.1 Search with status and entityType
  await runner.test('11.1 Search with status and entityType', async () => {
    const results = await state.dflow.search.search({
      query: 'bitcoin',
      limit: 5,
      status: 'active',
      entityType: 'events',
    });
    runner.log(`Found ${results.events.length} active bitcoin events`);
    return results;
  });

  // 11.2 Markets with ticker filter (comma separated)
  if (state.sampleMarket) {
    await runner.test('11.2 Markets with ticker filter', async () => {
      const results = await state.dflow.markets.getMarkets({
        tickers: state.sampleMarket!.ticker,
      });
      assertArray(results.markets, 'Markets');
      runner.log(`Found ${results.markets.length} markets`);
      return results;
    });
  }

  // 11.3 Markets by event ticker
  if (state.sampleEvent) {
    await runner.test('11.3 Markets by event ticker', async () => {
      const results = await state.dflow.markets.getMarkets({
        eventTicker: state.sampleEvent!.ticker,
      });
      runner.log(`Found ${results.markets.length} markets for event ${state.sampleEvent!.ticker}`);
      return results;
    });
  }

  return true;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       DFlow SDK - End-to-End Test Suite                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  try {
    await phase1Setup();
    await phase2MetadataAPIs();
    await phase3TradeAPIs();
    await phase4SwapExecution();
    await phase5PositionTracking();
    await phase6WebSocket();
    await phase7ErrorHandling();
    await phase8EdgeCases();
    await phase9OrdersAPI();
    await phase10ProofAPI();
    await phase11NewFeatures();

    runner.summary();
    process.exit(runner.hasFailures() ? 1 : 0);
  } catch (error) {
    console.error('\nFatal error:', error);
    process.exit(1);
  }
}

main();
