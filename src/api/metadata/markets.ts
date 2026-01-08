import type { HttpClient } from '../../utils/http.js';
import type {
  Market,
  MarketsParams,
  MarketsResponse,
  MarketsBatchParams,
  MarketsBatchResponse,
  FilterOutcomeMintsParams,
  FilterOutcomeMintsResponse,
  Candlestick,
} from '../../types/index.js';
import { MAX_BATCH_SIZE, MAX_FILTER_ADDRESSES } from '../../utils/constants.js';

export class MarketsAPI {
  constructor(private http: HttpClient) {}

  async getMarket(marketId: string): Promise<Market> {
    return this.http.get<Market>(`/market/${marketId}`);
  }

  async getMarketByMint(mintAddress: string): Promise<Market> {
    return this.http.get<Market>(`/market/by-mint/${mintAddress}`);
  }

  async getMarkets(params?: MarketsParams): Promise<MarketsResponse> {
    return this.http.get<MarketsResponse>('/markets', params);
  }

  async getMarketsBatch(params: MarketsBatchParams): Promise<Market[]> {
    const totalItems = (params.tickers?.length ?? 0) + (params.mints?.length ?? 0);
    if (totalItems > MAX_BATCH_SIZE) {
      throw new Error(`Batch size exceeds maximum of ${MAX_BATCH_SIZE} items`);
    }

    const response = await this.http.post<MarketsBatchResponse>('/markets/batch', params);
    return response.markets;
  }

  async getOutcomeMints(): Promise<string[]> {
    const response = await this.http.get<{ mints: string[] }>('/outcome_mints');
    return response.mints;
  }

  async filterOutcomeMints(addresses: string[]): Promise<string[]> {
    if (addresses.length > MAX_FILTER_ADDRESSES) {
      throw new Error(`Address count exceeds maximum of ${MAX_FILTER_ADDRESSES}`);
    }

    const params: FilterOutcomeMintsParams = { addresses };
    const response = await this.http.post<FilterOutcomeMintsResponse>(
      '/filter_outcome_mints',
      params
    );
    return response.outcomeMints;
  }

  async getMarketCandlesticks(ticker: string): Promise<Candlestick[]> {
    const response = await this.http.get<{ candlesticks: Candlestick[] }>(
      `/market/${ticker}/candlesticks`
    );
    return response.candlesticks;
  }

  async getMarketCandlesticksByMint(mintAddress: string): Promise<Candlestick[]> {
    const response = await this.http.get<{ candlesticks: Candlestick[] }>(
      `/market/by-mint/${mintAddress}/candlesticks`
    );
    return response.candlesticks;
  }
}
