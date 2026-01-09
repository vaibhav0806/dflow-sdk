import type { HttpClient } from '../../utils/http.js';
import type {
  IntentQuoteParams,
  IntentQuote,
  SubmitIntentParams,
  IntentResponse,
} from '../../types/index.js';

/**
 * API for declarative intent-based swaps.
 *
 * Intents provide a declarative approach to trading where you specify
 * what you want (exact input or exact output) and the system handles
 * the execution details. This is useful for "sell exactly X" or
 * "buy exactly Y" scenarios.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // ExactIn: Sell exactly 1 USDC, receive variable YES tokens
 * const intent = await dflow.intent.submitIntent({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 1000000,
 *   mode: 'ExactIn',
 *   slippageBps: 50,
 *   userPublicKey: wallet.publicKey.toBase58(),
 * });
 *
 * // ExactOut: Receive exactly 100 YES tokens, pay variable USDC
 * const intent = await dflow.intent.submitIntent({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 100000000, // 100 tokens
 *   mode: 'ExactOut',
 *   slippageBps: 50,
 *   userPublicKey: wallet.publicKey.toBase58(),
 * });
 * ```
 */
export class IntentAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get a quote for an intent-based swap.
   *
   * Preview what you'll receive (ExactIn) or what you'll pay (ExactOut)
   * before submitting the intent.
   *
   * @param params - Intent quote parameters
   * @param params.inputMint - The mint address of the token to sell
   * @param params.outputMint - The mint address of the token to buy
   * @param params.amount - The exact amount (input or output based on mode)
   * @param params.mode - 'ExactIn' to specify input amount, 'ExactOut' for output amount
   * @returns Quote showing expected amounts
   *
   * @example
   * ```typescript
   * // How much YES will I get for exactly 1 USDC?
   * const quote = await dflow.intent.getIntentQuote({
   *   inputMint: USDC_MINT,
   *   outputMint: yesMint,
   *   amount: 1000000,
   *   mode: 'ExactIn',
   * });
   * console.log(`You'll receive: ${quote.outAmount} YES tokens`);
   *
   * // How much USDC do I need to get exactly 100 YES tokens?
   * const quote = await dflow.intent.getIntentQuote({
   *   inputMint: USDC_MINT,
   *   outputMint: yesMint,
   *   amount: 100000000,
   *   mode: 'ExactOut',
   * });
   * console.log(`You'll pay: ${quote.inAmount} USDC`);
   * ```
   */
  async getIntentQuote(params: IntentQuoteParams): Promise<IntentQuote> {
    return this.http.get<IntentQuote>('/intent', {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      mode: params.mode,
    });
  }

  /**
   * Submit an intent-based swap for execution.
   *
   * Creates and returns a transaction for the intent. The transaction
   * will execute the swap according to the specified mode (ExactIn/ExactOut).
   *
   * @param params - Intent submission parameters
   * @param params.inputMint - The mint address of the token to sell
   * @param params.outputMint - The mint address of the token to buy
   * @param params.amount - The exact amount (input or output based on mode)
   * @param params.mode - 'ExactIn' or 'ExactOut'
   * @param params.slippageBps - Slippage tolerance in basis points
   * @param params.userPublicKey - The user's Solana wallet public key
   * @param params.priorityFee - Optional priority fee configuration
   * @returns Intent response with transaction to sign
   *
   * @example
   * ```typescript
   * const intent = await dflow.intent.submitIntent({
   *   inputMint: USDC_MINT,
   *   outputMint: market.accounts.usdc.yesMint,
   *   amount: 1000000,
   *   mode: 'ExactIn',
   *   slippageBps: 50,
   *   userPublicKey: wallet.publicKey.toBase58(),
   * });
   *
   * // Sign and send the transaction
   * const result = await signSendAndConfirm(connection, intent.transaction, keypair);
   * ```
   */
  async submitIntent(params: SubmitIntentParams): Promise<IntentResponse> {
    // First get a quote
    const quoteResponse = await this.getIntentQuote({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      mode: params.mode,
    });

    // Then submit intent with the quote response
    return this.http.post<IntentResponse>('/submit-intent', {
      quoteResponse,
      userPublicKey: params.userPublicKey,
      slippageBps: params.slippageBps,
      priorityFee: params.priorityFee,
    });
  }
}
