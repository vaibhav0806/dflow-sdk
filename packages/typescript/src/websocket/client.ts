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

/**
 * WebSocket client for real-time price, trade, and orderbook updates.
 *
 * Provides streaming market data with automatic reconnection support.
 * Subscribe to specific markets or all markets for each data channel.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Connect to WebSocket
 * await dflow.ws.connect();
 *
 * // Subscribe to price updates for specific markets
 * dflow.ws.subscribePrices(['BTCD-25DEC0313-T92749.99']);
 *
 * // Handle price updates
 * const unsubscribe = dflow.ws.onPrice((update) => {
 *   console.log(`${update.ticker}: YES=${update.yesPrice} NO=${update.noPrice}`);
 * });
 *
 * // Later: cleanup
 * unsubscribe(); // Remove callback
 * dflow.ws.disconnect(); // Close connection
 * ```
 */
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

  /**
   * Create a new WebSocket client.
   *
   * @param options - WebSocket configuration options
   * @param options.url - Custom WebSocket URL (defaults to DFlow WebSocket)
   * @param options.reconnect - Whether to auto-reconnect on disconnect (default: true)
   * @param options.reconnectInterval - Milliseconds between reconnect attempts (default: 5000)
   * @param options.maxReconnectAttempts - Max reconnection attempts (default: 10)
   */
  constructor(options?: WebSocketOptions) {
    this.url = options?.url ?? WEBSOCKET_URL;
    this.reconnect = options?.reconnect ?? true;
    this.reconnectInterval = options?.reconnectInterval ?? 5000;
    this.maxReconnectAttempts = options?.maxReconnectAttempts ?? 10;
  }

  /**
   * Connect to the WebSocket server.
   *
   * Must be called before subscribing to any channels.
   * Resolves when connection is established.
   *
   * @returns Promise that resolves when connected
   * @throws Error if connection fails
   *
   * @example
   * ```typescript
   * await dflow.ws.connect();
   * console.log('Connected!', dflow.ws.isConnected);
   * ```
   */
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

  /**
   * Disconnect from the WebSocket server.
   *
   * Disables auto-reconnect and closes the connection.
   *
   * @example
   * ```typescript
   * dflow.ws.disconnect();
   * ```
   */
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

  /**
   * Subscribe to price updates for specific markets.
   *
   * @param tickers - Array of market tickers to subscribe to
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * dflow.ws.subscribePrices(['BTCD-25DEC0313-T92749.99', 'ETHD-25DEC0313']);
   * ```
   */
  subscribePrices(tickers: string[]): void {
    this.send({ type: 'subscribe', channel: 'prices', tickers });
  }

  /**
   * Subscribe to price updates for all markets.
   *
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * dflow.ws.subscribeAllPrices();
   * ```
   */
  subscribeAllPrices(): void {
    this.send({ type: 'subscribe', channel: 'prices', all: true });
  }

  /**
   * Subscribe to trade updates for specific markets.
   *
   * @param tickers - Array of market tickers to subscribe to
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * dflow.ws.subscribeTrades(['BTCD-25DEC0313-T92749.99']);
   * ```
   */
  subscribeTrades(tickers: string[]): void {
    this.send({ type: 'subscribe', channel: 'trades', tickers });
  }

  /**
   * Subscribe to trade updates for all markets.
   *
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * dflow.ws.subscribeAllTrades();
   * ```
   */
  subscribeAllTrades(): void {
    this.send({ type: 'subscribe', channel: 'trades', all: true });
  }

  /**
   * Subscribe to orderbook updates for specific markets.
   *
   * @param tickers - Array of market tickers to subscribe to
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * dflow.ws.subscribeOrderbook(['BTCD-25DEC0313-T92749.99']);
   * ```
   */
  subscribeOrderbook(tickers: string[]): void {
    this.send({ type: 'subscribe', channel: 'orderbook', tickers });
  }

  /**
   * Subscribe to orderbook updates for all markets.
   *
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * dflow.ws.subscribeAllOrderbook();
   * ```
   */
  subscribeAllOrderbook(): void {
    this.send({ type: 'subscribe', channel: 'orderbook', all: true });
  }

  /**
   * Unsubscribe from a channel.
   *
   * @param channel - The channel to unsubscribe from ('prices', 'trades', or 'orderbook')
   * @param tickers - Optional specific tickers to unsubscribe. If omitted, unsubscribes from all.
   * @throws Error if WebSocket is not connected
   *
   * @example
   * ```typescript
   * // Unsubscribe from specific markets
   * dflow.ws.unsubscribe('prices', ['BTCD-25DEC0313-T92749.99']);
   *
   * // Unsubscribe from all on a channel
   * dflow.ws.unsubscribe('trades');
   * ```
   */
  unsubscribe(channel: WebSocketChannel, tickers?: string[]): void {
    if (tickers) {
      this.send({ type: 'unsubscribe', channel, tickers });
    } else {
      this.send({ type: 'unsubscribe', channel, all: true });
    }
  }

  /**
   * Register a callback for price updates.
   *
   * @param callback - Function called when a price update is received
   * @returns Unsubscribe function to remove the callback
   *
   * @example
   * ```typescript
   * const unsubscribe = dflow.ws.onPrice((update) => {
   *   console.log(`${update.ticker}: YES=${update.yesPrice} NO=${update.noPrice}`);
   * });
   *
   * // Later: remove callback
   * unsubscribe();
   * ```
   */
  onPrice(callback: MessageCallback<PriceUpdate>): () => void {
    this.priceCallbacks.push(callback);
    return () => {
      this.priceCallbacks = this.priceCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Register a callback for trade updates.
   *
   * @param callback - Function called when a trade update is received
   * @returns Unsubscribe function to remove the callback
   *
   * @example
   * ```typescript
   * const unsubscribe = dflow.ws.onTrade((trade) => {
   *   console.log(`Trade: ${trade.side} ${trade.amount} @ ${trade.price}`);
   * });
   *
   * // Later: remove callback
   * unsubscribe();
   * ```
   */
  onTrade(callback: MessageCallback<TradeUpdate>): () => void {
    this.tradeCallbacks.push(callback);
    return () => {
      this.tradeCallbacks = this.tradeCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Register a callback for orderbook updates.
   *
   * @param callback - Function called when an orderbook update is received
   * @returns Unsubscribe function to remove the callback
   *
   * @example
   * ```typescript
   * const unsubscribe = dflow.ws.onOrderbook((book) => {
   *   console.log(`${book.ticker}: Bid=${book.yesBid} Ask=${book.yesAsk}`);
   * });
   *
   * // Later: remove callback
   * unsubscribe();
   * ```
   */
  onOrderbook(callback: MessageCallback<OrderbookUpdate>): () => void {
    this.orderbookCallbacks.push(callback);
    return () => {
      this.orderbookCallbacks = this.orderbookCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Register a callback for WebSocket errors.
   *
   * @param callback - Function called when an error occurs
   * @returns Unsubscribe function to remove the callback
   *
   * @example
   * ```typescript
   * const unsubscribe = dflow.ws.onError((error) => {
   *   console.error('WebSocket error:', error.message);
   * });
   * ```
   */
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Register a callback for WebSocket close events.
   *
   * @param callback - Function called when the connection closes
   * @returns Unsubscribe function to remove the callback
   *
   * @example
   * ```typescript
   * const unsubscribe = dflow.ws.onClose((event) => {
   *   console.log('WebSocket closed:', event.code, event.reason);
   * });
   * ```
   */
  onClose(callback: CloseCallback): () => void {
    this.closeCallbacks.push(callback);
    return () => {
      this.closeCallbacks = this.closeCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Check if the WebSocket is currently connected.
   *
   * @returns true if connected, false otherwise
   *
   * @example
   * ```typescript
   * if (dflow.ws.isConnected) {
   *   dflow.ws.subscribePrices(['BTCD-25DEC0313-T92749.99']);
   * }
   * ```
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
