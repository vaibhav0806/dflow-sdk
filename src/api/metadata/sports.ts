import type { HttpClient } from '../../utils/http.js';
import type { SportsFilters } from '../../types/index.js';

export class SportsAPI {
  constructor(private http: HttpClient) {}

  async getFiltersBySports(): Promise<SportsFilters> {
    return this.http.get<SportsFilters>('/filters_by_sports');
  }
}
