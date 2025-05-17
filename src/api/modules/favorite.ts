import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class FavoriteApiModule {
  constructor(private client: ApiClient) {}

  /** 添加Token到收藏 */
  async addFavorite(id: string): Promise<any> {
    return this.client.post(`/token/${id}/favorite`);
  }

  /** 从收藏移除Token */
  async removeFavorite(id: string): Promise<any> {
    return this.client.delete(`/token/${id}/favorite`);
  }

  /** 获取用户收藏的Token */
  async getUserTokenFavorites(principal: string, params?: types.paths['/v1/user/{principal}/token/favorites']['get']['parameters']['query']): Promise<types.paths['/v1/user/{principal}/token/favorites']['get']['responses']['200']> {
    return this.client.get(`/user/${principal}/token/favorites`, { params });
  }

  // ...可继续补充收藏相关API
} 