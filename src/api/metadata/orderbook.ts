import type { HttpClient } from '../../utils/http.js';
import type { Orderbook } from '../../types/index.js';

export class OrderbookAPI {
  constructor(private http: HttpClient) {}

  async getOrderbook(marketTicker: string): Promise<Orderbook> {
    return this.http.get<Orderbook>(`/orderbook/${marketTicker}`);
  }

  async getOrderbookByMint(mintAddress: string): Promise<Orderbook> {
    return this.http.get<Orderbook>(`/orderbook/by-mint/${mintAddress}`);
  }
}
