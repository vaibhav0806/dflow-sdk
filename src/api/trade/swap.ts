import type { HttpClient } from '../../utils/http.js';
import type {
  QuoteParams,
  SwapQuote,
  SwapParams,
  SwapResponse,
  SwapInstructionsResponse,
} from '../../types/index.js';

export class SwapAPI {
  constructor(private http: HttpClient) {}

  async getQuote(params: QuoteParams): Promise<SwapQuote> {
    return this.http.get<SwapQuote>('/quote', {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      slippageBps: params.slippageBps,
    });
  }

  async createSwap(params: SwapParams): Promise<SwapResponse> {
    // First get a quote
    const quoteResponse = await this.getQuote({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      slippageBps: params.slippageBps,
    });

    // Then create the swap with the quote response
    return this.http.post<SwapResponse>('/swap', {
      quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapUnwrapSol: params.wrapUnwrapSol,
      priorityFee: params.priorityFee,
    });
  }

  async getSwapInstructions(params: SwapParams): Promise<SwapInstructionsResponse> {
    // First get a quote
    const quoteResponse = await this.getQuote({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      slippageBps: params.slippageBps,
    });

    // Then get instructions with the quote response
    return this.http.post<SwapInstructionsResponse>('/swap-instructions', {
      quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapUnwrapSol: params.wrapUnwrapSol,
      priorityFee: params.priorityFee,
    });
  }
}
