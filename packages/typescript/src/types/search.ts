import type { Event } from './events.js';
import type { SortField, SortOrder } from './common.js';

/**
 * Parameters for searching events.
 */
export interface SearchParams {
  /** The query string to search for (required) */
  query: string;
  /** Field to sort by */
  sort?: SortField;
  /** How to order the results */
  order?: SortOrder;
  /** How many records to limit the results to */
  limit?: number;
  /** Cursor for pagination */
  cursor?: number;
  /** Include nested markets in response */
  withNestedMarkets?: boolean;
  /** Include market account information (settlement mints and redemption status) */
  withMarketAccounts?: boolean;
}

/**
 * Response from the search endpoint.
 */
export interface SearchResult {
  /** Pagination cursor for next page */
  cursor: number;
  /** Array of events matching the search query */
  events: Event[];
}
