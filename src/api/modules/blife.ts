import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class BlifeApiModule {
  constructor(private client: ApiClient) {}

  /** BLIFE账户同步 */
  async sync(): Promise<any> {
    return this.client.post('/blife/sync');
  }

  // ...可继续补充BLIFE相关API
} 