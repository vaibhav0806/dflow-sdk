import { HttpClient } from './utils/http.js';
import {
  METADATA_API_BASE_URL,
  TRADE_API_BASE_URL,
  PROD_METADATA_API_BASE_URL,
  PROD_TRADE_API_BASE_URL,
  WEBSOCKET_URL,
  PROD_WEBSOCKET_URL,
  PROOF_API_BASE_URL,
} from './utils/constants.js';

import {
  EventsAPI,
  MarketsAPI,
  OrderbookAPI,
  TradesAPI,
  LiveDataAPI,
  SeriesAPI,
  TagsAPI,
  SportsAPI,
  SearchAPI,
} from './api/metadata/index.js';

import {
  OrdersAPI,
  SwapAPI,
  IntentAPI,
  PredictionMarketAPI,
  TokensAPI,
  VenuesAPI,
} from './api/trade/index.js';

import { ProofAPI } from './api/proof.js';

import { DFlowWebSocket } from './websocket/client.js';

import type { WebSocketOptions } from './types/index.js';

/**
 * Environment type for DFlow API endpoints.
 * - 'development': Uses dev endpoints, no API key required. Good for testing with real capital against Kalshi.
 * - 'production': Uses prod endpoints, API key required. For production deployments.
 */
export type DFlowEnvironment = 'development' | 'production';

/**
 * Configuration options for the DFlow client.
 */
export interface DFlowClientOptions {
  /**
   * Environment to use. Defaults to 'development'.
   * - 'development': No API key required, uses dev-*.dflow.net endpoints
   * - 'production': API key required, uses *.dflow.net endpoints
   */
  environment?: DFlowEnvironment;
  /** API key for authenticated endpoints (required for production) */
  apiKey?: string;
  /** Custom base URL for the metadata API (overrides environment setting) */
  metadataBaseUrl?: string;
  /** Custom base URL for the trade API (overrides environment setting) */
  tradeBaseUrl?: string;
  /** WebSocket connection options */
  wsOptions?: WebSocketOptions;
}

/**
 * Main client for interacting with the DFlow prediction markets platform.
 *
 * @example
 * ```typescript
 * import { DFlowClient } from 'dflow-sdk';
 *
 * // Development (default) - no API key required
 * // Uses dev-*.dflow.net endpoints for testing with real capital
 * const dflow = new DFlowClient();
 * const markets = await dflow.markets.getMarkets();
 *
 * // Production - API key required
 * // Uses *.dflow.net endpoints for production deployments
 * const dflow = new DFlowClient({
 *   environment: 'production',
 *   apiKey: 'your-api-key',
 * });
 *
 * // Get a quote and trade
 * const quote = await dflow.swap.getQuote({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 1000000,
 * });
 * ```
 */
export class DFlowClient {
  private metadataHttp: HttpClient;
  private tradeHttp: HttpClient;
  private proofHttp: HttpClient;

  /** API for discovering and querying prediction events */
  public readonly events: EventsAPI;
  /** API for market data, pricing, and batch queries */
  public readonly markets: MarketsAPI;
  /** API for orderbook snapshots */
  public readonly orderbook: OrderbookAPI;
  /** API for historical trade data */
  public readonly trades: TradesAPI;
  /** API for real-time milestone data */
  public readonly liveData: LiveDataAPI;
  /** API for series/category information */
  public readonly series: SeriesAPI;
  /** API for tag-based filtering */
  public readonly tags: TagsAPI;
  /** API for sports-specific filters */
  public readonly sports: SportsAPI;
  /** API for searching events and markets */
  public readonly search: SearchAPI;

  /** API for order creation and status (requires API key) */
  public readonly orders: OrdersAPI;
  /** API for imperative swaps with route preview (requires API key) */
  public readonly swap: SwapAPI;
  /** API for declarative intent-based swaps (requires API key) */
  public readonly intent: IntentAPI;
  /** API for prediction market initialization (requires API key) */
  public readonly predictionMarket: PredictionMarketAPI;
  /** API for token information */
  public readonly tokens: TokensAPI;
  /** API for trading venue information */
  public readonly venues: VenuesAPI;

  /** API for Proof KYC verification status and deep link generation */
  public readonly proof: ProofAPI;

  /** WebSocket client for real-time price, trade, and orderbook updates */
  public readonly ws: DFlowWebSocket;

  /**
   * Create a new DFlow client instance.
   *
   * @param options - Client configuration options
   */
  constructor(options?: DFlowClientOptions) {
    const env = options?.environment ?? 'development';
    const isProd = env === 'production';

    // Determine URLs based on environment (custom URLs override environment)
    const metadataUrl = options?.metadataBaseUrl ?? (isProd ? PROD_METADATA_API_BASE_URL : METADATA_API_BASE_URL);
    const tradeUrl = options?.tradeBaseUrl ?? (isProd ? PROD_TRADE_API_BASE_URL : TRADE_API_BASE_URL);
    const wsUrl = isProd ? PROD_WEBSOCKET_URL : WEBSOCKET_URL;

    this.metadataHttp = new HttpClient({
      baseUrl: metadataUrl,
      apiKey: options?.apiKey,
    });

    this.tradeHttp = new HttpClient({
      baseUrl: tradeUrl,
      apiKey: options?.apiKey,
    });

    this.proofHttp = new HttpClient({
      baseUrl: PROOF_API_BASE_URL,
      apiKey: options?.apiKey,
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

    this.proof = new ProofAPI(this.proofHttp);

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
  setApiKey(apiKey: string): void {
    this.metadataHttp.setApiKey(apiKey);
    this.tradeHttp.setApiKey(apiKey);
    this.proofHttp.setApiKey(apiKey);
  }
}
