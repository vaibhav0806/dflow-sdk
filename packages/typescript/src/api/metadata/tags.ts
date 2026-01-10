import type { HttpClient } from '../../utils/http.js';
import type { CategoryTags } from '../../types/index.js';

/**
 * API for retrieving category tags.
 *
 * Tags provide a way to categorize and filter events by topic
 * (e.g., 'crypto', 'politics', 'sports').
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const tags = await dflow.tags.getTagsByCategories();
 * console.log(tags.categories);
 * ```
 */
export class TagsAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get all tags organized by category.
   *
   * @returns Tags grouped by their categories
   *
   * @example
   * ```typescript
   * const tags = await dflow.tags.getTagsByCategories();
   * Object.entries(tags).forEach(([category, tagList]) => {
   *   console.log(`${category}: ${tagList.join(', ')}`);
   * });
   * ```
   */
  async getTagsByCategories(): Promise<CategoryTags> {
    return this.http.get<CategoryTags>('/tags_by_categories');
  }
}
