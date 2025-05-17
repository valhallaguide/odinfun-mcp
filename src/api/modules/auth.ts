// src/api/modules/auth.ts - Authentication related API module
import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';
// import type { AuthParams, UserLoginResponseData, UserLogoutResponseData } from '../core/types.js';

/**
 * Handles authentication-related API calls.
 * Currently, odinfunapi.json does not specify dedicated auth endpoints (e.g., login, logout).
 * Authentication (principal, token) is handled per-request by ApiClient.
 * This module is a placeholder for potential future auth-specific functionalities.
 */
export class AuthApiModule {
  constructor(private client: ApiClient) {}

  /**
   * 获取认证令牌
   * 对应 POST /auth/token
   * @param authRequest 包含用户名和密码的认证请求
   * @returns 包含访问令牌的响应，或在错误时返回null
   */
  async getAuthToken(authRequest: types.components['schemas']['AuthenticateDto']): Promise<types.components['schemas']['AuthJwtResponse'] | null> {
    try {
      const data = await this.client.post<types.components['schemas']['AuthJwtResponse']>('/auth', authRequest);
      return data;
    } catch (error) {
      console.error('[AuthApiModule] 获取认证令牌时出错:', error);
      return null;
    }
  }

  /** 用户认证（登录） */
  async authenticate(body: types.components['schemas']['AuthenticateDto']): Promise<types.components['schemas']['AuthJwtResponse']> {
    return this.client.post('/auth', body);
  }

  /** 检查认证状态（获取当前用户principal） */
  async checkAuth(): Promise<string> {
    return this.client.get('/auth');
  }

  /** 刷新认证Token */
  async refreshAuth(): Promise<types.components['schemas']['AuthJwtResponse']> {
    return this.client.post('/auth/refresh');
  }

  // Example placeholder for a login function if it were to be added:
  /*
  async login(credentials: { username: string, password_hash: string }): Promise<UserLoginResponseData | null> {
    // Assuming an endpoint like /auth/login
    // return this.client.post<UserLoginResponseData>('/auth/login', credentials);
    console.log('AuthApiModule.login called with:', credentials, 'But no actual endpoint is defined.');
    return Promise.resolve(null); 
  }
  */

  // Example placeholder for a logout function:
  /*
  async logout(authParams: AuthParams): Promise<UserLogoutResponseData | null> {
    // Assuming an endpoint like /auth/logout
    // return this.client.post<UserLogoutResponseData>('/auth/logout', {}, authParams);
    console.log('AuthApiModule.logout called with:', authParams, 'But no actual endpoint is defined.');
    return Promise.resolve(null);
  }
  */

  // Add other authentication-related methods here if the API expands.

  async login(authRequest: any): Promise<any> {
    const data = await this.client.post('/auth', authRequest);
    return data;
  }

  async register(body: any): Promise<any> {
    return this.client.post('/auth', body);
  }

  async getAuthInfo(): Promise<any> {
    return this.client.get('/auth');
  }

  async refreshToken(): Promise<any> {
    return this.client.post('/auth/refresh');
  }
} 