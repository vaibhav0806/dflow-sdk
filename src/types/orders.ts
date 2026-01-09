export type ExecutionMode = 'sync' | 'async';
export type OrderStatusType = 'open' | 'closed' | 'failed' | 'pendingClose';

export interface OrderParams {
  inputMint: string;
  outputMint: string;
  amount: number | string;
  slippageBps: number;
  userPublicKey: string;
  platformFeeBps?: number;
  platformFeeAccount?: string;
}

export interface OrderResponse {
  transaction: string;
  inAmount: string;
  outAmount: string;
  executionMode: ExecutionMode;
  priceImpactPct?: number;
}

export interface OrderStatusResponse {
  status: OrderStatusType;
  signature: string;
  inAmount?: string;
  outAmount?: string;
  fills?: OrderFill[];
  error?: string;
}

export interface OrderFill {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  price: number;
  timestamp: string;
}

export interface QuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number | string;
  slippageBps?: number;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan?: RoutePlanStep[];
}

export interface RoutePlanStep {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

export interface SwapParams extends QuoteParams {
  userPublicKey: string;
  wrapUnwrapSol?: boolean;
  priorityFee?: PriorityFeeConfig;
}

export interface SwapResponse {
  swapTransaction: string;
  lastValidBlockHeight?: number;
  prioritizationFeeLamports?: number;
  computeUnitLimit?: number;
  prioritizationType?: string;
  quote?: SwapQuote;
}

export interface SwapInstructionsResponse {
  setupInstructions: SerializedInstruction[];
  swapInstruction: SerializedInstruction;
  cleanupInstruction?: SerializedInstruction;
  addressLookupTableAddresses: string[];
}

export interface SerializedInstruction {
  programId: string;
  accounts: {
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }[];
  data: string;
}

export interface IntentQuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number | string;
  mode: 'ExactIn' | 'ExactOut';
}

export interface IntentQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  minOutAmount: string;
  maxInAmount: string;
  expiresAt: string;
}

export interface SubmitIntentParams {
  userPublicKey: string;
  inputMint: string;
  outputMint: string;
  amount: number | string;
  mode: 'ExactIn' | 'ExactOut';
  slippageBps?: number;
  priorityFee?: PriorityFeeConfig;
}

export interface IntentResponse {
  transaction: string;
  intentId: string;
  quote: IntentQuote;
}

export interface PriorityFeeConfig {
  type: 'exact' | 'max';
  amount: number;
}

export interface PredictionMarketInitParams {
  marketTicker: string;
  userPublicKey: string;
  settlementMint?: string;
}

export interface PredictionMarketInitResponse {
  transaction: string;
  yesMint: string;
  noMint: string;
}
