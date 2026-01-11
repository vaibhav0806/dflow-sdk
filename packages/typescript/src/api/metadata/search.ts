import type { HttpClient } from '../../utils/http.js';
import type { SearchParams, SearchResult } from '../../types/index.js';

/**
 * API for searching events and markets.
 *
 * Full-text search across events by title or ticker.
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
   * Search for events with nested markets by title or ticker.
   *
   * Returns events with nested markets which match the search query.
   *
   * @param params - Search parameters
   * @param params.query - The search query string (required)
   * @param params.sort - Field to sort by (volume, volume24h, liquidity, openInterest, startDate)
   * @param params.order - How to order the results (asc, desc)
   * @param params.limit - How many records to limit the results to
   * @param params.cursor - Cursor for pagination
   * @param params.withNestedMarkets - Include nested markets in response
   * @param params.withMarketAccounts - Include market account information
   * @returns Search results containing matching events
   *
   * @example
   * ```typescript
   * // Basic search
   * const results = await dflow.search.search({ query: 'bitcoin' });
   *
   * // Search with sorting and pagination
   * const sortedResults = await dflow.search.search({
   *   query: 'election',
   *   sort: 'volume',
   *   order: 'desc',
   *   limit: 20,
   * });
   *
   * // Include nested markets with account info
   * const detailedResults = await dflow.search.search({
   *   query: 'sports',
   *   withNestedMarkets: true,
   *   withMarketAccounts: true,
   * });
   *
   * results.events.forEach(event => {
   *   console.log(`Event: ${event.title}`);
   *   event.markets?.forEach(market => {
   *     console.log(`  Market: ${market.title}`);
   *   });
   * });
   *
   * // Paginate through results
   * if (results.cursor) {
   *   const nextPage = await dflow.search.search({
   *     query: 'bitcoin',
   *     cursor: results.cursor,
   *   });
   * }
   * ```
   */
  async search(params: SearchParams): Promise<SearchResult> {
    return this.http.get<SearchResult>('/search', {
      q: params.query,
      sort: params.sort,
      order: params.order,
      limit: params.limit,
      cursor: params.cursor,
      withNestedMarkets: params.withNestedMarkets,
      withMarketAccounts: params.withMarketAccounts,
      status: params.status,
      entityType: params.entityType,
    });
  }
}
