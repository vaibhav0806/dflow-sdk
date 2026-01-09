import { VersionedTransaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

// src/utils/http.ts
var DFlowApiError = class extends Error {
  /**
   * Create a new API error.
   *
   * @param message - Error message
   * @param statusCode - HTTP status code from the response
   * @param response - Parsed response body (if available)
   */
  constructor(message, statusCode, response) {
    super(message);
    this.statusCode = statusCode;
    this.response = response;
    this.name = "DFlowApiError";
  }
};
var HttpClient = class {
  baseUrl;
  apiKey;
  defaultHeaders;
  /**
   * Create a new HTTP client.
   *
   * @param options - Client configuration
   */
  constructor(options) {
    this.baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl : options.baseUrl + "/";
    this.apiKey = options.apiKey;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers
    };
  }
  getHeaders() {
    const headers = { ...this.defaultHeaders };
    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }
    return headers;
  }
  buildUrl(path, params) {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = new URL(cleanPath, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== void 0 && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }
  /**
   * Make a GET request.
   *
   * @param path - API endpoint path
   * @param params - Optional query parameters
   * @returns Parsed JSON response
   * @throws {@link DFlowApiError} if the request fails
   */
  async get(path, params) {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
  /**
   * Make a POST request.
   *
   * @param path - API endpoint path
   * @param body - Optional request body (will be JSON serialized)
   * @returns Parsed JSON response
   * @throws {@link DFlowApiError} if the request fails
   */
  async post(path, body) {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : void 0
    });
    return this.handleResponse(response);
  }
  async handleResponse(response) {
    const text = await response.text();
    if (!response.ok) {
      let errorBody;
      try {
        errorBody = JSON.parse(text);
      } catch {
        errorBody = text;
      }
      throw new DFlowApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorBody
      );
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new DFlowApiError(
        `Failed to parse response as JSON`,
        response.status,
        text
      );
    }
  }
  /**
   * Update the API key for subsequent requests.
   *
   * @param apiKey - New API key to use
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
};

// src/utils/constants.ts
var METADATA_API_BASE_URL = "https://dev-prediction-markets-api.dflow.net/api/v1";
var TRADE_API_BASE_URL = "https://dev-quote-api.dflow.net";
var WEBSOCKET_URL = "wss://dev-prediction-markets-api.dflow.net/api/v1/ws";
var PROD_METADATA_API_BASE_URL = "https://prediction-markets-api.dflow.net/api/v1";
var PROD_TRADE_API_BASE_URL = "https://quote-api.dflow.net";
var PROD_WEBSOCKET_URL = "wss://prediction-markets-api.dflow.net/api/v1/ws";
var USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
var SOL_MINT = "So11111111111111111111111111111111111111112";
var DEFAULT_SLIPPAGE_BPS = 50;
var OUTCOME_TOKEN_DECIMALS = 6;
var MAX_BATCH_SIZE = 100;
var MAX_FILTER_ADDRESSES = 200;

// src/api/metadata/events.ts
var EventsAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get a single event by its ID.
   *
   * @param eventId - The unique identifier of the event
   * @param withNestedMarkets - If true, includes all markets within the event
   * @returns The event data, optionally with nested markets
   *
   * @example
   * ```typescript
   * // Get event without markets
   * const event = await dflow.events.getEvent('BTCD-25DEC0313');
   *
   * // Get event with all its markets
   * const eventWithMarkets = await dflow.events.getEvent('BTCD-25DEC0313', true);
   * console.log(eventWithMarkets.markets); // Array of Market objects
   * ```
   */
  async getEvent(eventId, withNestedMarkets) {
    return this.http.get(`/event/${eventId}`, {
      withNestedMarkets
    });
  }
  /**
   * List events with optional filtering.
   *
   * @param params - Optional filter parameters
   * @param params.status - Filter by event status ('active', 'closed', etc.)
   * @param params.seriesTicker - Filter by series ticker (e.g., 'KXBTC')
   * @param params.limit - Maximum number of events to return
   * @param params.cursor - Pagination cursor from previous response
   * @returns Paginated list of events
   *
   * @example
   * ```typescript
   * // Get all active events
   * const { events, cursor } = await dflow.events.getEvents({ status: 'active' });
   *
   * // Get events for a specific series
   * const btcEvents = await dflow.events.getEvents({
   *   seriesTicker: 'KXBTC',
   *   limit: 50,
   * });
   *
   * // Paginate through results
   * const nextPage = await dflow.events.getEvents({ cursor });
   * ```
   */
  async getEvents(params) {
    return this.http.get("/events", params);
  }
  /**
   * Get forecast percentile history for an event.
   *
   * Returns historical forecast data showing how predictions have changed over time.
   *
   * @param seriesTicker - The series ticker (e.g., 'KXBTC')
   * @param eventId - The event identifier within the series
   * @returns Forecast history with percentile data points
   *
   * @example
   * ```typescript
   * const history = await dflow.events.getEventForecastHistory('KXBTC', 'event-123');
   * console.log(history.dataPoints); // Historical forecast values
   * ```
   */
  async getEventForecastHistory(seriesTicker, eventId) {
    return this.http.get(
      `/event/${seriesTicker}/${eventId}/forecast_percentile_history`
    );
  }
  /**
   * Get forecast percentile history for an event by its mint address.
   *
   * Alternative to {@link getEventForecastHistory} when you have the mint address
   * instead of series ticker and event ID.
   *
   * @param mintAddress - The Solana mint address of the event's outcome token
   * @returns Forecast history with percentile data points
   *
   * @example
   * ```typescript
   * const history = await dflow.events.getEventForecastByMint('EPjFWdd5...');
   * ```
   */
  async getEventForecastByMint(mintAddress) {
    return this.http.get(
      `/event/by-mint/${mintAddress}/forecast_percentile_history`
    );
  }
  /**
   * Get OHLCV candlestick data for an event.
   *
   * Returns price history in candlestick format for charting.
   *
   * @param ticker - The event ticker
   * @returns Array of candlestick data points
   *
   * @example
   * ```typescript
   * const candles = await dflow.events.getEventCandlesticks('BTCD-25DEC0313');
   * candles.forEach(c => {
   *   console.log(`Open: ${c.open}, High: ${c.high}, Low: ${c.low}, Close: ${c.close}`);
   * });
   * ```
   */
  async getEventCandlesticks(ticker) {
    const response = await this.http.get(
      `/event/${ticker}/candlesticks`
    );
    return response.candlesticks;
  }
};

