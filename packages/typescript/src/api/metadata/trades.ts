import type { HttpClient } from '../../utils/http.js';
import type { TradesParams, TradesResponse } from '../../types/index.js';

/**
 * API for retrieving historical trade data.
 *
 * Access past trades for markets to analyze trading activity and price history.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const { trades } = await dflow.trades.getTrades({
 *   marketTicker: 'BTCD-25DEC0313-T92749.99',
 *   limit: 100,
 * });
 * ```
 */
export class TradesAPI {
  constructor(private http: HttpClient) {}

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
  async getTrades(params?: TradesParams): Promise<TradesResponse> {
    return this.http.get<TradesResponse>('/trades', params);
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
  async getTradesByMint(
    mintAddress: string,
    params?: Omit<TradesParams, 'marketTicker'>
  ): Promise<TradesResponse> {
    return this.http.get<TradesResponse>(`/trades/by-mint/${mintAddress}`, params);
  }
}
