import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class ActivityApiModule {
  constructor(private client: ApiClient) {}

  /** 获取所有用户行为（分页、筛选、排序） */
  async getActivities(params?: types.paths['/v1/activities']['get']['parameters']['query']): Promise<types.paths['/v1/activities']['get']['responses']['200']> {
    return this.client.get('/activities', { params });
  }

  /** 获取单个用户行为详情 */
  async getActivityById(id: string): Promise<any> {
    // /v1/activity/{id} 没有详细返回类型定义，暂用any
    return this.client.get(`/activity/${id}`);
  }

  // ...可继续补充用户行为相关API
} 