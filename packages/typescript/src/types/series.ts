import type { MarketStatus } from './markets.js';
import type { SettlementSource } from './events.js';

/**
 * Series data returned from the API.
 * A series represents a template for recurring events.
 */
export interface Series {
  /** Unique ticker identifier for the series */
  ticker: string;
  /** Title of the series */
  title: string;
  /** Category of the series (e.g., Politics, Economics, Entertainment) */
  category: string;
  /** Tags associated with the series */
  tags: string[];
  /** Frequency of events in this series */
  frequency: string;
  /** Fee type for the series */
  feeType: string;
  /** Fee multiplier for the series */
  feeMultiplier: number;
  /** URL to the contract terms */
  contractTermsUrl: string;
  /** URL to the contract */
  contractUrl: string;
  /** Additional prohibitions */
  additionalProhibitions: string[];
  /** Settlement sources for the series */
  settlementSources: SettlementSource[];
  /** Product metadata (can be any structure) */
  productMetadata?: unknown;
}

/**
 * Parameters for fetching series.
 */
export interface SeriesParams {
  /** Filter series by category (e.g., Politics, Economics, Entertainment) */
  category?: string;
  /** Filter series by tags (comma-separated list) */
  tags?: string;
  /** Filter series that are initialized (have a corresponding market ledger) */
  isInitialized?: boolean;
  /** Filter series by market status */
  status?: MarketStatus;
}

/**
 * Response from the series endpoint.
 */
export interface SeriesResponse {
  /** Array of series */
  series: Series[];
}
