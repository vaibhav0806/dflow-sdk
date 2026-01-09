import type { HttpClient } from '../../utils/http.js';
import type { Series, SeriesResponse } from '../../types/index.js';

/**
 * API for retrieving series/category information.
 *
 * Series group related events together (e.g., all Bitcoin price events,
 * all election events). Use series to browse events by category.
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
   * Get all available series.
   *
   * @returns Array of all series
   *
   * @example
   * ```typescript
   * const series = await dflow.series.getSeries();
   * series.forEach(s => console.log(`${s.ticker}: ${s.name}`));
   * ```
   */
  async getSeries(): Promise<Series[]> {
    const response = await this.http.get<SeriesResponse>('/series');
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
   * console.log(`${series.name}: ${series.description}`);
   * ```
   */
  async getSeriesByTicker(ticker: string): Promise<Series> {
    return this.http.get<Series>(`/series/${ticker}`);
  }
}
