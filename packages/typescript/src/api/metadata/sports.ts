import type { HttpClient } from '../../utils/http.js';
import type { SportsFilters } from '../../types/index.js';

/**
 * API for retrieving sports-specific filters.
 *
 * Get available filters for sports-related prediction markets
 * (leagues, teams, event types, etc.).
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const filters = await dflow.sports.getFiltersBySports();
 * console.log(filters.leagues);
 * ```
 */
export class SportsAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get all available sports filters.
   *
   * @returns Sports filters including leagues, teams, and event types
   *
   * @example
   * ```typescript
   * const filters = await dflow.sports.getFiltersBySports();
   * filters.leagues.forEach(league => console.log(league.name));
   * ```
   */
  async getFiltersBySports(): Promise<SportsFilters> {
    return this.http.get<SportsFilters>('/filters_by_sports');
  }
}
