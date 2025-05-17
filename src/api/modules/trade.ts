import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class TradeApiModule {
  constructor(private client: ApiClient) {}

  /** 获取所有交易（分页、筛选、排序） */
  async getTrades(params?: types.paths['/v1/trades']['get']['parameters']['query']): Promise<types.paths['/v1/trades']['get']['responses']['200']> {
    return this.client.get('/trades', { params });
  }

  /** 获取单个交易详情 */
  async getTradeById(id: string): Promise<any> {
    // /v1/trade/{id} 没有详细返回类型定义，暂用any
    return this.client.get(`/trade/${id}`);
  }

  // ...可继续补充交易相关API
} 