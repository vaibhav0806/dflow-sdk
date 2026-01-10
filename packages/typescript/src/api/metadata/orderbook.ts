import type { HttpClient } from '../../utils/http.js';
import type { Orderbook } from '../../types/index.js';

/**
 * API for retrieving orderbook snapshots.
 *
 * The orderbook shows current bid/ask prices and quantities for YES and NO
 * outcome tokens in a market.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const orderbook = await dflow.orderbook.getOrderbook('BTCD-25DEC0313-T92749.99');
 * console.log(`YES Bid: ${orderbook.yesBid.price}, Ask: ${orderbook.yesAsk.price}`);
 * ```
 */
export class OrderbookAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get the orderbook for a market by ticker.
   *
   * @param marketTicker - The market ticker
   * @returns Orderbook with YES/NO bid and ask prices and quantities
   *
   * @example
   * ```typescript
   * const orderbook = await dflow.orderbook.getOrderbook('BTCD-25DEC0313-T92749.99');
   * console.log(`YES: Bid ${orderbook.yesBid.price} / Ask ${orderbook.yesAsk.price}`);
   * console.log(`NO:  Bid ${orderbook.noBid.price} / Ask ${orderbook.noAsk.price}`);
   * ```
   */
  async getOrderbook(marketTicker: string): Promise<Orderbook> {
    return this.http.get<Orderbook>(`/orderbook/${marketTicker}`);
  }

  /**
   * Get the orderbook for a market by mint address.
   *
   * Alternative to {@link getOrderbook} when you have the mint address.
   *
   * @param mintAddress - The Solana mint address of the market's outcome token
   * @returns Orderbook with YES/NO bid and ask prices and quantities
   *
   * @example
   * ```typescript
   * const orderbook = await dflow.orderbook.getOrderbookByMint('EPjFWdd5...');
   * ```
   */
  async getOrderbookByMint(mintAddress: string): Promise<Orderbook> {
    return this.http.get<Orderbook>(`/orderbook/by-mint/${mintAddress}`);
  }
}
