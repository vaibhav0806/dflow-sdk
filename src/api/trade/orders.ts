import type { HttpClient } from '../../utils/http.js';
import type {
  OrderParams,
  OrderResponse,
  OrderStatusResponse,
} from '../../types/index.js';

export class OrdersAPI {
  constructor(private http: HttpClient) {}

  async getOrder(params: OrderParams): Promise<OrderResponse> {
    return this.http.get<OrderResponse>('/order', {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      slippageBps: params.slippageBps,
      userPublicKey: params.userPublicKey,
      platformFeeBps: params.platformFeeBps,
      platformFeeAccount: params.platformFeeAccount,
    });
  }

  async getOrderStatus(signature: string): Promise<OrderStatusResponse> {
    return this.http.get<OrderStatusResponse>('/order-status', { signature });
  }
}
