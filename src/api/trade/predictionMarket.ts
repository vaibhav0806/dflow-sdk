import type { HttpClient } from '../../utils/http.js';
import type {
  PredictionMarketInitParams,
  PredictionMarketInitResponse,
} from '../../types/index.js';
import { USDC_MINT } from '../../utils/constants.js';

export class PredictionMarketAPI {
  constructor(private http: HttpClient) {}

  async initializeMarket(params: PredictionMarketInitParams): Promise<PredictionMarketInitResponse> {
    return this.http.get<PredictionMarketInitResponse>('/prediction-market-init', {
      marketTicker: params.marketTicker,
      userPublicKey: params.userPublicKey,
      settlementMint: params.settlementMint ?? USDC_MINT,
    });
  }
}
