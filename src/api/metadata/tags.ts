import type { HttpClient } from '../../utils/http.js';
import type { CategoryTags } from '../../types/index.js';

export class TagsAPI {
  constructor(private http: HttpClient) {}

  async getTagsByCategories(): Promise<CategoryTags> {
    return this.http.get<CategoryTags>('/tags_by_categories');
  }
}
