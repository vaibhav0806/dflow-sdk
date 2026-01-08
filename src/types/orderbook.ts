export interface OrderbookLevel {
  price: number;
  quantity: number;
}

export interface Orderbook {
  marketTicker: string;
  timestamp: number;
  yesAsk: OrderbookLevel[];
  yesBid: OrderbookLevel[];
  noAsk: OrderbookLevel[];
  noBid: OrderbookLevel[];
}
