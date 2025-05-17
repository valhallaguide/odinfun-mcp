// src/api/modules/auth.ts - Authentication related API module
import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';
import { logger } from '../../utils/logger.js';
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
   * Get authentication token
   * Corresponds to POST /auth/token
   * @param authRequest Authentication request containing username and password
   * @returns Response containing access token, or null on error
   */
  async getAuthToken(authRequest: types.components['schemas']['AuthenticateDto']): Promise<types.components['schemas']['AuthJwtResponse'] | null> {
    try {
      const data = await this.client.post<types.components['schemas']['AuthJwtResponse']>('/auth', authRequest);
      return data;
    } catch (error) {
      logger.error('[AuthApiModule] Error getting authentication token:', error);
      return null;
    }
  }

  /** User authentication (login) */
  async authenticate(body: types.components['schemas']['AuthenticateDto']): Promise<types.components['schemas']['AuthJwtResponse']> {
    return this.client.post('/auth', body);
  }

  /** Check authentication status (get current user principal) */
  async checkAuth(): Promise<string> {
    return this.client.get('/auth');
  }

  /** Refresh authentication token */
  async refreshAuth(): Promise<types.components['schemas']['AuthJwtResponse']> {
    return this.client.post('/auth/refresh');
  }

  // Example placeholder for a login function if it were to be added:
  /*
  async login(credentials: { username: string, password_hash: string }): Promise<UserLoginResponseData | null> {
    // Assuming an endpoint like /auth/login
    // return this.client.post<UserLoginResponseData>('/auth/login', credentials);
    logger.error('AuthApiModule.login called with:', credentials, 'But no actual endpoint is defined.');
    return Promise.resolve(null); 
  }
  */

  // Example placeholder for a logout function:
  /*
  async logout(authParams: AuthParams): Promise<UserLogoutResponseData | null> {
    // Assuming an endpoint like /auth/logout
    // return this.client.post<UserLogoutResponseData>('/auth/logout', {}, authParams);
    logger.error('AuthApiModule.logout called with:', authParams, 'But no actual endpoint is defined.');
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