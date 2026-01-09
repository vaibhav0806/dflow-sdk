import type { HttpClient } from '../../utils/http.js';
import type {
  PredictionMarketInitParams,
  PredictionMarketInitResponse,
} from '../../types/index.js';
import { USDC_MINT } from '../../utils/constants.js';

/**
 * API for initializing new prediction markets.
 *
 * Create new prediction markets on-chain. This initializes the market
 * accounts and creates YES/NO outcome token mints.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient({ environment: 'production', apiKey: 'your-key' });
 *
 * const init = await dflow.predictionMarket.initializeMarket({
 *   marketTicker: 'MY-MARKET-TICKER',
 *   userPublicKey: wallet.publicKey.toBase58(),
 * });
 *
 * console.log(`YES mint: ${init.yesMint}`);
 * console.log(`NO mint: ${init.noMint}`);
 * // Sign and send init.transaction to create the market
 * ```
 */
export class PredictionMarketAPI {
  constructor(private http: HttpClient) {}

  /**
   * Initialize a new prediction market.
   *
   * Creates a new prediction market with YES and NO outcome tokens.
   * The returned transaction must be signed and sent to complete
   * market creation.
   *
   * @param params - Market initialization parameters
   * @param params.marketTicker - Unique ticker for the new market
   * @param params.userPublicKey - The creator's Solana wallet public key
   * @param params.settlementMint - Token mint for settlement (defaults to USDC)
   * @returns Initialization response with transaction and mint addresses
   *
   * @example
   * ```typescript
   * import { USDC_MINT } from 'dflow-sdk';
   *
   * const init = await dflow.predictionMarket.initializeMarket({
   *   marketTicker: 'BTCPRICE-25DEC-100K',
   *   userPublicKey: wallet.publicKey.toBase58(),
   *   settlementMint: USDC_MINT, // Optional, defaults to USDC
   * });
   *
   * // Sign and send the initialization transaction
   * const result = await signSendAndConfirm(connection, init.transaction, keypair);
   *
   * // Store the mint addresses for trading
   * console.log(`Market created!`);
   * console.log(`YES token: ${init.yesMint}`);
   * console.log(`NO token: ${init.noMint}`);
   * ```
   */
  async initializeMarket(params: PredictionMarketInitParams): Promise<PredictionMarketInitResponse> {
    return this.http.get<PredictionMarketInitResponse>('/prediction-market-init', {
      marketTicker: params.marketTicker,
      userPublicKey: params.userPublicKey,
      settlementMint: params.settlementMint ?? USDC_MINT,
    });
  }
}