// src/api/metadata/markets.ts
var MarketsAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get a single market by its ticker.
   *
   * @param marketId - The market ticker (e.g., 'BTCD-25DEC0313-T92749.99')
   * @returns Complete market data including prices, accounts, and status
   *
   * @example
   * ```typescript
   * const market = await dflow.markets.getMarket('BTCD-25DEC0313-T92749.99');
   * console.log(`YES: ${market.yesAsk}, NO: ${market.noAsk}`);
   * console.log(`Volume: ${market.volume}`);
   * ```
   */
  async getMarket(marketId) {
    return this.http.get(`/market/${marketId}`);
  }
  /**
   * Get a market by its outcome token mint address.
   *
   * Useful when you have a mint address from a wallet or transaction
   * and need to look up the associated market.
   *
   * @param mintAddress - The Solana mint address of a YES or NO token
   * @returns The market associated with the mint address
   *
   * @example
   * ```typescript
   * const market = await dflow.markets.getMarketByMint('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
   * ```
   */
  async getMarketByMint(mintAddress) {
    return this.http.get(`/market/by-mint/${mintAddress}`);
  }
  /**
   * List markets with optional filtering.
   *
   * @param params - Optional filter parameters
   * @param params.status - Filter by market status ('active', 'closed', etc.)
   * @param params.eventTicker - Filter by parent event ticker
   * @param params.limit - Maximum number of markets to return
   * @param params.cursor - Pagination cursor from previous response
   * @returns Paginated list of markets
   *
   * @example
   * ```typescript
   * // Get all active markets
   * const { markets, cursor } = await dflow.markets.getMarkets({ status: 'active' });
   *
   * // Get markets for a specific event
   * const eventMarkets = await dflow.markets.getMarkets({
   *   eventTicker: 'BTCD-25DEC0313',
   * });
   *
   * // Paginate through results
   * const nextPage = await dflow.markets.getMarkets({ cursor });
   * ```
   */
  async getMarkets(params) {
    return this.http.get("/markets", params);
  }
  /**
   * Batch query multiple markets by tickers and/or mint addresses.
   *
   * More efficient than multiple individual requests when you need
   * data for several markets at once.
   *
   * @param params - Batch query parameters
   * @param params.tickers - Array of market tickers to fetch
   * @param params.mints - Array of mint addresses to fetch
   * @returns Array of market data
   * @throws Error if total items exceed {@link MAX_BATCH_SIZE} (100)
   *
   * @example
   * ```typescript
   * const markets = await dflow.markets.getMarketsBatch({
   *   tickers: ['MARKET-1', 'MARKET-2', 'MARKET-3'],
   *   mints: ['mint-address-1'],
   * });
   * ```
   */
  async getMarketsBatch(params) {
    const totalItems = (params.tickers?.length ?? 0) + (params.mints?.length ?? 0);
    if (totalItems > MAX_BATCH_SIZE) {
      throw new Error(`Batch size exceeds maximum of ${MAX_BATCH_SIZE} items`);
    }
    const response = await this.http.post("/markets/batch", params);
    return response.markets;
  }
  /**
   * Get all outcome token mint addresses.
   *
   * Returns a list of all valid outcome token mints across all markets.
   * Useful for filtering wallet tokens to find prediction market positions.
   *
   * @returns Array of mint addresses
   *
   * @example
   * ```typescript
   * const allMints = await dflow.markets.getOutcomeMints();
   * console.log(`Total outcome tokens: ${allMints.length}`);
   * ```
   */
  async getOutcomeMints() {
    const response = await this.http.get("/outcome_mints");
    return response.mints;
  }
  /**
   * Filter a list of addresses to find which are outcome token mints.
   *
   * Given a list of token addresses (e.g., from a wallet), returns only
   * those that are prediction market outcome tokens.
   *
   * @param addresses - Array of Solana token addresses to check
   * @returns Array of addresses that are outcome token mints
   * @throws Error if addresses exceed {@link MAX_FILTER_ADDRESSES} (200)
   *
   * @example
   * ```typescript
   * // Get user's wallet tokens
   * const walletTokens = ['addr1', 'addr2', 'addr3', ...];
   *
   * // Filter to find prediction market tokens
   * const predictionTokens = await dflow.markets.filterOutcomeMints(walletTokens);
   * ```
   */
  async filterOutcomeMints(addresses) {
    if (addresses.length > MAX_FILTER_ADDRESSES) {
      throw new Error(`Address count exceeds maximum of ${MAX_FILTER_ADDRESSES}`);
    }
    const params = { addresses };
    const response = await this.http.post(
      "/filter_outcome_mints",
      params
    );
    return response.outcomeMints;
  }
  /**
   * Get OHLCV candlestick data for a market.
   *
   * Returns price history in candlestick format for charting.
   *
   * @param ticker - The market ticker
   * @returns Array of candlestick data points
   *
   * @example
   * ```typescript
   * const candles = await dflow.markets.getMarketCandlesticks('BTCD-25DEC0313-T92749.99');
   * candles.forEach(c => {
   *   console.log(`${c.timestamp}: O=${c.open} H=${c.high} L=${c.low} C=${c.close}`);
   * });
   * ```
   */
  async getMarketCandlesticks(ticker) {
    const response = await this.http.get(
      `/market/${ticker}/candlesticks`
    );
    return response.candlesticks;
  }
  /**
   * Get OHLCV candlestick data for a market by mint address.
   *
   * Alternative to {@link getMarketCandlesticks} when you have the mint address.
   *
   * @param mintAddress - The Solana mint address of the market's outcome token
   * @returns Array of candlestick data points
   *
   * @example
   * ```typescript
   * const candles = await dflow.markets.getMarketCandlesticksByMint('EPjFWdd5...');
   * ```
   */
  async getMarketCandlesticksByMint(mintAddress) {
    const response = await this.http.get(
      `/market/by-mint/${mintAddress}/candlesticks`
    );
    return response.candlesticks;
  }
};

