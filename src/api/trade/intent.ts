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
    // First get a quote
    const quoteResponse = await this.getIntentQuote({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      mode: params.mode,
    });

    // Then submit intent with the quote response
    return this.http.post<IntentResponse>('/submit-intent', {
      quoteResponse,
      userPublicKey: params.userPublicKey,
      slippageBps: params.slippageBps,
      priorityFee: params.priorityFee,
    });
  }
}
