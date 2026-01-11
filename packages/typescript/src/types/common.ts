export interface PaginatedResponse<T> {
  cursor?: number;
  data: T[];
}

export interface PaginationParams {
  cursor?: number;
  limit?: number;
}

export interface Candlestick {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Period interval in minutes for candlesticks.
 * Valid values: 1 (1 minute), 60 (1 hour), 1440 (1 day)
 */
export type CandlestickPeriodInterval = 1 | 60 | 1440;

/**
 * Parameters for fetching candlestick data.
 */
export interface CandlestickParams {
  /** Start timestamp (Unix timestamp in seconds) */
  startTs: number;
  /** End timestamp (Unix timestamp in seconds) */
  endTs: number;
  /** Time period length of each candlestick in minutes (1, 60, or 1440) */
  periodInterval: CandlestickPeriodInterval;
}

/**
 * Sort options for events and markets.
 */
export type SortField =
  | 'volume'
  | 'volume_24h'
  | 'liquidity'
  | 'open_interest'
  | 'start_date'
  | 'score';

/**
 * Sort order direction.
 */
export type SortOrder = 'asc' | 'desc';
