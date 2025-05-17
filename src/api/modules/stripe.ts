import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class StripeApiModule {
  constructor(private client: ApiClient) {}

  /** 创建Stripe支付会话 */
  async createSession(): Promise<types.components['schemas']['StripeCreateSessionResponse']> {
    return this.client.post('/stripe/session');
  }

  // ...可继续补充Stripe相关API
} 