// src/api/metadata/orderbook.ts
var OrderbookAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get the orderbook for a market by ticker.
   *
   * @param marketTicker - The market ticker
   * @returns Orderbook with YES/NO bid and ask prices and quantities
   *
   * @example
   * ```typescript
   * const orderbook = await dflow.orderbook.getOrderbook('BTCD-25DEC0313-T92749.99');
   * console.log(`YES: Bid ${orderbook.yesBid.price} / Ask ${orderbook.yesAsk.price}`);
   * console.log(`NO:  Bid ${orderbook.noBid.price} / Ask ${orderbook.noAsk.price}`);
   * ```
   */
  async getOrderbook(marketTicker) {
    return this.http.get(`/orderbook/${marketTicker}`);
  }
  /**
   * Get the orderbook for a market by mint address.
   *
   * Alternative to {@link getOrderbook} when you have the mint address.
   *
   * @param mintAddress - The Solana mint address of the market's outcome token
   * @returns Orderbook with YES/NO bid and ask prices and quantities
   *
   * @example
   * ```typescript
   * const orderbook = await dflow.orderbook.getOrderbookByMint('EPjFWdd5...');
   * ```
   */
  async getOrderbookByMint(mintAddress) {
    return this.http.get(`/orderbook/by-mint/${mintAddress}`);
  }
};

// src/api/metadata/trades.ts
var TradesAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get historical trades with optional filtering.
   *
   * @param params - Optional filter parameters
   * @param params.marketTicker - Filter by market ticker
   * @param params.limit - Maximum number of trades to return
   * @param params.cursor - Pagination cursor from previous response
   * @returns Paginated list of trades
   *
   * @example
   * ```typescript
   * // Get recent trades for a market
   * const { trades, cursor } = await dflow.trades.getTrades({
   *   marketTicker: 'BTCD-25DEC0313-T92749.99',
   *   limit: 100,
   * });
   *
   * // Paginate through results
   * const nextPage = await dflow.trades.getTrades({ cursor });
   * ```
   */
  async getTrades(params) {
    return this.http.get("/trades", params);
  }
  /**
   * Get trades for a market by mint address.
   *
   * Alternative to {@link getTrades} when you have the mint address.
   *
   * @param mintAddress - The Solana mint address of the market's outcome token
   * @param params - Optional filter parameters (excluding marketTicker)
   * @returns Paginated list of trades
   *
   * @example
   * ```typescript
   * const { trades } = await dflow.trades.getTradesByMint('EPjFWdd5...', {
   *   limit: 50,
   * });
   * ```
   */
  async getTradesByMint(mintAddress, params) {
    return this.http.get(`/trades/by-mint/${mintAddress}`, params);
  }
};

// src/api/metadata/liveData.ts
var LiveDataAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get live data for specific milestones.
   *
   * @param milestones - Array of milestone identifiers to fetch
   * @returns Array of live data for the requested milestones
   *
   * @example
   * ```typescript
   * const data = await dflow.liveData.getLiveData(['btc-price', 'eth-price']);
   * data.forEach(d => console.log(`${d.milestone}: ${d.value}`));
   * ```
   */
  async getLiveData(milestones) {
    const response = await this.http.get("/live_data", {
      milestones: milestones.join(",")
    });
    return response.data;
  }
  /**
   * Get live data for an event by its ticker.
   *
   * @param eventTicker - The event ticker
   * @returns Live data for the event
   *
   * @example
   * ```typescript
   * const data = await dflow.liveData.getLiveDataByEvent('BTCD-25DEC0313');
   * console.log(`Current value: ${data.value}`);
   * ```
   */
  async getLiveDataByEvent(eventTicker) {
    return this.http.get(`/live_data/by-event/${eventTicker}`);
  }
  /**
   * Get live data for a market by mint address.
   *
   * @param mintAddress - The Solana mint address of the market's outcome token
   * @returns Live data for the market
   *
   * @example
   * ```typescript
   * const data = await dflow.liveData.getLiveDataByMint('EPjFWdd5...');
   * ```
   */
  async getLiveDataByMint(mintAddress) {
    return this.http.get(`/live_data/by-mint/${mintAddress}`);
  }
};

// src/api/metadata/series.ts
var SeriesAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get all available series.
   *
   * @returns Array of all series
   *
   * @example
   * ```typescript
   * const series = await dflow.series.getSeries();
   * series.forEach(s => console.log(`${s.ticker}: ${s.name}`));
   * ```
   */
  async getSeries() {
    const response = await this.http.get("/series");
    return response.series;
  }
  /**
   * Get a specific series by its ticker.
   *
   * @param ticker - The series ticker (e.g., 'KXBTC', 'KXETH')
   * @returns The series data
   *
   * @example
   * ```typescript
   * const series = await dflow.series.getSeriesByTicker('KXBTC');
   * console.log(`${series.name}: ${series.description}`);
   * ```
   */
  async getSeriesByTicker(ticker) {
    return this.http.get(`/series/${ticker}`);
  }
};

// src/api/metadata/tags.ts
var TagsAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get all tags organized by category.
   *
   * @returns Tags grouped by their categories
   *
   * @example
   * ```typescript
   * const tags = await dflow.tags.getTagsByCategories();
   * Object.entries(tags).forEach(([category, tagList]) => {
   *   console.log(`${category}: ${tagList.join(', ')}`);
   * });
   * ```
   */
  async getTagsByCategories() {
    return this.http.get("/tags_by_categories");
  }
};

// src/api/metadata/sports.ts
var SportsAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get all available sports filters.
   *
   * @returns Sports filters including leagues, teams, and event types
   *
   * @example
   * ```typescript
   * const filters = await dflow.sports.getFiltersBySports();
   * filters.leagues.forEach(league => console.log(league.name));
   * ```
   */
  async getFiltersBySports() {
    return this.http.get("/filters_by_sports");
  }
};

// src/api/metadata/search.ts
var SearchAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Search for events and markets by keyword.
   *
   * @param params - Search parameters
   * @param params.query - The search query string
   * @param params.limit - Maximum number of results to return
   * @returns Search results containing matching events and markets
   *
   * @example
   * ```typescript
   * // Search for Bitcoin-related markets
   * const results = await dflow.search.search({ query: 'bitcoin', limit: 20 });
   *
   * results.events.forEach(event => {
   *   console.log(`Event: ${event.title}`);
   * });
   *
   * results.markets.forEach(market => {
   *   console.log(`Market: ${market.title}`);
   * });
   * ```
   */
  async search(params) {
    return this.http.get("/search", {
      q: params.query,
      limit: params.limit
    });
  }
};

