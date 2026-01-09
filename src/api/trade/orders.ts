import type { HttpClient } from '../../utils/http.js';
import type {
  OrderParams,
  OrderResponse,
  OrderStatusResponse,
} from '../../types/index.js';

/**
 * API for creating and tracking orders.
 *
 * Orders provide a way to get a quote and transaction for trading
 * prediction market outcome tokens. Use this for straightforward
 * order execution.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient({ environment: 'production', apiKey: 'your-key' });
 *
 * // Get an order quote and transaction
 * const order = await dflow.orders.getOrder({
 *   inputMint: USDC_MINT,
 *   outputMint: market.accounts.usdc.yesMint,
 *   amount: 1000000, // 1 USDC
 *   slippageBps: 50,
 *   userPublicKey: wallet.publicKey.toBase58(),
 * });
 *
 * // Sign and send the transaction
 * const signature = await signAndSendTransaction(connection, order.transaction, keypair);
 *
 * // Check order status
 * const status = await dflow.orders.getOrderStatus(signature);
 * ```
 */
export class OrdersAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get an order quote and transaction for a trade.
   *
   * Returns a ready-to-sign transaction for swapping tokens.
   *
   * @param params - Order parameters
   * @param params.inputMint - The mint address of the token to sell (e.g., USDC)
   * @param params.outputMint - The mint address of the token to buy (e.g., YES token)
   * @param params.amount - The amount to trade in base units (e.g., 1000000 for 1 USDC)
   * @param params.slippageBps - Maximum slippage in basis points (e.g., 50 = 0.5%)
   * @param params.userPublicKey - The user's Solana wallet public key
   * @param params.platformFeeBps - Optional platform fee in basis points
   * @param params.platformFeeAccount - Optional account to receive platform fees
   * @returns Order response with transaction and quote details
   *
   * @example
   * ```typescript
   * import { USDC_MINT } from 'dflow-sdk';
   *
   * const order = await dflow.orders.getOrder({
   *   inputMint: USDC_MINT,
   *   outputMint: market.accounts.usdc.yesMint,
   *   amount: 1000000, // 1 USDC (6 decimals)
   *   slippageBps: 50, // 0.5% slippage
   *   userPublicKey: wallet.publicKey.toBase58(),
   * });
   *
   * console.log(`Input: ${order.inAmount}, Output: ${order.outAmount}`);
   * // Sign and send order.transaction
   * ```
   */
  async getOrder(params: OrderParams): Promise<OrderResponse> {
    return this.http.get<OrderResponse>('/order', {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      slippageBps: params.slippageBps,
      userPublicKey: params.userPublicKey,
      platformFeeBps: params.platformFeeBps,
      platformFeeAccount: params.platformFeeAccount,
    });
  }

  /**
   * Check the status of a submitted order.
   *
   * Use this to track async order completion or check if an order
   * was successfully executed.
   *
   * @param signature - The transaction signature from submitting the order
   * @returns Order status ('open', 'closed', 'failed', or 'pendingClose')
   *
   * @example
   * ```typescript
   * const status = await dflow.orders.getOrderStatus(signature);
   *
   * if (status.status === 'closed') {
   *   console.log('Order completed successfully!');
   * } else if (status.status === 'failed') {
   *   console.log('Order failed');
   * } else {
   *   console.log('Order still pending...');
   * }
   * ```
   */
  async getOrderStatus(signature: string): Promise<OrderStatusResponse> {
    return this.http.get<OrderStatusResponse>('/order-status', { signature });
  }
}
