import type { HttpClient } from '../../utils/http.js';
import type { LiveData, LiveDataResponse, LiveDataFilterParams } from '../../types/index.js';

/**
 * API for retrieving real-time milestone and progress data.
 *
 * Live data provides real-time updates on event milestones and progress
 * indicators that can affect market outcomes. These endpoints relay
 * data directly from the Kalshi API.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Get live data for specific milestones
 * const data = await dflow.liveData.getLiveData(['milestone1', 'milestone2']);
 *
 * // Get live data for an event
 * const eventData = await dflow.liveData.getLiveDataByEvent('BTCD-25DEC0313');
 * ```
 */
export class LiveDataAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get live data for specific milestones.
   *
   * Relays live data from the Kalshi API for one or more milestones.
   *
   * @param milestoneIds - Array of milestone identifiers to fetch (max 100)
   * @returns Array of live data for the requested milestones
   *
   * @example
   * ```typescript
   * const data = await dflow.liveData.getLiveData(['milestone-1', 'milestone-2']);
   * data.forEach(d => console.log(`${d.milestones[0]?.name}: ${d.milestones[0]?.value}`));
   * ```
   */
  async getLiveData(milestoneIds: string[]): Promise<LiveData[]> {
    const response = await this.http.get<LiveDataResponse>('/live_data', {
      milestoneIds,
    });
    return response.data;
  }

  /**
   * Get live data for an event by its ticker.
   *
   * Fetches all live data for an event by automatically looking up all related
   * milestones and batching the live data requests. Supports all milestone filtering options.
   *
   * @param eventTicker - The event ticker
   * @param params - Optional filter parameters
   * @param params.minimumStartDate - Minimum start date to filter milestones (RFC3339 format)
   * @param params.category - Filter by milestone category
   * @param params.competition - Filter by competition
   * @param params.sourceId - Filter by source ID
   * @param params.type - Filter by milestone type
   * @returns Live data for the event
   *
   * @example
   * ```typescript
   * // Get all live data for an event
   * const data = await dflow.liveData.getLiveDataByEvent('BTCD-25DEC0313');
   *
   * // Filter by category
   * const sportsData = await dflow.liveData.getLiveDataByEvent('SPORTS-EVENT', {
   *   category: 'sports',
   *   competition: 'NFL',
   * });
   * ```
   */
  async getLiveDataByEvent(
    eventTicker: string,
    params?: LiveDataFilterParams
  ): Promise<LiveData> {
    return this.http.get<LiveData>(`/live_data/by-event/${eventTicker}`, params);
  }

  /**
   * Get live data for a market by mint address.
   *
   * Looks up the event ticker from a market mint address, then fetches all live data
   * for that event. Supports all milestone filtering options.
   *
   * @param mintAddress - Market mint address (ledger or outcome mint)
   * @param params - Optional filter parameters
   * @param params.minimumStartDate - Minimum start date to filter milestones (RFC3339 format)
   * @param params.category - Filter by milestone category
   * @param params.competition - Filter by competition
   * @param params.sourceId - Filter by source ID
   * @param params.type - Filter by milestone type
   * @returns Live data for the market
   *
   * @example
   * ```typescript
   * const data = await dflow.liveData.getLiveDataByMint('EPjFWdd5...');
   *
   * // With filters
   * const filteredData = await dflow.liveData.getLiveDataByMint('EPjFWdd5...', {
   *   type: 'price',
   * });
   * ```
   */
  async getLiveDataByMint(
    mintAddress: string,
    params?: LiveDataFilterParams
  ): Promise<LiveData> {
    return this.http.get<LiveData>(`/live_data/by-mint/${mintAddress}`, params);
  }
}
