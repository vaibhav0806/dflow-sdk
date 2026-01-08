import type { HttpClient } from '../../utils/http.js';
import type { Venue } from '../../types/index.js';

export class VenuesAPI {
  constructor(private http: HttpClient) {}

  async getVenues(): Promise<Venue[]> {
    return this.http.get<Venue[]>('/venues');
  }
}
