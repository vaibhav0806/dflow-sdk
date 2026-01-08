import type { HttpClient } from '../../utils/http.js';
import type { LiveData, LiveDataResponse } from '../../types/index.js';

export class LiveDataAPI {
  constructor(private http: HttpClient) {}

  async getLiveData(milestones: string[]): Promise<LiveData[]> {
    const response = await this.http.get<LiveDataResponse>('/live_data', {
      milestones: milestones.join(','),
    });
    return response.data;
  }

  async getLiveDataByEvent(eventTicker: string): Promise<LiveData> {
    return this.http.get<LiveData>(`/live_data/by-event/${eventTicker}`);
  }

  async getLiveDataByMint(mintAddress: string): Promise<LiveData> {
    return this.http.get<LiveData>(`/live_data/by-mint/${mintAddress}`);
  }
}
