/**
 * Tags organized by category.
 */
export interface CategoryTags {
  [category: string]: string[];
}

/**
 * Response from the tags by categories endpoint.
 */
export interface TagsByCategoriesResponse {
  /** Tags grouped by their categories */
  tagsByCategories: CategoryTags;
}

/**
 * Sports filter data - filtering options for each sport.
 */
export interface SportFilterData {
  /** Available scopes for this sport */
  scopes?: string[];
  /** Available competitions for this sport */
  competitions?: string[];
}

/**
 * Sports filters organized by sport name.
 */
export interface FiltersBySports {
  [sportName: string]: SportFilterData;
}

/**
 * Response from the filters by sports endpoint.
 */
export interface FiltersBySportsResponse {
  /** Filters organized by sports */
  filtersBySports: FiltersBySports;
  /** Ordered list of sports */
  sportOrdering: string[];
}
