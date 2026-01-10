import type { PaginationParams } from './common.js';

export type MarketStatus =
  | 'initialized'
  | 'active'
  | 'inactive'
  | 'closed'
  | 'determined'
  | 'finalized';

export type MarketResult = 'yes' | 'no' | '';

export type RedemptionStatus = 'open' | 'closed';

export interface MarketAccount {
  yesMint: string;
  noMint: string;
  marketLedger: string;
  redemptionStatus: RedemptionStatus;
  scalarOutcomePct?: number;
}

export interface Market {
  ticker: string;
  title: string;
  subtitle?: string;
  eventTicker: string;
  status: MarketStatus;
  result: MarketResult;
  yesPrice?: number;
  noPrice?: number;
  volume?: number;
  volume24h?: number;
  openInterest?: number;
  liquidity?: number;
  openTime?: string;
  closeTime?: string;
  expirationTime?: string;
  accounts: Record<string, MarketAccount>;
  rules?: string;
}

export interface MarketsParams extends PaginationParams {
  status?: MarketStatus;
  eventTicker?: string;
  seriesTicker?: string;
}

export interface MarketsResponse {
  cursor?: string;
  markets: Market[];
}

export interface MarketsBatchParams {
  tickers?: string[];
  mints?: string[];
}

export interface MarketsBatchResponse {
  markets: Market[];
}

export interface OutcomeMintsResponse {
  outcomeMints: string[];
}

export interface FilterOutcomeMintsParams {
  addresses: string[];
}

export interface FilterOutcomeMintsResponse {
  outcomeMints: string[];
}
