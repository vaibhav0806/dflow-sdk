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

export interface OHLCV {
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  open_dollars?: string;
  high_dollars?: string;
  low_dollars?: string;
  close_dollars?: string;
}

export interface PriceOHLCV extends OHLCV {
  min?: number | null;
  max?: number | null;
  mean?: number | null;
  mean_dollars?: string;
  previous?: number | null;
  previous_dollars?: string;
}

export interface MarketCandlestick {
  end_period_ts: number;
  open_interest: number;
  volume: number;
  price: PriceOHLCV;
  yes_ask?: OHLCV;
  yes_bid?: OHLCV;
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
  | 'volume24h'
  | 'liquidity'
  | 'openInterest'

/**
 * Sort order direction.
 */
export type SortOrder = 'asc' | 'desc';
