export interface PaginatedResponse<T> {
  cursor?: string;
  data: T[];
}

export interface PaginationParams {
  cursor?: string;
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

export type CandlestickPeriod = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
