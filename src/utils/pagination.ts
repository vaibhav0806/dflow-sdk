import type { PaginationParams } from '../types/common.js';

/**
 * Generic paginated response type that works with various API responses.
 * Supports both `data` field and custom field names like `markets`, `events`, etc.
 */
export interface PaginatedResult<T> {
  cursor?: string;
  items: T[];
}

export interface PaginateOptions<TResponse, TItem> {
  /** Maximum number of items to fetch in total (default: unlimited) */
  maxItems?: number;
  /** Number of items per page (default: API default, usually 50) */
  pageSize?: number;
  /**
   * Function to extract items array from response.
   * Required because different APIs use different field names (markets, events, data, etc.)
   */
  getItems: (response: TResponse) => TItem[];
  /** Function to extract cursor from response (default: response.cursor) */
  getCursor?: (response: TResponse) => string | undefined;
}

/**
 * Create an async iterator that automatically paginates through all results.
 *
 * @example
 * ```typescript
 * import { paginate } from 'dflow-sdk';
 *
 * // Iterate through all markets
 * for await (const market of paginate(
 *   (params) => dflow.markets.getMarkets(params),
 *   { getItems: (r) => r.markets }
 * )) {
 *   console.log(market.ticker, market.yesPrice);
 * }
 *
 * // Iterate through all events
 * for await (const event of paginate(
 *   (params) => dflow.events.getEvents({ ...params, status: 'active' }),
 *   { getItems: (r) => r.events, maxItems: 100 }
 * )) {
 *   console.log(event.title);
 * }
 * ```
 *
 * @param fetchPage - Function that fetches a page given pagination params
 * @param options - Pagination options including item extractor
 * @yields Individual items from each page
 */
export async function* paginate<TResponse extends { cursor?: string }, TItem>(
  fetchPage: (params: PaginationParams) => Promise<TResponse>,
  options: PaginateOptions<TResponse, TItem>
): AsyncGenerator<TItem, void, undefined> {
  const { maxItems, pageSize, getItems, getCursor = (r) => r.cursor } = options;

  let cursor: string | undefined;
  let itemsYielded = 0;

  do {
    const response = await fetchPage({
      cursor,
      limit: pageSize,
    });

    const items = getItems(response);
    for (const item of items) {
      yield item;
      itemsYielded++;

      if (maxItems !== undefined && itemsYielded >= maxItems) {
        return;
      }
    }

    cursor = getCursor(response);
  } while (cursor);
}

/**
 * Collect all items from a paginated endpoint into an array.
 *
 * @example
 * ```typescript
 * import { collectAll } from 'dflow-sdk';
 *
 * // Get all markets as an array
 * const allMarkets = await collectAll(
 *   (params) => dflow.markets.getMarkets(params),
 *   { getItems: (r) => r.markets }
 * );
 *
 * console.log(`Found ${allMarkets.length} markets`);
 *
 * // With a limit
 * const first100 = await collectAll(
 *   (params) => dflow.events.getEvents(params),
 *   { getItems: (r) => r.events, maxItems: 100 }
 * );
 * ```
 *
 * @param fetchPage - Function that fetches a page given pagination params
 * @param options - Pagination options including item extractor
 * @returns Array of all items
 */
export async function collectAll<TResponse extends { cursor?: string }, TItem>(
  fetchPage: (params: PaginationParams) => Promise<TResponse>,
  options: PaginateOptions<TResponse, TItem>
): Promise<TItem[]> {
  const items: TItem[] = [];

  for await (const item of paginate(fetchPage, options)) {
    items.push(item);
  }

  return items;
}

/**
 * Count total items from a paginated endpoint without storing them.
 *
 * @example
 * ```typescript
 * import { countAll } from 'dflow-sdk';
 *
 * const totalMarkets = await countAll(
 *   (params) => dflow.markets.getMarkets(params),
 *   { getItems: (r) => r.markets }
 * );
 *
 * console.log(`Total markets: ${totalMarkets}`);
 * ```
 *
 * @param fetchPage - Function that fetches a page given pagination params
 * @param options - Pagination options including item extractor
 * @returns Total count of items
 */
export async function countAll<TResponse extends { cursor?: string }, TItem>(
  fetchPage: (params: PaginationParams) => Promise<TResponse>,
  options: PaginateOptions<TResponse, TItem>
): Promise<number> {
  let count = 0;

  for await (const _ of paginate(fetchPage, options)) {
    count++;
  }

  return count;
}

/**
 * Find the first item matching a predicate from a paginated endpoint.
 *
 * @example
 * ```typescript
 * import { findFirst } from 'dflow-sdk';
 *
 * // Find a specific market by title
 * const market = await findFirst(
 *   (params) => dflow.markets.getMarkets(params),
 *   { getItems: (r) => r.markets },
 *   (m) => m.title.includes('Bitcoin')
 * );
 *
 * if (market) {
 *   console.log('Found:', market.ticker);
 * }
 * ```
 *
 * @param fetchPage - Function that fetches a page given pagination params
 * @param options - Pagination options including item extractor
 * @param predicate - Function to test each item
 * @returns The first matching item, or undefined if not found
 */
export async function findFirst<TResponse extends { cursor?: string }, TItem>(
  fetchPage: (params: PaginationParams) => Promise<TResponse>,
  options: PaginateOptions<TResponse, TItem>,
  predicate: (item: TItem) => boolean
): Promise<TItem | undefined> {
  for await (const item of paginate(fetchPage, options)) {
    if (predicate(item)) {
      return item;
    }
  }

  return undefined;
}
