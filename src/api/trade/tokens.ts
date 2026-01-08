import type { HttpClient } from '../../utils/http.js';
import type { Token, TokenWithDecimals } from '../../types/index.js';

export class TokensAPI {
  constructor(private http: HttpClient) {}

  async getTokens(): Promise<Token[]> {
    return this.http.get<Token[]>('/tokens');
  }

  async getTokensWithDecimals(): Promise<TokenWithDecimals[]> {
    return this.http.get<TokenWithDecimals[]>('/tokens-with-decimals');
  }
}
