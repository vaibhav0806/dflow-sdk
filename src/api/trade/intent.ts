import type { HttpClient } from '../../utils/http.js';
import type {
  IntentQuoteParams,
  IntentQuote,
  SubmitIntentParams,
  IntentResponse,
} from '../../types/index.js';

export class IntentAPI {
  constructor(private http: HttpClient) {}

  async getIntentQuote(params: IntentQuoteParams): Promise<IntentQuote> {
    return this.http.get<IntentQuote>('/intent', {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      mode: params.mode,
    });
  }

  async submitIntent(params: SubmitIntentParams): Promise<IntentResponse> {
    return this.http.post<IntentResponse>('/submit-intent', {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      mode: params.mode,
      slippageBps: params.slippageBps,
      userPublicKey: params.userPublicKey,
      priorityFee: params.priorityFee,
    });
  }
}
