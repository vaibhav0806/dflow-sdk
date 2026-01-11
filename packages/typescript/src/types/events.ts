import type { Market, MarketStatus } from './markets.js';
import type { PaginationParams, SortField } from './common.js';

/**
 * Settlement source information for an event.
 */
export interface SettlementSource {
  /** Name of the settlement source */
  name: string;
  /** URL of the settlement source */
  url: string;
}

/**
 * Event data returned from the API.
 */
export interface Event {
  /** Unique ticker identifier for the event */
  ticker: string;
  /** Title of the event */
  title: string;
  /** Subtitle of the event */
  subtitle: string;
  /** Series ticker this event belongs to */
  seriesTicker: string;
  /** Competition name (optional) */
  competition?: string | null;
  /** Competition scope (optional) */
  competitionScope?: string | null;
  /** URL to the event image (optional) */
  imageUrl?: string | null;
  /** Total liquidity in the event (optional) */
  liquidity?: number | null;
  /** Markets within this event (only included when withNestedMarkets is true) */
  markets?: Market[] | null;
  /** Open interest in the event (optional) */
  openInterest?: number | null;
  /** Settlement sources for the event (optional) */
  settlementSources?: SettlementSource[] | null;
  /** Strike date timestamp in seconds (optional) */
  strikeDate?: number | null;
  /** Strike period description (optional) */
  strikePeriod?: string | null;
  /** Total volume traded (optional) */
  volume?: number | null;
  /** 24-hour trading volume (optional) */
  volume24h?: number | null;
}

/**
 * Parameters for fetching events.
 */
export interface EventsParams extends PaginationParams {
  /** Filter events by market status */
  status?: MarketStatus;
  /** 
   * Filter by series tickers (comma-separated list, max 25).
   * Example: "KXBTC,KXETH"
   */
  seriesTickers?: string;
  /** Include nested markets in response */
  withNestedMarkets?: boolean;
  /** Filter events that are initialized (have a corresponding market ledger) */
  isInitialized?: boolean;
  /** Sort field for results */
  sort?: SortField;
}

/**
 * Response from the events endpoint.
 */
export interface EventsResponse {
  /** Pagination cursor for next page (number of events to skip) */
  cursor?: number | null;
  /** Array of events */
  events: Event[];
}

/**
 * Parameters for fetching forecast percentile history.
 */
export interface ForecastHistoryParams {
  /** 
   * Comma-separated list of percentile values (0-10000, max 10 values).
   * Example: "2500,5000,7500" for 25th, 50th, 75th percentiles
   */
  percentiles: string;
  /** Start timestamp for the range (Unix timestamp in seconds) */
  startTs: number;
  /** End timestamp for the range (Unix timestamp in seconds) */
  endTs: number;
  /** Period interval in minutes (0, 1, 60, or 1440) */
  periodInterval: number;
}

/**
 * Forecast history point data.
 */
export interface ForecastHistoryPoint {
  /** Timestamp of the data point */
  timestamp: number;
  /** YES price at this point */
  yesPrice: number;
  /** NO price at this point */
  noPrice: number;
  /** Percentile value (optional) */
  percentile?: number;
}

/**
 * Forecast history response.
 * Note: This endpoint relays the response directly from the Kalshi API.
 */
export interface ForecastHistory {
  /** Event ticker */
  eventTicker: string;
  /** Array of historical forecast data points */
  history: ForecastHistoryPoint[];
}
