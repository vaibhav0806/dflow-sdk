import type { HttpClient } from '../../utils/http.js';
import type { TradesParams, TradesResponse } from '../../types/index.js';

export class TradesAPI {
  constructor(private http: HttpClient) {}

  async getTrades(params?: TradesParams): Promise<TradesResponse> {
    return this.http.get<TradesResponse>('/trades', params);
  }

  async getTradesByMint(
    mintAddress: string,
    params?: Omit<TradesParams, 'marketTicker'>
  ): Promise<TradesResponse> {
    return this.http.get<TradesResponse>(`/trades/by-mint/${mintAddress}`, params);
  }
}
