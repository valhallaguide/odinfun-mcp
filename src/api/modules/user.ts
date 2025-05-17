// src/api/modules/user.ts - User related API module
import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

/**
 * 处理用户相关的API调用
 */
export class UserApiModule {
  constructor(private client: ApiClient) {}

  /**
   * 获取用户列表
   * 对应 GET /users
   * @param options 可选参数，包括limit和offset
   * @returns 用户列表，或在错误时返回null
   */
  async getUsers(params?: types.paths['/v1/users']['get']['parameters']['query']): Promise<types.paths['/v1/users']['get']['responses']['200']> {
    return this.client.get('/users', { params });
  }

  /**
   * 通过ID获取用户
   * 对应 GET /users/{userId}
   * @param userId 要获取的用户ID
   * @returns 用户信息，或在错误时返回null
   */
  async getUserById(userId: string): Promise<types.components['schemas']['UserEntity'] | null> {
    try {
      const data = await this.client.get<types.components['schemas']['UserEntity']>(`/users/${userId}`);
      return data;
    } catch (error) {
      console.error('[UserApiModule] 获取用户时出错:', error);
      return null;
    }
  }

  /** 获取单个用户详情 */
  async getUserByPrincipal(principal: string): Promise<any> {
    return this.client.get(`/user/${principal}`);
  }

  /** 获取用户持有的Token */
  async getUserTokens(principal: string, params?: types.paths['/v1/user/{principal}/tokens']['get']['parameters']['query']): Promise<types.paths['/v1/user/{principal}/tokens']['get']['responses']['200']> {
    return this.client.get(`/user/${principal}/tokens`, { params });
  }

  /** 获取用户创建的Token */
  async getUserCreatedTokens(principal: string, params?: types.paths['/v1/user/{principal}/created']['get']['parameters']['query']): Promise<types.paths['/v1/user/{principal}/created']['get']['responses']['200']> {
    return this.client.get(`/user/${principal}/created`, { params });
  }

  /** 获取用户余额 */
  async getUserBalances(principal: string, params?: types.paths['/v1/user/{principal}/balances']['get']['parameters']['query']): Promise<types.paths['/v1/user/{principal}/balances']['get']['responses']['200']> {
    return this.client.get(`/user/${principal}/balances`, { params });
  }

  /** 获取用户活动 */
  async getUserActivity(principal: string, params?: types.paths['/v1/user/{principal}/activity']['get']['parameters']['query']): Promise<types.paths['/v1/user/{principal}/activity']['get']['responses']['200']> {
    return this.client.get(`/user/${principal}/activity`, { params });
  }

  /** 获取用户成就 */
  async getUserAchievements(principal: string): Promise<types.paths['/v1/user/{principal}/achievements']['get']['responses']['default']> {
    return this.client.get(`/user/${principal}/achievements`);
  }

  /** 获取用户统计 */
  async getUserStats(principal: string): Promise<types.paths['/v1/user/{principal}/stats']['get']['responses']['default']> {
    return this.client.get(`/user/${principal}/stats`);
  }

  async getUserTokenFavorites(principal: string, params?: types.paths['/v1/user/{principal}/token/favorites']['get']['parameters']['query']): Promise<types.paths['/v1/user/{principal}/token/favorites']['get']['responses']['200']> {
    return this.client.get(`/user/${principal}/token/favorites`, { params });
  }

  // ...可继续补充用户相关API
} 