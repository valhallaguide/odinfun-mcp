import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class CommentsApiModule {
  constructor(private client: ApiClient) {}

  /** 获取Token评论 */
  async getTokenComments(id: string, params?: types.paths['/v1/token/{id}/comments']['get']['parameters']['query']): Promise<types.paths['/v1/token/{id}/comments']['get']['responses']['200']> {
    return this.client.get(`/token/${id}/comments`, { params });
  }

  /** 获取Token社区评论 */
  async getTokenCommunityComments(id: string, params?: types.paths['/v1/token/{id}/community-comments']['get']['parameters']['query']): Promise<types.paths['/v1/token/{id}/community-comments']['get']['responses']['200']> {
    return this.client.get(`/token/${id}/community-comments`, { params });
  }

  /** 新增Token评论 */
  async postTokenComment(id: string, body: types.components['schemas']['CreateTokenCommentBodyDto']): Promise<types.components['schemas']['CommentEntity']> {
    return this.client.post(`/token/${id}/comment`, body);
  }

  /** 置顶评论 */
  async pinComment(token: string, comment: string): Promise<any> {
    return this.client.post(`/token/${token}/comment/${comment}/pin`);
  }

  /** 取消置顶评论 */
  async unpinComment(token: string, comment: string): Promise<any> {
    return this.client.post(`/token/${token}/comment/${comment}/unpin`);
  }

  /** 点赞/取消点赞评论 */
  async commentAction(tokenId: string, id: string, action: string): Promise<any> {
    return this.client.post(`/token/${tokenId}/comment/${id}/${action}`);
  }

  async deleteUpvote(tokenId: string, id: string): Promise<any> {
    return this.client.delete(`/token/${tokenId}/comment/${id}/upvote`);
  }

  // ...可继续补充评论相关API
} 