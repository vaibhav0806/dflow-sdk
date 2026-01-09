import type { HttpClient } from '../../utils/http.js';
import type { LiveData, LiveDataResponse } from '../../types/index.js';

/**
 * API for retrieving real-time milestone and progress data.
 *
 * Live data provides real-time updates on event milestones and progress
 * indicators that can affect market outcomes.
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
   * @param milestones - Array of milestone identifiers to fetch
   * @returns Array of live data for the requested milestones
   *
   * @example
   * ```typescript
   * const data = await dflow.liveData.getLiveData(['btc-price', 'eth-price']);
   * data.forEach(d => console.log(`${d.milestone}: ${d.value}`));
   * ```
   */
  async getLiveData(milestones: string[]): Promise<LiveData[]> {
    const response = await this.http.get<LiveDataResponse>('/live_data', {
      milestones: milestones.join(','),
    });
    return response.data;
  }

  /**
   * Get live data for an event by its ticker.
   *
   * @param eventTicker - The event ticker
   * @returns Live data for the event
   *
   * @example
   * ```typescript
   * const data = await dflow.liveData.getLiveDataByEvent('BTCD-25DEC0313');
   * console.log(`Current value: ${data.value}`);
   * ```
   */
  async getLiveDataByEvent(eventTicker: string): Promise<LiveData> {
    return this.http.get<LiveData>(`/live_data/by-event/${eventTicker}`);
  }

  /**
   * Get live data for a market by mint address.
   *
   * @param mintAddress - The Solana mint address of the market's outcome token
   * @returns Live data for the market
   *
   * @example
   * ```typescript
   * const data = await dflow.liveData.getLiveDataByMint('EPjFWdd5...');
   * ```
   */
  async getLiveDataByMint(mintAddress: string): Promise<LiveData> {
    return this.http.get<LiveData>(`/live_data/by-mint/${mintAddress}`);
  }
}
