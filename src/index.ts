export { DFlowClient, type DFlowClientOptions } from './client.js';

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
  METADATA_API_BASE_URL,
  TRADE_API_BASE_URL,
  WEBSOCKET_URL,
  DEV_METADATA_API_BASE_URL,
  DEV_TRADE_API_BASE_URL,
  DEV_WEBSOCKET_URL,
  USDC_MINT,
  SOL_MINT,
  DEFAULT_SLIPPAGE_BPS,
  MAX_BATCH_SIZE,
  MAX_FILTER_ADDRESSES,
  OUTCOME_TOKEN_DECIMALS,
} from './utils/constants.js';

export type * from './types/index.js';
