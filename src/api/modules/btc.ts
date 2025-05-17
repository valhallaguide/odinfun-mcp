import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class BtcApiModule {
  constructor(private client: ApiClient) {}

  /** 获取BTC地址余额 */
  async getBtcBalance(address: string): Promise<{ data: { balance: number } }> {
    return this.client.get(`/btc/balance/${address}`);
  }

  // ...可继续补充BTC相关API
} 