// src/api/trade/orders.ts
var OrdersAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get an order quote and transaction for a trade.
   *
   * Returns a ready-to-sign transaction for swapping tokens.
   *
   * @param params - Order parameters
   * @param params.inputMint - The mint address of the token to sell (e.g., USDC)
   * @param params.outputMint - The mint address of the token to buy (e.g., YES token)
   * @param params.amount - The amount to trade in base units (e.g., 1000000 for 1 USDC)
   * @param params.slippageBps - Maximum slippage in basis points (e.g., 50 = 0.5%)
   * @param params.userPublicKey - The user's Solana wallet public key
   * @param params.platformFeeBps - Optional platform fee in basis points
   * @param params.platformFeeAccount - Optional account to receive platform fees
   * @returns Order response with transaction and quote details
   *
   * @example
   * ```typescript
   * import { USDC_MINT } from 'dflow-sdk';
   *
   * const order = await dflow.orders.getOrder({
   *   inputMint: USDC_MINT,
   *   outputMint: market.accounts.usdc.yesMint,
   *   amount: 1000000, // 1 USDC (6 decimals)
   *   slippageBps: 50, // 0.5% slippage
   *   userPublicKey: wallet.publicKey.toBase58(),
   * });
   *
   * console.log(`Input: ${order.inAmount}, Output: ${order.outAmount}`);
   * // Sign and send order.transaction
   * ```
   */
  async getOrder(params) {
    return this.http.get("/order", {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      slippageBps: params.slippageBps,
      userPublicKey: params.userPublicKey,
      platformFeeBps: params.platformFeeBps,
      platformFeeAccount: params.platformFeeAccount
    });
  }
  /**
   * Check the status of a submitted order.
   *
   * Use this to track async order completion or check if an order
   * was successfully executed.
   *
   * @param signature - The transaction signature from submitting the order
   * @returns Order status ('open', 'closed', 'failed', or 'pendingClose')
   *
   * @example
   * ```typescript
   * const status = await dflow.orders.getOrderStatus(signature);
   *
   * if (status.status === 'closed') {
   *   console.log('Order completed successfully!');
   * } else if (status.status === 'failed') {
   *   console.log('Order failed');
   * } else {
   *   console.log('Order still pending...');
   * }
   * ```
   */
  async getOrderStatus(signature) {
    return this.http.get("/order-status", { signature });
  }
};

// src/api/trade/swap.ts
var SwapAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get a quote for a swap without creating a transaction.
   *
   * Use this to preview trade amounts before committing. The quote
   * shows expected input/output amounts and price impact.
   *
   * @param params - Quote parameters
   * @param params.inputMint - The mint address of the token to sell
   * @param params.outputMint - The mint address of the token to buy
   * @param params.amount - The amount to trade in base units
   * @param params.slippageBps - Optional slippage tolerance in basis points
   * @returns Quote with expected amounts and route information
   *
   * @example
   * ```typescript
   * const quote = await dflow.swap.getQuote({
   *   inputMint: USDC_MINT,
   *   outputMint: market.accounts.usdc.yesMint,
   *   amount: 1000000, // 1 USDC
   *   slippageBps: 50,
   * });
   *
   * console.log(`Input: ${quote.inAmount}`);
   * console.log(`Output: ${quote.outAmount}`);
   * console.log(`Price impact: ${quote.priceImpactPct}%`);
   * ```
   */
  async getQuote(params) {
    return this.http.get("/quote", {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      slippageBps: params.slippageBps
    });
  }
  /**
   * Create a swap transaction ready for signing.
   *
   * Combines getting a quote and creating a transaction in one call.
   * Returns a base64-encoded transaction that can be signed and sent.
   *
   * @param params - Swap parameters
   * @param params.inputMint - The mint address of the token to sell
   * @param params.outputMint - The mint address of the token to buy
   * @param params.amount - The amount to trade in base units
   * @param params.slippageBps - Slippage tolerance in basis points
   * @param params.userPublicKey - The user's Solana wallet public key
   * @param params.wrapUnwrapSol - Whether to wrap/unwrap SOL automatically
   * @param params.priorityFee - Optional priority fee configuration
   * @returns Swap response with transaction and quote details
   *
   * @example
   * ```typescript
   * const swap = await dflow.swap.createSwap({
   *   inputMint: USDC_MINT,
   *   outputMint: market.accounts.usdc.yesMint,
   *   amount: 1000000,
   *   slippageBps: 50,
   *   userPublicKey: wallet.publicKey.toBase58(),
   *   wrapUnwrapSol: true,
   *   priorityFee: { type: 'exact', amount: 10000 },
   * });
   *
   * // Sign and send the transaction
   * const result = await signSendAndConfirm(connection, swap.transaction, keypair);
   * ```
   */
  async createSwap(params) {
    const quoteResponse = await this.getQuote({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      slippageBps: params.slippageBps
    });
    return this.http.post("/swap", {
      quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapUnwrapSol: params.wrapUnwrapSol,
      priorityFee: params.priorityFee
    });
  }
  /**
   * Get swap instructions for custom transaction composition.
   *
   * Instead of a complete transaction, returns individual instructions
   * that can be combined with other instructions in a custom transaction.
   * Useful for advanced use cases like atomic multi-step operations.
   *
   * @param params - Swap parameters (same as {@link createSwap})
   * @returns Instructions and accounts for building a custom transaction
   *
   * @example
   * ```typescript
   * const instructions = await dflow.swap.getSwapInstructions({
   *   inputMint: USDC_MINT,
   *   outputMint: yesMint,
   *   amount: 1000000,
   *   slippageBps: 50,
   *   userPublicKey: wallet.publicKey.toBase58(),
   * });
   *
   * // Build a custom transaction with these instructions
   * const tx = new Transaction();
   * instructions.instructions.forEach(ix => tx.add(ix));
   * ```
   */
  async getSwapInstructions(params) {
    const quoteResponse = await this.getQuote({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      slippageBps: params.slippageBps
    });
    return this.http.post("/swap-instructions", {
      quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapUnwrapSol: params.wrapUnwrapSol,
      priorityFee: params.priorityFee
    });
  }
};

