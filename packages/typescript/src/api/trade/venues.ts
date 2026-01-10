import type { HttpClient } from '../../utils/http.js';
import type { Venue } from '../../types/index.js';

/**
 * API for retrieving trading venue information.
 *
 * Venues represent the underlying exchanges or liquidity sources
 * where trades are executed.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const venues = await dflow.venues.getVenues();
 * venues.forEach(venue => console.log(venue.name));
 * ```
 */
export class VenuesAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get all available trading venues.
   *
   * @returns Array of venue information
   *
   * @example
   * ```typescript
   * const venues = await dflow.venues.getVenues();
   * venues.forEach(venue => {
   *   console.log(`${venue.name}: ${venue.description}`);
   * });
   * ```
   */
  async getVenues(): Promise<Venue[]> {
    return this.http.get<Venue[]>('/venues');
  }
}
