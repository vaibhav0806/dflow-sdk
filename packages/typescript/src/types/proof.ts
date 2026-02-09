/**
 * Response from the Proof KYC verify endpoint.
 *
 * Indicates whether a wallet address has completed KYC verification.
 */
export interface VerifyAddressResponse {
  /** Whether the address has been verified */
  verified: boolean;
}

/**
 * Parameters for generating a Proof KYC deep link.
 *
 * Used by partners to redirect users to the Proof KYC verification flow.
 * After verification, users are redirected back to the partner's redirectUri.
 *
 * @example
 * ```typescript
 * const params: DeepLinkParams = {
 *   wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
 *   signature: 'base58_encoded_signature',
 *   timestamp: 1699123456789,
 *   redirectUri: 'https://myapp.com/callback',
 *   projectId: 'my-project',
 * };
 * ```
 */
export interface DeepLinkParams {
  /** Solana wallet address to verify */
  wallet: string;
  /** Base58 encoded signature proving wallet ownership */
  signature: string;
  /** Unix timestamp in milliseconds when the signature was created */
  timestamp: number;
  /** URL to redirect to after verification completes */
  redirectUri: string;
  /** Optional partner project identifier */
  projectId?: string;
}
