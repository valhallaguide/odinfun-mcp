import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class SettingsApiModule {
  constructor(private client: ApiClient) {}

  /** 获取平台设置 */
  async getSettings(): Promise<types.components['schemas']['SettingEntity']> {
    return this.client.get('/settings');
  }

  // ...可继续补充设置相关API
} 