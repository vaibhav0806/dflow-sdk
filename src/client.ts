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
} from './api/trade/index.js';

import { DFlowWebSocket } from './websocket/client.js';

import type { WebSocketOptions } from './types/index.js';

export interface DFlowClientOptions {
  apiKey?: string;
  metadataBaseUrl?: string;
  tradeBaseUrl?: string;
  wsOptions?: WebSocketOptions;
}

export class DFlowClient {
  private metadataHttp: HttpClient;
  private tradeHttp: HttpClient;

  public readonly events: EventsAPI;
  public readonly markets: MarketsAPI;
  public readonly orderbook: OrderbookAPI;
  public readonly trades: TradesAPI;
  public readonly liveData: LiveDataAPI;
  public readonly series: SeriesAPI;
  public readonly tags: TagsAPI;
  public readonly sports: SportsAPI;
  public readonly search: SearchAPI;

  public readonly orders: OrdersAPI;
  public readonly swap: SwapAPI;
  public readonly intent: IntentAPI;
  public readonly predictionMarket: PredictionMarketAPI;

  public readonly ws: DFlowWebSocket;

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

    this.ws = new DFlowWebSocket(options?.wsOptions);
  }

  setApiKey(apiKey: string): void {
    this.metadataHttp.setApiKey(apiKey);
    this.tradeHttp.setApiKey(apiKey);
  }
}
