import type { HttpClient } from '../../utils/http.js';
import type { Series, SeriesResponse } from '../../types/index.js';

export class SeriesAPI {
  constructor(private http: HttpClient) {}

  async getSeries(): Promise<Series[]> {
    const response = await this.http.get<SeriesResponse>('/series');
    return response.series;
  }

  async getSeriesByTicker(ticker: string): Promise<Series> {
    return this.http.get<Series>(`/series/${ticker}`);
  }
}
