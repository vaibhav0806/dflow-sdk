import type { HttpClient } from '../../utils/http.js';
import type { SearchParams, SearchResult } from '../../types/index.js';

/**
 * API for searching events and markets.
 *
 * Full-text search across events and markets by keywords.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const results = await dflow.search.search({ query: 'bitcoin' });
 * console.log(`Found ${results.events.length} events`);
 * ```
 */
export class SearchAPI {
  constructor(private http: HttpClient) {}

  /**
   * Search for events and markets by keyword.
   *
   * @param params - Search parameters
   * @param params.query - The search query string
   * @param params.limit - Maximum number of results to return
   * @returns Search results containing matching events and markets
   *
   * @example
   * ```typescript
   * // Search for Bitcoin-related markets
   * const results = await dflow.search.search({ query: 'bitcoin', limit: 20 });
   *
   * results.events.forEach(event => {
   *   console.log(`Event: ${event.title}`);
   * });
   *
   * results.markets.forEach(market => {
   *   console.log(`Market: ${market.title}`);
   * });
   * ```
   */
  async search(params: SearchParams): Promise<SearchResult> {
    return this.http.get<SearchResult>('/search', {
      q: params.query,
      limit: params.limit,
    });
  }
}
