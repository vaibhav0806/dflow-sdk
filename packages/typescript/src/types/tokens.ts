export interface Token {
  mint: string;
  symbol: string;
  name: string;
  logoUri?: string;
}

export interface TokenWithDecimals extends Token {
  decimals: number;
}