// src/api/trade/intent.ts
var IntentAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get a quote for an intent-based swap.
   *
   * Preview what you'll receive (ExactIn) or what you'll pay (ExactOut)
   * before submitting the intent.
   *
   * @param params - Intent quote parameters
   * @param params.inputMint - The mint address of the token to sell
   * @param params.outputMint - The mint address of the token to buy
   * @param params.amount - The exact amount (input or output based on mode)
   * @param params.mode - 'ExactIn' to specify input amount, 'ExactOut' for output amount
   * @returns Quote showing expected amounts
   *
   * @example
   * ```typescript
   * // How much YES will I get for exactly 1 USDC?
   * const quote = await dflow.intent.getIntentQuote({
   *   inputMint: USDC_MINT,
   *   outputMint: yesMint,
   *   amount: 1000000,
   *   mode: 'ExactIn',
   * });
   * console.log(`You'll receive: ${quote.outAmount} YES tokens`);
   *
   * // How much USDC do I need to get exactly 100 YES tokens?
   * const quote = await dflow.intent.getIntentQuote({
   *   inputMint: USDC_MINT,
   *   outputMint: yesMint,
   *   amount: 100000000,
   *   mode: 'ExactOut',
   * });
   * console.log(`You'll pay: ${quote.inAmount} USDC`);
   * ```
   */
  async getIntentQuote(params) {
    return this.http.get("/intent", {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      mode: params.mode
    });
  }
  /**
   * Submit an intent-based swap for execution.
   *
   * Creates and returns a transaction for the intent. The transaction
   * will execute the swap according to the specified mode (ExactIn/ExactOut).
   *
   * @param params - Intent submission parameters
   * @param params.inputMint - The mint address of the token to sell
   * @param params.outputMint - The mint address of the token to buy
   * @param params.amount - The exact amount (input or output based on mode)
   * @param params.mode - 'ExactIn' or 'ExactOut'
   * @param params.slippageBps - Slippage tolerance in basis points
   * @param params.userPublicKey - The user's Solana wallet public key
   * @param params.priorityFee - Optional priority fee configuration
   * @returns Intent response with transaction to sign
   *
   * @example
   * ```typescript
   * const intent = await dflow.intent.submitIntent({
   *   inputMint: USDC_MINT,
   *   outputMint: market.accounts.usdc.yesMint,
   *   amount: 1000000,
   *   mode: 'ExactIn',
   *   slippageBps: 50,
   *   userPublicKey: wallet.publicKey.toBase58(),
   * });
   *
   * // Sign and send the transaction
   * const result = await signSendAndConfirm(connection, intent.transaction, keypair);
   * ```
   */
  async submitIntent(params) {
    const quoteResponse = await this.getIntentQuote({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      mode: params.mode
    });
    return this.http.post("/submit-intent", {
      quoteResponse,
      userPublicKey: params.userPublicKey,
      slippageBps: params.slippageBps,
      priorityFee: params.priorityFee
    });
  }
};

// src/api/trade/predictionMarket.ts
var PredictionMarketAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Initialize a new prediction market.
   *
   * Creates a new prediction market with YES and NO outcome tokens.
   * The returned transaction must be signed and sent to complete
   * market creation.
   *
   * @param params - Market initialization parameters
   * @param params.marketTicker - Unique ticker for the new market
   * @param params.userPublicKey - The creator's Solana wallet public key
   * @param params.settlementMint - Token mint for settlement (defaults to USDC)
   * @returns Initialization response with transaction and mint addresses
   *
   * @example
   * ```typescript
   * import { USDC_MINT } from 'dflow-sdk';
   *
   * const init = await dflow.predictionMarket.initializeMarket({
   *   marketTicker: 'BTCPRICE-25DEC-100K',
   *   userPublicKey: wallet.publicKey.toBase58(),
   *   settlementMint: USDC_MINT, // Optional, defaults to USDC
   * });
   *
   * // Sign and send the initialization transaction
   * const result = await signSendAndConfirm(connection, init.transaction, keypair);
   *
   * // Store the mint addresses for trading
   * console.log(`Market created!`);
   * console.log(`YES token: ${init.yesMint}`);
   * console.log(`NO token: ${init.noMint}`);
   * ```
   */
  async initializeMarket(params) {
    return this.http.get("/prediction-market-init", {
      marketTicker: params.marketTicker,
      userPublicKey: params.userPublicKey,
      settlementMint: params.settlementMint ?? USDC_MINT
    });
  }
};

// src/api/trade/tokens.ts
var TokensAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get all available tokens for trading.
   *
   * @returns Array of token information
   *
   * @example
   * ```typescript
   * const tokens = await dflow.tokens.getTokens();
   * tokens.forEach(token => {
   *   console.log(`${token.symbol}: ${token.mint}`);
   * });
   * ```
   */
  async getTokens() {
    return this.http.get("/tokens");
  }
  /**
   * Get all available tokens with decimal information.
   *
   * Includes the number of decimal places for each token,
   * useful for formatting amounts correctly.
   *
   * @returns Array of tokens with decimal information
   *
   * @example
   * ```typescript
   * const tokens = await dflow.tokens.getTokensWithDecimals();
   * tokens.forEach(token => {
   *   console.log(`${token.symbol}: ${token.decimals} decimals`);
   *   // Convert 1 token to base units
   *   const baseUnits = 1 * Math.pow(10, token.decimals);
   * });
   * ```
   */
  async getTokensWithDecimals() {
    return this.http.get("/tokens-with-decimals");
  }
};

// src/api/trade/venues.ts
var VenuesAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get all available trading venues.
   *
   * @returns Array of venue information
   *
   * @example
   * ```typescript
   * const venues = await dflow.venues.getVenues();
   * venues.forEach(venue => {
   *   console.log(`${venue.name}: ${venue.description}`);
   * });
   * ```
   */
  async getVenues() {
    return this.http.get("/venues");
  }
};

// src/websocket/client.ts
var DFlowWebSocket = class {
  ws = null;
  url;
  reconnect;
  reconnectInterval;
  maxReconnectAttempts;
  reconnectAttempts = 0;
  isConnecting = false;
  priceCallbacks = [];
  tradeCallbacks = [];
  orderbookCallbacks = [];
  errorCallbacks = [];
  closeCallbacks = [];
  /**
   * Create a new WebSocket client.
   *
   * @param options - WebSocket configuration options
   * @param options.url - Custom WebSocket URL (defaults to DFlow WebSocket)
   * @param options.reconnect - Whether to auto-reconnect on disconnect (default: true)
   * @param options.reconnectInterval - Milliseconds between reconnect attempts (default: 5000)
   * @param options.maxReconnectAttempts - Max reconnection attempts (default: 10)
   */
  constructor(options) {
    this.url = options?.url ?? WEBSOCKET_URL;
    this.reconnect = options?.reconnect ?? true;
    this.reconnectInterval = options?.reconnectInterval ?? 5e3;
    this.maxReconnectAttempts = options?.maxReconnectAttempts ?? 10;
  }
  /**
   * Connect to the WebSocket server.
   *
   * Must be called before subscribing to any channels.
   * Resolves when connection is established.
   *
   * @returns Promise that resolves when connected
   * @throws Error if connection fails
   *
   * @example
   * ```typescript
   * await dflow.ws.connect();
   * console.log('Connected!', dflow.ws.isConnected);
   * ```
   */
  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    if (this.isConnecting) {
      return;
    }
    this.isConnecting = true;
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };
        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };
        this.ws.onerror = () => {
          this.isConnecting = false;
          const error = new Error("WebSocket error");
          this.errorCallbacks.forEach((cb) => cb(error));
          reject(error);
        };
        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.closeCallbacks.forEach((cb) => cb(event));
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }
  /**
   * Disconnect from the WebSocket server.
   *
   * Disables auto-reconnect and closes the connection.
   *
   * @example
   * ```typescript
   * dflow.ws.disconnect();
   * ```
   */
  disconnect() {
    this.reconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  attemptReconnect() {
    if (!this.reconnect) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      const error = new Error("Max reconnection attempts reached");
      this.errorCallbacks.forEach((cb) => cb(error));
      return;
    }
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect().catch(() => {
      });
    }, this.reconnectInterval);
  }
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      switch (data.channel) {
        case "prices":
          this.priceCallbacks.forEach((cb) => cb(data));
          break;
        case "trades":
          this.tradeCallbacks.forEach((cb) => cb(data));
          break;
        case "orderbook":
          this.orderbookCallbacks.forEach((cb) => cb(data));
          break;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to parse message");
      this.errorCallbacks.forEach((cb) => cb(err));
    }
  }
  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }
    this.ws.send(JSON.stringify(message));
  }
  /**
   * Subscribe to price updates for specific markets.
   *
   * @param tickers - Array of market tickers to subscribe to
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * dflow.ws.subscribePrices(['BTCD-25DEC0313-T92749.99', 'ETHD-25DEC0313']);
   * ```
   */
  subscribePrices(tickers) {
    this.send({ type: "subscribe", channel: "prices", tickers });
  }
  /**
   * Subscribe to price updates for all markets.
   *
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * dflow.ws.subscribeAllPrices();
   * ```
   */
  subscribeAllPrices() {
    this.send({ type: "subscribe", channel: "prices", all: true });
  }
  /**
   * Subscribe to trade updates for specific markets.
   *
   * @param tickers - Array of market tickers to subscribe to
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * dflow.ws.subscribeTrades(['BTCD-25DEC0313-T92749.99']);
   * ```
   */
  subscribeTrades(tickers) {
    this.send({ type: "subscribe", channel: "trades", tickers });
  }
  /**
   * Subscribe to trade updates for all markets.
   *
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * dflow.ws.subscribeAllTrades();
   * ```
   */
  subscribeAllTrades() {
    this.send({ type: "subscribe", channel: "trades", all: true });
  }
  /**
   * Subscribe to orderbook updates for specific markets.
   *
   * @param tickers - Array of market tickers to subscribe to
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * dflow.ws.subscribeOrderbook(['BTCD-25DEC0313-T92749.99']);
   * ```
   */
  subscribeOrderbook(tickers) {
    this.send({ type: "subscribe", channel: "orderbook", tickers });
  }
  /**
   * Subscribe to orderbook updates for all markets.
   *
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * dflow.ws.subscribeAllOrderbook();
   * ```
   */
  subscribeAllOrderbook() {
    this.send({ type: "subscribe", channel: "orderbook", all: true });
  }
  /**
   * Unsubscribe from a channel.
   *
   * @param channel - The channel to unsubscribe from ('prices', 'trades', or 'orderbook')
   * @param tickers - Optional specific tickers to unsubscribe. If omitted, unsubscribes from all.
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * // Unsubscribe from specific markets
   * dflow.ws.unsubscribe('prices', ['BTCD-25DEC0313-T92749.99']);
   *
   * // Unsubscribe from all on a channel
   * dflow.ws.unsubscribe('trades');
   * ```
   */
  unsubscribe(channel, tickers) {
    if (tickers) {
      this.send({ type: "unsubscribe", channel, tickers });
    } else {
      this.send({ type: "unsubscribe", channel, all: true });
    }
  }
  /**
   * Register a callback for price updates.
   *
   * @param callback - Function called when a price update is received
   * @returns Unsubscribe function to remove the callback
   *
   * @example
   * ```typescript
   * const unsubscribe = dflow.ws.onPrice((update) => {
   *   console.log(`${update.ticker}: YES=${update.yesPrice} NO=${update.noPrice}`);
   * });
   *
   * // Later: remove callback
   * unsubscribe();
   * ```
   */
  onPrice(callback) {
    this.priceCallbacks.push(callback);
    return () => {
      this.priceCallbacks = this.priceCallbacks.filter((cb) => cb !== callback);
    };
  }
  /**
   * Register a callback for trade updates.
   *
   * @param callback - Function called when a trade update is received
   * @returns Unsubscribe function to remove the callback
   *
   * @example
   * ```typescript
   * const unsubscribe = dflow.ws.onTrade((trade) => {
   *   console.log(`Trade: ${trade.side} ${trade.amount} @ ${trade.price}`);
   * });
   *
   * // Later: remove callback
   * unsubscribe();
   * ```
   */
  onTrade(callback) {
    this.tradeCallbacks.push(callback);
    return () => {
      this.tradeCallbacks = this.tradeCallbacks.filter((cb) => cb !== callback);
    };
  }
  /**
   * Register a callback for orderbook updates.
   *
   * @param callback - Function called when an orderbook update is received
   * @returns Unsubscribe function to remove the callback
   *
   * @example
   * ```typescript
   * const unsubscribe = dflow.ws.onOrderbook((book) => {
   *   console.log(`${book.ticker}: Bid=${book.yesBid} Ask=${book.yesAsk}`);
   * });
   *
   * // Later: remove callback
   * unsubscribe();
   * ```
   */
  onOrderbook(callback) {
    this.orderbookCallbacks.push(callback);
    return () => {
      this.orderbookCallbacks = this.orderbookCallbacks.filter((cb) => cb !== callback);
    };
  }
  /**
   * Register a callback for WebSocket errors.
   *
   * @param callback - Function called when an error occurs
   * @returns Unsubscribe function to remove the callback
   *
   * @example
   * ```typescript
   * const unsubscribe = dflow.ws.onError((error) => {
   *   console.error('WebSocket error:', error.message);
   * });
   * ```
   */
  onError(callback) {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }
  /**
   * Register a callback for WebSocket close events.
   *
   * @param callback - Function called when the connection closes
   * @returns Unsubscribe function to remove the callback
   *
   * @example
   * ```typescript
   * const unsubscribe = dflow.ws.onClose((event) => {
   *   console.log('WebSocket closed:', event.code, event.reason);
   * });
   * ```
   */
  onClose(callback) {
    this.closeCallbacks.push(callback);
    return () => {
      this.closeCallbacks = this.closeCallbacks.filter((cb) => cb !== callback);
    };
  }
  /**
   * Check if the WebSocket is currently connected.
   *
   * @returns true if connected, false otherwise
   *
   * @example
   * ```typescript
   * if (dflow.ws.isConnected) {
   *   dflow.ws.subscribePrices(['BTCD-25DEC0313-T92749.99']);
   * }
   * ```
   */
  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
};

