import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class SearchApiModule {
  constructor(private client: ApiClient) {}

  /** 全局搜索（支持类型筛选） */
  async search(q: string, typesArr?: string[]): Promise<{ data: types.components['schemas']['SearchEntity'][] }> {
    const params: Record<string, any> = { q };
    if (typesArr) params.types = typesArr;
    return this.client.get('/search', { params });
  }

  // ...可继续补充搜索相关API
} 