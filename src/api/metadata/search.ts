import type { HttpClient } from '../../utils/http.js';
import type { SearchParams, SearchResult } from '../../types/index.js';

export class SearchAPI {
  constructor(private http: HttpClient) {}

  async search(params: SearchParams): Promise<SearchResult> {
    return this.http.get<SearchResult>('/search', {
      q: params.query,
      limit: params.limit,
    });
  }
}
