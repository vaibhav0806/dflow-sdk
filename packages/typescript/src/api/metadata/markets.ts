import type { HttpClient } from '../../utils/http.js';
import type {
  Market,
  MarketsParams,
  MarketsResponse,
  MarketsBatchParams,
  MarketsBatchResponse,
  OutcomeMintsParams,
  FilterOutcomeMintsParams,
  FilterOutcomeMintsResponse,
  Candlestick,
  CandlestickParams,
} from '../../types/index.js';
import { MAX_BATCH_SIZE, MAX_FILTER_ADDRESSES } from '../../utils/constants.js';

/**
 * API for querying prediction market data, pricing, and batch operations.
 *
 * Markets represent individual trading instruments within events. Each market
 * has YES and NO outcome tokens that can be traded. Markets can be binary
 * (yes/no) or scalar (range of values).
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Get a specific market
 * const market = await dflow.markets.getMarket('BTCD-25DEC0313-T92749.99');
 *
 * // Get active markets
 * const { markets } = await dflow.markets.getMarkets({ status: 'active' });
 *
 * // Batch query multiple markets
 * const markets = await dflow.markets.getMarketsBatch({
 *   tickers: ['MARKET-1', 'MARKET-2'],
 * });
 * ```
 */
export class MarketsAPI {
  constructor(private http: HttpClient) {}

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
  async getMarket(marketId: string): Promise<Market> {
    return this.http.get<Market>(`/market/${marketId}`);
  }

  /**
   * Get a market by its outcome token mint address.
   *
   * Useful when you have a mint address from a wallet or transaction
   * and need to look up the associated market.
   *
   * @param mintAddress - The Solana mint address (ledger or outcome mint)
   * @returns The market associated with the mint address
   *
   * @example
   * ```typescript
   * const market = await dflow.markets.getMarketByMint('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
   * ```
   */
  async getMarketByMint(mintAddress: string): Promise<Market> {
    return this.http.get<Market>(`/market/by-mint/${mintAddress}`);
  }

  /**
   * List markets with optional filtering.
   *
   * @param params - Optional filter parameters
   * @param params.status - Filter by market status ('active', 'closed', etc.)
   * @param params.isInitialized - Filter markets that are initialized
   * @param params.sort - Sort field (volume, volume24h, liquidity, openInterest, startDate)
   * @param params.limit - Maximum number of markets to return
   * @param params.cursor - Pagination cursor (number of markets to skip)
   * @returns Paginated list of markets
   *
   * @example
   * ```typescript
   * // Get all active markets sorted by volume
   * const { markets, cursor } = await dflow.markets.getMarkets({
   *   status: 'active',
   *   sort: 'volume',
   * });
   *
   * // Get initialized markets only
   * const initialized = await dflow.markets.getMarkets({
   *   isInitialized: true,
   * });
   *
   * // Paginate through results
   * const nextPage = await dflow.markets.getMarkets({ cursor });
   * ```
   */
  async getMarkets(params?: MarketsParams): Promise<MarketsResponse> {
    return this.http.get<MarketsResponse>('/markets', params);
  }

  /**
   * Batch query multiple markets by tickers and/or mint addresses.
   *
   * More efficient than multiple individual requests when you need
   * data for several markets at once. Results are capped at 100 markets maximum.
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
  async getMarketsBatch(params: MarketsBatchParams): Promise<Market[]> {
    const totalItems = (params.tickers?.length ?? 0) + (params.mints?.length ?? 0);
    if (totalItems > MAX_BATCH_SIZE) {
      throw new Error(`Batch size exceeds maximum of ${MAX_BATCH_SIZE} items`);
    }

    const response = await this.http.post<MarketsBatchResponse>('/markets/batch', params);
    return response.markets;
  }

  /**
   * Get all outcome token mint addresses.
   *
   * Returns a flat list of all yes_mint and no_mint pubkeys from all supported markets.
   * Useful for filtering wallet tokens to find prediction market positions.
   *
   * @param params - Optional filter parameters
   * @param params.minCloseTs - Minimum close timestamp (Unix timestamp in seconds).
   *                            Only markets with close_time >= minCloseTs will be included.
   * @returns Array of mint addresses
   *
   * @example
   * ```typescript
   * // Get all outcome mints
   * const allMints = await dflow.markets.getOutcomeMints();
   * console.log(`Total outcome tokens: ${allMints.length}`);
   *
   * // Get outcome mints for markets closing after a specific date
   * const futureMints = await dflow.markets.getOutcomeMints({
   *   minCloseTs: Math.floor(Date.now() / 1000),  // Only markets not yet closed
   * });
   * ```
   */
  async getOutcomeMints(params?: OutcomeMintsParams): Promise<string[]> {
    const response = await this.http.get<{ mints: string[] }>('/outcome_mints', params);
    return response.mints;
  }

  /**
   * Filter a list of addresses to find which are outcome token mints.
   *
   * Given a list of token addresses (e.g., from a wallet), returns only
   * those that are prediction market outcome tokens (yes_mint or no_mint).
   *
   * @param addresses - Array of Solana token addresses to check (max 200)
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

  /**
   * Get OHLCV candlestick data for a market.
   *
   * Relays market candlesticks from the Kalshi API. Automatically resolves
   * the series_ticker from the market ticker.
   *
   * @param ticker - The market ticker
   * @param params - Required candlestick parameters
   * @param params.startTs - Start timestamp (Unix timestamp in seconds)
   * @param params.endTs - End timestamp (Unix timestamp in seconds)
   * @param params.periodInterval - Time period length of each candlestick in minutes (1, 60, or 1440)
   * @returns Array of candlestick data points
   *
   * @example
   * ```typescript
   * const candles = await dflow.markets.getMarketCandlesticks('BTCD-25DEC0313-T92749.99', {
   *   startTs: 1704067200,    // Jan 1, 2024
   *   endTs: 1704153600,      // Jan 2, 2024
   *   periodInterval: 60,     // 1 hour candles
   * });
   * candles.forEach(c => {
   *   console.log(`${c.timestamp}: O=${c.open} H=${c.high} L=${c.low} C=${c.close}`);
   * });
   * ```
   */
  async getMarketCandlesticks(
    ticker: string,
    params: CandlestickParams
  ): Promise<Candlestick[]> {
    const response = await this.http.get<{ candlesticks: Candlestick[] }>(
      `/market/${ticker}/candlesticks`,
      params
    );
    return response.candlesticks;
  }

  /**
   * Get OHLCV candlestick data for a market by mint address.
   *
   * Looks up the market ticker from a mint address, then fetches market candlesticks.
   * Automatically resolves the series_ticker.
   *
   * @param mintAddress - The Solana mint address (ledger or outcome mint)
   * @param params - Required candlestick parameters
   * @param params.startTs - Start timestamp (Unix timestamp in seconds)
   * @param params.endTs - End timestamp (Unix timestamp in seconds)
   * @param params.periodInterval - Time period length of each candlestick in minutes (1, 60, or 1440)
   * @returns Array of candlestick data points
   *
   * @example
   * ```typescript
   * const candles = await dflow.markets.getMarketCandlesticksByMint('EPjFWdd5...', {
   *   startTs: 1704067200,
   *   endTs: 1704153600,
   *   periodInterval: 1440,  // Daily candles
   * });
   * ```
   */
  async getMarketCandlesticksByMint(
    mintAddress: string,
    params: CandlestickParams
  ): Promise<Candlestick[]> {
    const response = await this.http.get<{ candlesticks: Candlestick[] }>(
      `/market/by-mint/${mintAddress}/candlesticks`,
      params
    );
    return response.candlesticks;
  }
}
