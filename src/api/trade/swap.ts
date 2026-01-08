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
    return this.http.post<SwapResponse>('/swap', {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      slippageBps: params.slippageBps,
      userPublicKey: params.userPublicKey,
      wrapUnwrapSol: params.wrapUnwrapSol,
      priorityFee: params.priorityFee,
    });
  }

  async getSwapInstructions(params: SwapParams): Promise<SwapInstructionsResponse> {
    return this.http.post<SwapInstructionsResponse>('/swap-instructions', {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      slippageBps: params.slippageBps,
      userPublicKey: params.userPublicKey,
      wrapUnwrapSol: params.wrapUnwrapSol,
      priorityFee: params.priorityFee,
    });
  }
}
