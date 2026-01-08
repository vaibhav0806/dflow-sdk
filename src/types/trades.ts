import type { PaginationParams } from './common.js';

export type TradeSide = 'yes' | 'no';
export type TradeAction = 'buy' | 'sell';

export interface Trade {
  id: string;
  marketTicker: string;
  side: TradeSide;
  action: TradeAction;
  price: number;
  quantity: number;
  timestamp: string;
  takerAddress?: string;
  makerAddress?: string;
}

export interface TradesParams extends PaginationParams {
  marketTicker?: string;
  startTimestamp?: string;
  endTimestamp?: string;
}

export interface TradesResponse {
  cursor?: string;
  trades: Trade[];
}
