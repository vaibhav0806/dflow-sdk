import type { HttpClient } from '../../utils/http.js';
import type { TradesParams, TradesByMintParams, TradesResponse } from '../../types/index.js';

/**
 * API for retrieving historical trade data.
 *
 * Access past trades for markets to analyze trading activity and price history.
 * Relays requests directly to Kalshi API.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const { trades } = await dflow.trades.getTrades({
 *   ticker: 'BTCD-25DEC0313-T92749.99',
 *   limit: 100,
 * });
 * ```
 */
export class TradesAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get historical trades with optional filtering.
   *
   * Returns a paginated list of all trades. Can be filtered by market ticker
   * and timestamp range.
   *
   * @param params - Optional filter parameters
   * @param params.ticker - Filter by market ticker
   * @param params.minTs - Filter trades after this Unix timestamp
   * @param params.maxTs - Filter trades before this Unix timestamp
   * @param params.limit - Maximum number of trades to return (1-1000, default 100)
   * @param params.cursor - Pagination cursor (trade ID) to start from
   * @returns Paginated list of trades
   *
   * @example
   * ```typescript
   * // Get recent trades for a market
   * const { trades, cursor } = await dflow.trades.getTrades({
   *   ticker: 'BTCD-25DEC0313-T92749.99',
   *   limit: 100,
   * });
   *
   * // Filter by timestamp range
   * const recentTrades = await dflow.trades.getTrades({
   *   minTs: 1704067200,  // Jan 1, 2024
   *   maxTs: 1704153600,  // Jan 2, 2024
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
   * Looks up the market ticker from a mint address, then fetches trades from Kalshi.
   * Returns a paginated list of trades. Can be filtered by timestamp range.
   *
   * @param mintAddress - Mint address (ledger or outcome mint)
   * @param params - Optional filter parameters
   * @param params.minTs - Filter trades after this Unix timestamp
   * @param params.maxTs - Filter trades before this Unix timestamp
   * @param params.limit - Maximum number of trades to return (1-1000, default 100)
   * @param params.cursor - Pagination cursor (trade ID) to start from
   * @returns Paginated list of trades
   *
   * @example
   * ```typescript
   * const { trades } = await dflow.trades.getTradesByMint('EPjFWdd5...', {
   *   limit: 50,
   * });
   *
   * // Filter by timestamp
   * const recentTrades = await dflow.trades.getTradesByMint('EPjFWdd5...', {
   *   minTs: Date.now() / 1000 - 86400,  // Last 24 hours
   * });
   * ```
   */
  async getTradesByMint(
    mintAddress: string,
    params?: TradesByMintParams
  ): Promise<TradesResponse> {
    return this.http.get<TradesResponse>(`/trades/by-mint/${mintAddress}`, params);
  }
}
