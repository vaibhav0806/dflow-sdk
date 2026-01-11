import type { HttpClient } from '../../utils/http.js';
import type { CategoryTags, TagsByCategoriesResponse } from '../../types/index.js';

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
 * console.log(Object.keys(tags)); // List of categories
 * ```
 */
export class TagsAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get all tags organized by category.
   *
   * Returns a mapping of series categories to their associated tags.
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
    const response = await this.http.get<TagsByCategoriesResponse>('/tags_by_categories');
    return response.tagsByCategories;
  }
}
