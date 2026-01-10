import type { HttpClient } from '../../utils/http.js';
import type {
  QuoteParams,
  SwapQuote,
  SwapParams,
  SwapResponse,
  SwapInstructionsResponse,
} from '../../types/index.js';

/**
 * API for imperative swap operations with route preview.
 *
 * The Swap API provides a two-step process: first get a quote to preview
 * the trade, then create a swap transaction. This gives you control over
 * trade execution and allows displaying quotes to users before committing.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Step 1: Get a quote
 * const quote = await dflow.swap.getQuote({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 1000000,
 * });
 * console.log(`You'll receive: ${quote.outAmount} tokens`);
 *
 * // Step 2: Create and execute swap
 * const swap = await dflow.swap.createSwap({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 1000000,
 *   slippageBps: 50,
 *   userPublicKey: wallet.publicKey.toBase58(),
 * });
 * ```
 */
export class SwapAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get a quote for a swap without creating a transaction.
   *
   * Use this to preview trade amounts before committing. The quote
   * shows expected input/output amounts and price impact.
   *
   * @param params - Quote parameters
   * @param params.inputMint - The mint address of the token to sell
   * @param params.outputMint - The mint address of the token to buy
   * @param params.amount - The amount to trade in base units
   * @param params.slippageBps - Optional slippage tolerance in basis points
   * @returns Quote with expected amounts and route information
   *
   * @example
   * ```typescript
   * const quote = await dflow.swap.getQuote({
   *   inputMint: USDC_MINT,
   *   outputMint: market.accounts.usdc.yesMint,
   *   amount: 1000000, // 1 USDC
   *   slippageBps: 50,
   * });
   *
   * console.log(`Input: ${quote.inAmount}`);
   * console.log(`Output: ${quote.outAmount}`);
   * console.log(`Price impact: ${quote.priceImpactPct}%`);
   * ```
   */
  async getQuote(params: QuoteParams): Promise<SwapQuote> {
    return this.http.get<SwapQuote>('/quote', {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      slippageBps: params.slippageBps,
    });
  }

  /**
   * Create a swap transaction ready for signing.
   *
   * Combines getting a quote and creating a transaction in one call.
   * Returns a base64-encoded transaction that can be signed and sent.
   *
   * @param params - Swap parameters
   * @param params.inputMint - The mint address of the token to sell
   * @param params.outputMint - The mint address of the token to buy
   * @param params.amount - The amount to trade in base units
   * @param params.slippageBps - Slippage tolerance in basis points
   * @param params.userPublicKey - The user's Solana wallet public key
   * @param params.wrapUnwrapSol - Whether to wrap/unwrap SOL automatically
   * @param params.priorityFee - Optional priority fee configuration
   * @returns Swap response with transaction and quote details
   *
   * @example
   * ```typescript
   * const swap = await dflow.swap.createSwap({
   *   inputMint: USDC_MINT,
   *   outputMint: market.accounts.usdc.yesMint,
   *   amount: 1000000,
   *   slippageBps: 50,
   *   userPublicKey: wallet.publicKey.toBase58(),
   *   wrapUnwrapSol: true,
   *   priorityFee: { type: 'exact', amount: 10000 },
   * });
   *
   * // Sign and send the transaction
   * const result = await signSendAndConfirm(connection, swap.transaction, keypair);
   * ```
   */
  async createSwap(params: SwapParams): Promise<SwapResponse> {
    // First get a quote
    const quoteResponse = await this.getQuote({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      slippageBps: params.slippageBps,
    });

    // Then create the swap with the quote response
    return this.http.post<SwapResponse>('/swap', {
      quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapUnwrapSol: params.wrapUnwrapSol,
      priorityFee: params.priorityFee,
    });
  }

  /**
   * Get swap instructions for custom transaction composition.
   *
   * Instead of a complete transaction, returns individual instructions
   * that can be combined with other instructions in a custom transaction.
   * Useful for advanced use cases like atomic multi-step operations.
   *
   * @param params - Swap parameters (same as {@link createSwap})
   * @returns Instructions and accounts for building a custom transaction
   *
   * @example
   * ```typescript
   * const instructions = await dflow.swap.getSwapInstructions({
   *   inputMint: USDC_MINT,
   *   outputMint: yesMint,
   *   amount: 1000000,
   *   slippageBps: 50,
   *   userPublicKey: wallet.publicKey.toBase58(),
   * });
   *
   * // Build a custom transaction with these instructions
   * const tx = new Transaction();
   * instructions.instructions.forEach(ix => tx.add(ix));
   * ```
   */
  async getSwapInstructions(params: SwapParams): Promise<SwapInstructionsResponse> {
    // First get a quote
    const quoteResponse = await this.getQuote({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      slippageBps: params.slippageBps,
    });

    // Then get instructions with the quote response
    return this.http.post<SwapInstructionsResponse>('/swap-instructions', {
      quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapUnwrapSol: params.wrapUnwrapSol,
      priorityFee: params.priorityFee,
    });
  }
}
