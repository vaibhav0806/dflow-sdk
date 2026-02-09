export { DFlowClient, type DFlowClientOptions, type DFlowEnvironment } from './client.js';

export { DFlowWebSocket } from './websocket/client.js';

export {
  EventsAPI,
  MarketsAPI,
  OrderbookAPI,
  TradesAPI,
  LiveDataAPI,
  SeriesAPI,
  TagsAPI,
  SportsAPI,
  SearchAPI,
} from './api/metadata/index.js';

export {
  OrdersAPI,
  SwapAPI,
  IntentAPI,
  PredictionMarketAPI,
  TokensAPI,
  VenuesAPI,
} from './api/trade/index.js';

export { ProofAPI } from './api/proof.js';

export {
  signAndSendTransaction,
  waitForConfirmation,
  signSendAndConfirm,
  getTokenBalances,
  getUserPositions,
  isRedemptionEligible,
  calculateScalarPayout,
} from './solana/index.js';

export { HttpClient, DFlowApiError } from './utils/http.js';

export {
  withRetry,
  createRetryable,
  defaultShouldRetry,
  type RetryOptions,
} from './utils/retry.js';

export {
  paginate,
  collectAll,
  countAll,
  findFirst,
  type PaginateOptions,
} from './utils/pagination.js';

export {
  METADATA_API_BASE_URL,
  DEV_METADATA_API_BASE_URL,
  TRADE_API_BASE_URL,
  DEV_TRADE_API_BASE_URL,
  WEBSOCKET_URL,
  DEV_WEBSOCKET_URL,
  PROD_METADATA_API_BASE_URL,
  PROD_TRADE_API_BASE_URL,
  PROD_WEBSOCKET_URL,
  PROOF_API_BASE_URL,
  PROOF_DEEP_LINK_BASE_URL,
  PROOF_SIGNATURE_MESSAGE_PREFIX,
  USDC_MINT,
  SOL_MINT,
  DEFAULT_SLIPPAGE_BPS,
  MAX_BATCH_SIZE,
  MAX_FILTER_ADDRESSES,
  OUTCOME_TOKEN_DECIMALS,
} from './utils/constants.js';

export type * from './types/index.js';
