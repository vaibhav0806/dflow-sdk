import type {
  WebSocketOptions,
  WebSocketChannel,
  WebSocketMessage,
  PriceUpdate,
  TradeUpdate,
  OrderbookUpdate,
  WebSocketUpdate,
} from '../types/index.js';
import { WEBSOCKET_URL } from '../utils/constants.js';

type MessageCallback<T> = (data: T) => void;
type ErrorCallback = (error: Error) => void;
type CloseCallback = (event: CloseEvent) => void;

export class DFlowWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnect: boolean;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts = 0;
  private isConnecting = false;

  private priceCallbacks: MessageCallback<PriceUpdate>[] = [];
  private tradeCallbacks: MessageCallback<TradeUpdate>[] = [];
  private orderbookCallbacks: MessageCallback<OrderbookUpdate>[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private closeCallbacks: CloseCallback[] = [];

  constructor(options?: WebSocketOptions) {
    this.url = options?.url ?? WEBSOCKET_URL;
    this.reconnect = options?.reconnect ?? true;
    this.reconnectInterval = options?.reconnectInterval ?? 5000;
    this.maxReconnectAttempts = options?.maxReconnectAttempts ?? 10;
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onerror = () => {
          this.isConnecting = false;
          const error = new Error('WebSocket error');
          this.errorCallbacks.forEach((cb) => cb(error));
          reject(error);
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.closeCallbacks.forEach((cb) => cb(event));
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.reconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect(): void {
    if (!this.reconnect) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      const error = new Error('Max reconnection attempts reached');
      this.errorCallbacks.forEach((cb) => cb(error));
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect().catch(() => {
        // Reconnection failed, will retry
      });
    }, this.reconnectInterval);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data) as WebSocketUpdate;

      switch (data.channel) {
        case 'prices':
          this.priceCallbacks.forEach((cb) => cb(data as PriceUpdate));
          break;
        case 'trades':
          this.tradeCallbacks.forEach((cb) => cb(data as TradeUpdate));
          break;
        case 'orderbook':
          this.orderbookCallbacks.forEach((cb) => cb(data as OrderbookUpdate));
          break;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to parse message');
      this.errorCallbacks.forEach((cb) => cb(err));
    }
  }

  private send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    this.ws.send(JSON.stringify(message));
  }

  subscribePrices(tickers: string[]): void {
    this.send({ type: 'subscribe', channel: 'prices', tickers });
  }

  subscribeAllPrices(): void {
    this.send({ type: 'subscribe', channel: 'prices', all: true });
  }

  subscribeTrades(tickers: string[]): void {
    this.send({ type: 'subscribe', channel: 'trades', tickers });
  }

  subscribeAllTrades(): void {
    this.send({ type: 'subscribe', channel: 'trades', all: true });
  }

  subscribeOrderbook(tickers: string[]): void {
    this.send({ type: 'subscribe', channel: 'orderbook', tickers });
  }

  subscribeAllOrderbook(): void {
    this.send({ type: 'subscribe', channel: 'orderbook', all: true });
  }

  unsubscribe(channel: WebSocketChannel, tickers?: string[]): void {
    if (tickers) {
      this.send({ type: 'unsubscribe', channel, tickers });
    } else {
      this.send({ type: 'unsubscribe', channel, all: true });
    }
  }

  onPrice(callback: MessageCallback<PriceUpdate>): () => void {
    this.priceCallbacks.push(callback);
    return () => {
      this.priceCallbacks = this.priceCallbacks.filter((cb) => cb !== callback);
    };
  }

  onTrade(callback: MessageCallback<TradeUpdate>): () => void {
    this.tradeCallbacks.push(callback);
    return () => {
      this.tradeCallbacks = this.tradeCallbacks.filter((cb) => cb !== callback);
    };
  }

  onOrderbook(callback: MessageCallback<OrderbookUpdate>): () => void {
    this.orderbookCallbacks.push(callback);
    return () => {
      this.orderbookCallbacks = this.orderbookCallbacks.filter((cb) => cb !== callback);
    };
  }

  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  onClose(callback: CloseCallback): () => void {
    this.closeCallbacks.push(callback);
    return () => {
      this.closeCallbacks = this.closeCallbacks.filter((cb) => cb !== callback);
    };
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
