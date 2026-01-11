import type { HttpClient } from '../../utils/http.js';
import type { Series, SeriesParams, SeriesResponse } from '../../types/index.js';

/**
 * API for retrieving series/category information.
 *
 * Series represent templates for recurring events. They group related events together
 * (e.g., all Bitcoin price events, all election events). Use series to browse
 * events by category.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Get all series
 * const series = await dflow.series.getSeries();
 *
 * // Get a specific series
 * const btcSeries = await dflow.series.getSeriesByTicker('KXBTC');
 * ```
 */
export class SeriesAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get all available series templates.
   *
   * Returns all series templates available on Kalshi. A series represents
   * a template for recurring events.
   *
   * @param params - Optional filter parameters
   * @param params.category - Filter series by category (e.g., Politics, Economics, Entertainment)
   * @param params.tags - Filter series by tags (comma-separated list)
   * @param params.isInitialized - Filter series that are initialized (have a corresponding market ledger)
   * @param params.status - Filter series by market status
   * @returns Array of series matching the filters
   *
   * @example
   * ```typescript
   * // Get all series
   * const series = await dflow.series.getSeries();
   * series.forEach(s => console.log(`${s.ticker}: ${s.title}`));
   *
   * // Filter by category
   * const politicsSeries = await dflow.series.getSeries({
   *   category: 'Politics',
   * });
   *
   * // Filter by tags
   * const cryptoSeries = await dflow.series.getSeries({
   *   tags: 'crypto,bitcoin',
   * });
   *
   * // Get only initialized series
   * const initialized = await dflow.series.getSeries({
   *   isInitialized: true,
   * });
   * ```
   */
  async getSeries(params?: SeriesParams): Promise<Series[]> {
    const response = await this.http.get<SeriesResponse>('/series', params);
    return response.series;
  }

  /**
   * Get a specific series by its ticker.
   *
   * @param ticker - The series ticker (e.g., 'KXBTC', 'KXETH')
   * @returns The series data
   *
   * @example
   * ```typescript
   * const series = await dflow.series.getSeriesByTicker('KXBTC');
   * console.log(`${series.title}`);
   * console.log(`Category: ${series.category}`);
   * console.log(`Tags: ${series.tags.join(', ')}`);
   * ```
   */
  async getSeriesByTicker(ticker: string): Promise<Series> {
    return this.http.get<Series>(`/series/${ticker}`);
  }
}
