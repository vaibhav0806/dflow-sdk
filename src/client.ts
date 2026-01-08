import { HttpClient } from './utils/http.js';
import {
  METADATA_API_BASE_URL,
  TRADE_API_BASE_URL,
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

import { DFlowWebSocket } from './websocket/client.js';

import type { WebSocketOptions } from './types/index.js';

/**
 * Configuration options for the DFlow client.
 */
export interface DFlowClientOptions {
  /** API key for authenticated endpoints (required for trade API) */
  apiKey?: string;
  /** Custom base URL for the metadata API (default: production URL) */
  metadataBaseUrl?: string;
  /** Custom base URL for the trade API (default: production URL) */
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
 * // Basic usage (public endpoints only)
 * const dflow = new DFlowClient();
 * const markets = await dflow.markets.getMarkets();
 *
 * // With API key (for trading)
 * const dflow = new DFlowClient({ apiKey: 'your-api-key' });
 * const quote = await dflow.swap.getQuote({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 1000000,
 * });
 *
 * // With custom endpoints (e.g., development)
 * import { DEV_METADATA_API_BASE_URL, DEV_TRADE_API_BASE_URL } from 'dflow-sdk';
 *
 * const devClient = new DFlowClient({
 *   metadataBaseUrl: DEV_METADATA_API_BASE_URL,
 *   tradeBaseUrl: DEV_TRADE_API_BASE_URL,
 * });
 * ```
 */
export class DFlowClient {
  private metadataHttp: HttpClient;
  private tradeHttp: HttpClient;

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

  /** WebSocket client for real-time price, trade, and orderbook updates */
  public readonly ws: DFlowWebSocket;

  /**
   * Create a new DFlow client instance.
   *
   * @param options - Client configuration options
   */
  constructor(options?: DFlowClientOptions) {
    this.metadataHttp = new HttpClient({
      baseUrl: options?.metadataBaseUrl ?? METADATA_API_BASE_URL,
      apiKey: options?.apiKey,
    });

    this.tradeHttp = new HttpClient({
      baseUrl: options?.tradeBaseUrl ?? TRADE_API_BASE_URL,
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

    this.ws = new DFlowWebSocket(options?.wsOptions);
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
  }
}
