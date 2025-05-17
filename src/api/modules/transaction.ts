import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class TransactionApiModule {
  constructor(private client: ApiClient) {}

  /** 获取所有交易明细（分页、筛选、排序） */
  async getTransactions(params?: types.paths['/v1/transactions']['get']['parameters']['query']): Promise<types.paths['/v1/transactions']['get']['responses']['200']> {
    return this.client.get('/transactions', { params });
  }

  /** 获取单个交易明细 */
  async getTransactionById(id: string): Promise<any> {
    // /v1/transaction/{id} 没有详细返回类型定义，暂用any
    return this.client.get(`/transaction/${id}`);
  }

  // ...可继续补充交易明细相关API
} 