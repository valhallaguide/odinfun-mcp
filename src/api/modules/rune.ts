import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class RuneApiModule {
  constructor(private client: ApiClient) {}

  /** 获取符文详情 */
  async getRune(rune_name: string): Promise<types.components['schemas']['RuneResponseEntity']> {
    return this.client.get(`/rune/${rune_name}`);
  }

  // ...可继续补充符文相关API
} 