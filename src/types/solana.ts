import type { Market } from './markets.js';

export type PositionType = 'YES' | 'NO' | 'UNKNOWN';

export interface TokenBalance {
  mint: string;
  rawBalance: string;
  balance: number;
  decimals: number;
}

export interface UserPosition {
  mint: string;
  balance: number;
  decimals: number;
  position: PositionType;
  market: Market | null;
}

export interface RedemptionResult {
  signature: string;
  inputAmount: string;
  outputAmount: string;
  outcomeMint: string;
  settlementMint: string;
}

export interface TransactionConfirmation {
  signature: string;
  slot: number;
  confirmationStatus: 'processed' | 'confirmed' | 'finalized';
  err: unknown | null;
}
