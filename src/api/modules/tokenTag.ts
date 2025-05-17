import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class TokenTagApiModule {
  constructor(private client: ApiClient) {}

  /** 获取所有标签 */
  async getTags(): Promise<types.paths['/v1/tags']['get']['responses']['200']> {
    return this.client.get('/tags');
  }

  /** 新建标签 */
  async createTag(body: types.components['schemas']['CreateTagDto']): Promise<{ data: types.components['schemas']['TagEntity'] }> {
    return this.client.post('/tags', body);
  }

  /** 获取单个标签 */
  async getTagById(id: string): Promise<{ data: types.components['schemas']['TagEntity'] }> {
    return this.client.get(`/tags/${id}`);
  }

  /** 更新标签 */
  async updateTag(id: string, body: types.components['schemas']['UpdateTagDto']): Promise<{ data: types.components['schemas']['TagEntity'] }> {
    return this.client.patch(`/tags/${id}`, body);
  }

  /** 删除标签 */
  async deleteTag(id: string): Promise<{ data: types.components['schemas']['TagEntity'] }> {
    return this.client.delete(`/tags/${id}`);
  }

  /** 获取Token的所有标签 */
  async getTokenTags(id: string): Promise<{ data: types.components['schemas']['TagEntity'][] }> {
    return this.client.get(`/token/${id}/tags`);
  }

  /** 给Token添加标签 */
  async addTagToToken(id: string, tagId: string): Promise<{ success: boolean; message: string }> {
    return this.client.post(`/token/${id}/tag/${tagId}`);
  }

  /** 移除Token的标签 */
  async removeTagFromToken(id: string, tagId: string): Promise<{ success: boolean; message: string }> {
    return this.client.delete(`/token/${id}/tag/${tagId}`);
  }

  // ...可继续补充标签相关API
} 