// src/client.ts
var DFlowClient = class {
  metadataHttp;
  tradeHttp;
  /** API for discovering and querying prediction events */
  events;
  /** API for market data, pricing, and batch queries */
  markets;
  /** API for orderbook snapshots */
  orderbook;
  /** API for historical trade data */
  trades;
  /** API for real-time milestone data */
  liveData;
  /** API for series/category information */
  series;
  /** API for tag-based filtering */
  tags;
  /** API for sports-specific filters */
  sports;
  /** API for searching events and markets */
  search;
  /** API for order creation and status (requires API key) */
  orders;
  /** API for imperative swaps with route preview (requires API key) */
  swap;
  /** API for declarative intent-based swaps (requires API key) */
  intent;
  /** API for prediction market initialization (requires API key) */
  predictionMarket;
  /** API for token information */
  tokens;
  /** API for trading venue information */
  venues;
  /** WebSocket client for real-time price, trade, and orderbook updates */
  ws;
  /**
   * Create a new DFlow client instance.
   *
   * @param options - Client configuration options
   */
  constructor(options) {
    const env = options?.environment ?? "development";
    const isProd = env === "production";
    const metadataUrl = options?.metadataBaseUrl ?? (isProd ? PROD_METADATA_API_BASE_URL : METADATA_API_BASE_URL);
    const tradeUrl = options?.tradeBaseUrl ?? (isProd ? PROD_TRADE_API_BASE_URL : TRADE_API_BASE_URL);
    const wsUrl = isProd ? PROD_WEBSOCKET_URL : WEBSOCKET_URL;
    this.metadataHttp = new HttpClient({
      baseUrl: metadataUrl,
      apiKey: options?.apiKey
    });
    this.tradeHttp = new HttpClient({
      baseUrl: tradeUrl,
      apiKey: options?.apiKey
    });
    this.events = new EventsAPI(this.metadataHttp);
    this.markets = new MarketsAPI(this.metadataHttp);
    this.orderbook = new OrderbookAPI(this.metadataHttp);
    this.trades = new TradesAPI(this.metadataHttp);
    this.liveData = new LiveDataAPI(this.metadataHttp);
    this.series = new SeriesAPI(this.metadataHttp);
    this.tags = new TagsAPI(this.metadataHttp);
    this.sports = new SportsAPI(this.metadataHttp);
    this.search = new SearchAPI(this.metadataHttp);
    this.orders = new OrdersAPI(this.tradeHttp);
    this.swap = new SwapAPI(this.tradeHttp);
    this.intent = new IntentAPI(this.tradeHttp);
    this.predictionMarket = new PredictionMarketAPI(this.tradeHttp);
    this.tokens = new TokensAPI(this.tradeHttp);
    this.venues = new VenuesAPI(this.tradeHttp);
    this.ws = new DFlowWebSocket({ ...options?.wsOptions, url: options?.wsOptions?.url ?? wsUrl });
  }
  /**
   * Update the API key for both metadata and trade HTTP clients.
   * Useful for setting the key after initialization or rotating keys.
   *
   * @param apiKey - The new API key to use
   *
   * @example
   * ```typescript
   * const dflow = new DFlowClient();
   *
   * // Browse markets without auth
   * const markets = await dflow.markets.getMarkets();
   *
   * // Set API key when user logs in
   * dflow.setApiKey('user-api-key');
   *
   * // Now can use authenticated endpoints
   * const quote = await dflow.swap.getQuote(params);
   * ```
   */
  setApiKey(apiKey) {
    this.metadataHttp.setApiKey(apiKey);
    this.tradeHttp.setApiKey(apiKey);
  }
};
async function signAndSendTransaction(connection, transactionBase64, signer) {
  const transactionBuffer = Buffer.from(transactionBase64, "base64");
  const transaction = VersionedTransaction.deserialize(transactionBuffer);
  transaction.sign([signer]);
  const signature = await connection.sendTransaction(transaction, {
    skipPreflight: false,
    preflightCommitment: "confirmed"
  });
  return signature;
}
async function waitForConfirmation(connection, signature, commitment = "confirmed", timeoutMs = 6e4) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const response = await connection.getSignatureStatus(signature);
    const status = response.value;
    if (status) {
      if (status.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
      }
      const confirmationStatus = status.confirmationStatus;
      if (confirmationStatus === "finalized" || commitment === "confirmed" && confirmationStatus === "confirmed" || commitment === "processed" && confirmationStatus === "processed") {
        return {
          signature,
          slot: status.slot,
          confirmationStatus: confirmationStatus ?? "processed",
          err: status.err
        };
      }
    }
    await sleep(2e3);
  }
  throw new Error(`Transaction confirmation timeout after ${timeoutMs}ms`);
}
async function signSendAndConfirm(connection, transactionBase64, signer, commitment = "confirmed") {
  const signature = await signAndSendTransaction(connection, transactionBase64, signer);
  return waitForConfirmation(connection, signature, commitment);
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function getTokenBalances(connection, walletAddress) {
  const [tokenAccounts, token2022Accounts] = await Promise.all([
    connection.getParsedTokenAccountsByOwner(walletAddress, {
      programId: TOKEN_PROGRAM_ID
    }),
    connection.getParsedTokenAccountsByOwner(walletAddress, {
      programId: TOKEN_2022_PROGRAM_ID
    })
  ]);
  const allAccounts = [...tokenAccounts.value, ...token2022Accounts.value];
  return allAccounts.map(({ account }) => {
    const info = account.data.parsed.info;
    return {
      mint: info.mint,
      rawBalance: info.tokenAmount.amount,
      balance: info.tokenAmount.uiAmount,
      decimals: info.tokenAmount.decimals
    };
  }).filter((token) => token.balance > 0);
}
async function getUserPositions(connection, walletAddress, marketsAPI) {
  const tokenBalances = await getTokenBalances(connection, walletAddress);
  if (tokenBalances.length === 0) {
    return [];
  }
  const allMints = tokenBalances.map((t) => t.mint);
  const predictionMints = await marketsAPI.filterOutcomeMints(allMints);
  if (predictionMints.length === 0) {
    return [];
  }
  const outcomeTokens = tokenBalances.filter((t) => predictionMints.includes(t.mint));
  const markets = await marketsAPI.getMarketsBatch({ mints: predictionMints });
  const marketsByMint = /* @__PURE__ */ new Map();
  markets.forEach((market) => {
    Object.values(market.accounts).forEach((account) => {
      marketsByMint.set(account.yesMint, market);
      marketsByMint.set(account.noMint, market);
      marketsByMint.set(account.marketLedger, market);
    });
  });
  return outcomeTokens.map((token) => {
    const market = marketsByMint.get(token.mint) ?? null;
    if (!market) {
      return {
        mint: token.mint,
        balance: token.balance,
        decimals: token.decimals,
        position: "UNKNOWN",
        market: null
      };
    }
    const isYesToken = Object.values(market.accounts).some(
      (account) => account.yesMint === token.mint
    );
    const isNoToken = Object.values(market.accounts).some(
      (account) => account.noMint === token.mint
    );
    return {
      mint: token.mint,
      balance: token.balance,
      decimals: token.decimals,
      position: isYesToken ? "YES" : isNoToken ? "NO" : "UNKNOWN",
      market
    };
  });
}
function isRedemptionEligible(market, outcomeMint) {
  if (market.status !== "determined" && market.status !== "finalized") {
    return false;
  }
  for (const account of Object.values(market.accounts)) {
    if (account.redemptionStatus !== "open") {
      continue;
    }
    const isWinningYes = market.result === "yes" && account.yesMint === outcomeMint;
    const isWinningNo = market.result === "no" && account.noMint === outcomeMint;
    const isScalarOutcome = market.result === "" && account.scalarOutcomePct !== void 0 && (account.yesMint === outcomeMint || account.noMint === outcomeMint);
    if (isWinningYes || isWinningNo || isScalarOutcome) {
      return true;
    }
  }
  return false;
}
function calculateScalarPayout(market, outcomeMint, amount) {
  for (const account of Object.values(market.accounts)) {
    if (account.scalarOutcomePct === void 0) continue;
    if (account.yesMint === outcomeMint) {
      return amount * account.scalarOutcomePct / 1e4;
    }
    if (account.noMint === outcomeMint) {
      return amount * (1e4 - account.scalarOutcomePct) / 1e4;
    }
  }
  return 0;
}

// src/utils/retry.ts
function defaultShouldRetry(error, _attempt) {
  if (error instanceof DFlowApiError) {
    return error.statusCode === 429 || error.statusCode >= 500;
  }
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }
  return false;
}
function calculateDelay(attempt, initialDelayMs, maxDelayMs, backoffMultiplier) {
  const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt);
  const delayWithCap = Math.min(exponentialDelay, maxDelayMs);
  const jitter = delayWithCap * Math.random() * 0.25;
  return delayWithCap + jitter;
}
async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelayMs = 1e3,
    maxDelayMs = 3e4,
    backoffMultiplier = 2,
    shouldRetry = defaultShouldRetry
  } = options;
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries && shouldRetry(error, attempt)) {
        const delay = calculateDelay(attempt, initialDelayMs, maxDelayMs, backoffMultiplier);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}
