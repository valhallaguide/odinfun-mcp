import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class SnapshotApiModule {
  constructor(private client: ApiClient) {}

  /** 创建Token分享快照 */
  async createTokenShareSnapshot(id: string, show_balance: boolean, body: types.components['schemas']['CreateTokenShareSnapshotDto']): Promise<types.components['schemas']['SnapshotEntity']> {
    return this.client.post(`/snapshot/token/${id}/share?show_balance=${show_balance}`, body);
  }

  /** 创建Token PnL快照 */
  async createTokenPnlSnapshot(id: string, format?: 'percent' | 'amount'): Promise<types.components['schemas']['SnapshotEntity']> {
    const url = format ? `/snapshot/token/${id}/pnl/${format}` : `/snapshot/token/${id}/pnl`;
    return this.client.post(url);
  }

  /** 保存快照 */
  async saveSnapshot(id: string): Promise<types.components['schemas']['SnapshotEntity']> {
    return this.client.post(`/snapshot/${id}/save`);
  }

  /** 获取快照图片（返回二进制流） */
  async getSnapshotImage(id: string): Promise<Blob> {
    return this.client.get(`/snapshot/${id}/image`, { responseType: 'blob' });
  }

  // ...可继续补充快照相关API
} 