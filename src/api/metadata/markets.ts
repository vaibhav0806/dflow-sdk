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
   * @param mintAddress - The Solana mint address of a YES or NO token
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
  async getMarkets(params?: MarketsParams): Promise<MarketsResponse> {
    return this.http.get<MarketsResponse>('/markets', params);
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
  async getOutcomeMints(): Promise<string[]> {
    const response = await this.http.get<{ mints: string[] }>('/outcome_mints');
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
  async getMarketCandlesticks(ticker: string): Promise<Candlestick[]> {
    const response = await this.http.get<{ candlesticks: Candlestick[] }>(
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
  async getMarketCandlesticksByMint(mintAddress: string): Promise<Candlestick[]> {
    const response = await this.http.get<{ candlesticks: Candlestick[] }>(
      `/market/by-mint/${mintAddress}/candlesticks`
    );
    return response.candlesticks;
  }
}
