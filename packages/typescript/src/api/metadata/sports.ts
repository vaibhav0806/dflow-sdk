import type { HttpClient } from '../../utils/http.js';
import type { FiltersBySportsResponse } from '../../types/index.js';

/**
 * API for retrieving sports-specific filters.
 *
 * Get available filters for sports-related prediction markets,
 * including scopes and competitions for each sport.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const { filtersBySports, sportOrdering } = await dflow.sports.getFiltersBySports();
 * sportOrdering.forEach(sport => {
 *   console.log(`${sport}: ${filtersBySports[sport]?.competitions?.join(', ')}`);
 * });
 * ```
 */
export class SportsAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get all available sports filters.
   *
   * Returns filtering options available for each sport, including scopes and competitions.
   *
   * @returns Sports filters organized by sport with ordering
   *
   * @example
   * ```typescript
   * const { filtersBySports, sportOrdering } = await dflow.sports.getFiltersBySports();
   *
   * // Iterate in order
   * sportOrdering.forEach(sport => {
   *   const filters = filtersBySports[sport];
   *   console.log(`${sport}:`);
   *   console.log(`  Competitions: ${filters?.competitions?.join(', ')}`);
   *   console.log(`  Scopes: ${filters?.scopes?.join(', ')}`);
   * });
   * ```
   */
  async getFiltersBySports(): Promise<FiltersBySportsResponse> {
    return this.http.get<FiltersBySportsResponse>('/filters_by_sports');
  }
}
