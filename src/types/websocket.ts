export type WebSocketChannel = 'prices' | 'trades' | 'orderbook';

export interface WebSocketSubscribeMessage {
  type: 'subscribe';
  channel: WebSocketChannel;
  all?: boolean;
  tickers?: string[];
}

export interface WebSocketUnsubscribeMessage {
  type: 'unsubscribe';
  channel: WebSocketChannel;
  all?: boolean;
  tickers?: string[];
}

export type WebSocketMessage = WebSocketSubscribeMessage | WebSocketUnsubscribeMessage;

export interface PriceUpdate {
  channel: 'prices';
  ticker: string;
  timestamp: number;
  yesPrice: number;
  noPrice: number;
  yesBid?: number;
  yesAsk?: number;
  noBid?: number;
  noAsk?: number;
}

export interface TradeUpdate {
  channel: 'trades';
  ticker: string;
  timestamp: number;
  side: 'yes' | 'no';
  price: number;
  quantity: number;
  tradeId: string;
}

export interface OrderbookUpdate {
  channel: 'orderbook';
  ticker: string;
  timestamp: number;
  yesAsk: Array<{ price: number; quantity: number }>;
  yesBid: Array<{ price: number; quantity: number }>;
  noAsk: Array<{ price: number; quantity: number }>;
  noBid: Array<{ price: number; quantity: number }>;
}

export type WebSocketUpdate = PriceUpdate | TradeUpdate | OrderbookUpdate;

export interface WebSocketOptions {
  url?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}
