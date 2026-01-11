import type { PaginationParams, SortField } from './common.js';

/**
 * Market status values.
 */
export type MarketStatus =
  | 'initialized'
  | 'active'
  | 'inactive'
  | 'closed'
  | 'determined'
  | 'finalized';

/**
 * Market result - empty string when not yet determined.
 */
export type MarketResult = 'yes' | 'no' | '';

/**
 * Redemption status for a market.
 */
export type RedemptionStatus = 'open' | 'closed';

/**
 * Market account information including mint addresses and redemption status.
 */
export interface MarketAccount {
  /** YES outcome token mint address */
  yesMint: string;
  /** NO outcome token mint address */
  noMint: string;
  /** Market ledger address */
  marketLedger: string;
  /** Redemption status (open or closed) */
  redemptionStatus: RedemptionStatus;
  /** Scalar outcome percentage (for scalar markets) */
  scalarOutcomePct?: number;
}

/**
 * Market data returned from the API.
 * Represents a single trading instrument within an event.
 */
export interface Market {
  /** Unique ticker identifier for the market */
  ticker: string;
  /** Title of the market */
  title: string;
  /** Subtitle of the market */
  subtitle: string;
  /** Event ticker this market belongs to */
  eventTicker: string;
  /** Current market status */
  status: MarketStatus;
  /** Market result (yes, no, or empty if not determined) */
  result: MarketResult;
  /** Market type description */
  marketType: string;
  /** Subtitle for the YES outcome */
  yesSubTitle: string;
  /** Subtitle for the NO outcome */
  noSubTitle: string;
  /** Whether the market can close early */
  canCloseEarly: boolean;
  /** Primary rules for the market */
  rulesPrimary: string;
  /** Total volume traded */
  volume: number;
  /** Open interest */
  openInterest: number;
  /** Open time (Unix timestamp in seconds) */
  openTime: number;
  /** Close time (Unix timestamp in seconds) */
  closeTime: number;
  /** Expiration time (Unix timestamp in seconds) */
  expirationTime: number;
  /** Market accounts by key */
  accounts: Record<string, MarketAccount>;
  /** Secondary rules (optional) */
  rulesSecondary?: string | null;
  /** Condition for early close (optional) */
  earlyCloseCondition?: string | null;
  /** YES ask price as string (optional) */
  yesAsk?: string | null;
  /** YES bid price as string (optional) */
  yesBid?: string | null;
  /** NO ask price as string (optional) */
  noAsk?: string | null;
  /** NO bid price as string (optional) */
  noBid?: string | null;
}

/**
 * Parameters for fetching markets.
 */
export interface MarketsParams extends PaginationParams {
  /** Filter markets by status */
  status?: MarketStatus;
  /** Filter markets that are initialized (have a corresponding market ledger) */
  isInitialized?: boolean;
  /** Sort field for results */
  sort?: SortField;
}

/**
 * Response from the markets endpoint.
 */
export interface MarketsResponse {
  /** Pagination cursor for next page (number of markets to skip) */
  cursor?: number | null;
  /** Array of markets */
  markets: Market[];
}

/**
 * Parameters for batch fetching markets.
 */
export interface MarketsBatchParams {
  /** Array of market tickers to fetch */
  tickers?: string[];
  /** Array of mint addresses to fetch */
  mints?: string[];
}

/**
 * Response from the markets batch endpoint.
 */
export interface MarketsBatchResponse {
  /** Array of markets */
  markets: Market[];
  /** Pagination cursor (optional) */
  cursor?: number | null;
}

/**
 * Parameters for fetching outcome mints.
 */
export interface OutcomeMintsParams {
  /** 
   * Minimum close timestamp (Unix timestamp in seconds).
   * Only markets with close_time >= minCloseTs will be included.
   */
  minCloseTs?: number;
}

/**
 * Response from the outcome mints endpoint.
 */
export interface OutcomeMintsResponse {
  /** Array of all outcome mints from supported markets */
  mints: string[];
}

/**
 * Parameters for filtering outcome mints.
 */
export interface FilterOutcomeMintsParams {
  /** List of token addresses to filter (max 200) */
  addresses: string[];
}

/**
 * Response from the filter outcome mints endpoint.
 */
export interface FilterOutcomeMintsResponse {
  /** List of addresses that are outcome mints */
  outcomeMints: string[];
}
