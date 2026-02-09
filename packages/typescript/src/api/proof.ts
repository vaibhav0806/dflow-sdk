import type { HttpClient } from '../utils/http.js';
import type { VerifyAddressResponse, DeepLinkParams } from '../types/proof.js';
import {
  PROOF_DEEP_LINK_BASE_URL,
  PROOF_SIGNATURE_MESSAGE_PREFIX,
} from '../utils/constants.js';

/**
 * API for Proof KYC verification.
 *
 * Proof is DFlow's KYC verification service. This API allows you to:
 * - Check if a wallet address has completed KYC verification
 * - Generate the message that needs to be signed for verification
 * - Build deep links for partner integration
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Check if an address is verified
 * const result = await dflow.proof.verifyAddress('7xKXtg2CW...');
 * console.log(`Verified: ${result.verified}`);
 *
 * // Generate signature message
 * const timestamp = Date.now();
 * const message = dflow.proof.generateSignatureMessage(timestamp);
 * // Sign this message with the user's wallet
 *
 * // Build deep link for verification
 * const link = dflow.proof.buildDeepLink({
 *   wallet: '7xKXtg2CW...',
 *   signature: 'signed_message_base58',
 *   timestamp,
 *   redirectUri: 'https://myapp.com/callback',
 * });
 * ```
 */
export class ProofAPI {
  constructor(private http: HttpClient) {}

  /**
   * Check if a wallet address has completed KYC verification.
   *
   * @param address - Solana wallet address to check
   * @returns Promise resolving to verification status
   *
   * @example
   * ```typescript
   * const result = await dflow.proof.verifyAddress(
   *   '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
   * );
   * if (result.verified) {
   *   console.log('User is verified!');
   * } else {
   *   console.log('User needs to complete KYC');
   * }
   * ```
   */
  async verifyAddress(address: string): Promise<VerifyAddressResponse> {
    return this.http.get<VerifyAddressResponse>(`/verify/${address}`);
  }

  /**
   * Generate the message to be signed for KYC verification.
   *
   * The user should sign this message with their wallet to prove ownership.
   * The signature is then used in the deep link for verification.
   *
   * @param timestamp - Unix timestamp in milliseconds. If not provided, uses current time.
   * @returns The message string to be signed
   *
   * @example
   * ```typescript
   * const timestamp = Date.now();
   * const message = dflow.proof.generateSignatureMessage(timestamp);
   * console.log(message); // "Proof KYC verification: 1699123456789"
   * // Now sign this message with the user's wallet
   * ```
   */
  generateSignatureMessage(timestamp?: number): string {
    const ts = timestamp ?? Date.now();
    return `${PROOF_SIGNATURE_MESSAGE_PREFIX}${ts}`;
  }

  /**
   * Build a deep link URL for the Proof KYC verification flow.
   *
   * Partners can use this to redirect users to complete KYC verification.
   * After verification, users are redirected to the specified redirectUri.
   *
   * @param params - Deep link parameters
   * @returns Complete deep link URL
   *
   * @example
   * ```typescript
   * const link = dflow.proof.buildDeepLink({
   *   wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
   *   signature: 'base58_signature_here',
   *   timestamp: 1699123456789,
   *   redirectUri: 'https://myapp.com/verification-complete',
   *   projectId: 'my-dapp',
   * });
   * console.log(link);
   * // https://dflow.net/proof?wallet=7xKXtg...&signature=...&...
   * ```
   */
  buildDeepLink(params: DeepLinkParams): string {
    const searchParams = new URLSearchParams({
      wallet: params.wallet,
      signature: params.signature,
      timestamp: String(params.timestamp),
      redirect_uri: params.redirectUri,
    });

    if (params.projectId) {
      searchParams.set('projectId', params.projectId);
    }

    return `${PROOF_DEEP_LINK_BASE_URL}?${searchParams.toString()}`;
  }
}
