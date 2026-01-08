import type { Market } from './markets.js';
import type { PaginationParams } from './common.js';

export interface Event {
  ticker: string;
  title: string;
  subtitle?: string;
  seriesTicker: string;
  category?: string;
  mutuallyExclusive?: boolean;
  markets?: Market[];
}

export interface EventsParams extends PaginationParams {
  status?: string;
  seriesTicker?: string;
  withNestedMarkets?: boolean;
}

export interface EventsResponse {
  cursor?: string;
  events: Event[];
}

export interface ForecastHistoryPoint {
  timestamp: number;
  yesPrice: number;
  noPrice: number;
  percentile?: number;
}

export interface ForecastHistory {
  eventTicker: string;
  history: ForecastHistoryPoint[];
}
