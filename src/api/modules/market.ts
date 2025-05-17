import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class MarketApiModule {
  constructor(private client: ApiClient) {}

  /** 获取指定币种行情信息 */
  async getCurrency(symbol: string, datetime?: string): Promise<types.components['schemas']['CurrencyEntity']> {
    return this.client.get(`/currency/${symbol}`, { params: datetime ? { datetime } : undefined });
  }

  /** 获取市场统计看板数据 */
  async getDashboardStatistics(): Promise<any> {
    // /v1/statistics/dashboard 没有详细返回类型定义，暂用any
    return this.client.get('/statistics/dashboard');
  }

  // ...可继续补充市场相关API
} 