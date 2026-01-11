/**
 * Taker side of a trade - which side took the trade.
 */
export type TakerSide = 'yes' | 'no';

/**
 * Trade data returned from the API.
 */
export interface Trade {
  /** Unique trade identifier */
  tradeId: string;
  /** Market ticker this trade occurred in */
  ticker: string;
  /** Which side (yes/no) the taker was on */
  takerSide: TakerSide;
  /** Trade price (in cents, 0-100) */
  price: number;
  /** YES price (in cents, 0-100) */
  yesPrice: number;
  /** NO price (in cents, 0-100) */
  noPrice: number;
  /** YES price in dollars as string */
  yesPriceDollars: string;
  /** NO price in dollars as string */
  noPriceDollars: string;
  /** Number of contracts traded */
  count: number;
  /** Creation timestamp (Unix timestamp in seconds) */
  createdTime: number;
}

/**
 * Parameters for fetching trades.
 */
export interface TradesParams {
  /** Maximum number of trades to return (1-1000, default 100) */
  limit?: number;
  /** Pagination cursor (trade ID) to start from */
  cursor?: string;
  /** Filter by market ticker */
  ticker?: string;
  /** Filter trades after this Unix timestamp */
  minTs?: number;
  /** Filter trades before this Unix timestamp */
  maxTs?: number;
}

/**
 * Parameters for fetching trades by mint (excluding ticker since it's derived from mint).
 */
export interface TradesByMintParams {
  /** Maximum number of trades to return (1-1000, default 100) */
  limit?: number;
  /** Pagination cursor (trade ID) to start from */
  cursor?: string;
  /** Filter trades after this Unix timestamp */
  minTs?: number;
  /** Filter trades before this Unix timestamp */
  maxTs?: number;
}

/**
 * Response from the trades endpoint.
 */
export interface TradesResponse {
  /** Pagination cursor for next page (trade ID) */
  cursor?: string | null;
  /** Array of trades */
  trades: Trade[];
}
