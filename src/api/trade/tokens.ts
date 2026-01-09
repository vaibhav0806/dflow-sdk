import type { HttpClient } from '../../utils/http.js';
import type { Token, TokenWithDecimals } from '../../types/index.js';

/**
 * API for retrieving available token information.
 *
 * Get information about tokens supported for trading, including
 * their mint addresses and decimal precision.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Get all available tokens
 * const tokens = await dflow.tokens.getTokens();
 *
 * // Get tokens with decimal information
 * const tokensWithDecimals = await dflow.tokens.getTokensWithDecimals();
 * ```
 */
export class TokensAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get all available tokens for trading.
   *
   * @returns Array of token information
   *
   * @example
   * ```typescript
   * const tokens = await dflow.tokens.getTokens();
   * tokens.forEach(token => {
   *   console.log(`${token.symbol}: ${token.mint}`);
   * });
   * ```
   */
  async getTokens(): Promise<Token[]> {
    return this.http.get<Token[]>('/tokens');
  }

  /**
   * Get all available tokens with decimal information.
   *
   * Includes the number of decimal places for each token,
   * useful for formatting amounts correctly.
   *
   * @returns Array of tokens with decimal information
   *
   * @example
   * ```typescript
   * const tokens = await dflow.tokens.getTokensWithDecimals();
   * tokens.forEach(token => {
   *   console.log(`${token.symbol}: ${token.decimals} decimals`);
   *   // Convert 1 token to base units
   *   const baseUnits = 1 * Math.pow(10, token.decimals);
   * });
   * ```
   */
  async getTokensWithDecimals(): Promise<TokenWithDecimals[]> {
    return this.http.get<TokenWithDecimals[]>('/tokens-with-decimals');
  }
}