function createRetryable(fn, options = {}) {
  return (...args) => withRetry(() => fn(...args), options);
}

// src/utils/pagination.ts
async function* paginate(fetchPage, options) {
  const { maxItems, pageSize, getItems, getCursor = (r) => r.cursor } = options;
  let cursor;
  let itemsYielded = 0;
  do {
    const response = await fetchPage({
      cursor,
      limit: pageSize
    });
    const items = getItems(response);
    for (const item of items) {
      yield item;
      itemsYielded++;
      if (maxItems !== void 0 && itemsYielded >= maxItems) {
        return;
      }
    }
    cursor = getCursor(response);
  } while (cursor);
}
async function collectAll(fetchPage, options) {
  const items = [];
  for await (const item of paginate(fetchPage, options)) {
    items.push(item);
  }
  return items;
}
async function countAll(fetchPage, options) {
  let count = 0;
  for await (const _ of paginate(fetchPage, options)) {
    count++;
  }
  return count;
}
async function findFirst(fetchPage, options, predicate) {
  for await (const item of paginate(fetchPage, options)) {
    if (predicate(item)) {
      return item;
    }
  }
  return void 0;
}

export { DEFAULT_SLIPPAGE_BPS, DFlowApiError, DFlowClient, DFlowWebSocket, EventsAPI, HttpClient, IntentAPI, LiveDataAPI, MAX_BATCH_SIZE, MAX_FILTER_ADDRESSES, METADATA_API_BASE_URL, MarketsAPI, OUTCOME_TOKEN_DECIMALS, OrderbookAPI, OrdersAPI, PROD_METADATA_API_BASE_URL, PROD_TRADE_API_BASE_URL, PROD_WEBSOCKET_URL, PredictionMarketAPI, SOL_MINT, SearchAPI, SeriesAPI, SportsAPI, SwapAPI, TRADE_API_BASE_URL, TagsAPI, TokensAPI, TradesAPI, USDC_MINT, VenuesAPI, WEBSOCKET_URL, calculateScalarPayout, collectAll, countAll, createRetryable, defaultShouldRetry, findFirst, getTokenBalances, getUserPositions, isRedemptionEligible, paginate, signAndSendTransaction, signSendAndConfirm, waitForConfirmation, withRetry };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map