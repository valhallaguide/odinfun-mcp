import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class TokenApiModule {
  constructor(private client: ApiClient) {}

  /**
   * Get token by ID
   * @param tokenId - Token ID
   * @param includeHolders - Whether to include holder information
   */
  async getTokenById(tokenId: string, includeHolders: boolean = false): Promise<any> {
    const response = await this.client.get(`/token/${tokenId}`, {
      params: { include_holders: includeHolders }
    });
    return response;
  }

  /**
   * Get token list with optional filters
   * @param params - Query parameters
   */
  async getTokens(params: any = {}): Promise<any> {
    const response = await this.client.get('/tokens', { params });
    return response;
  }

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

  /** 获取Token持有者 */
  async getTokenOwners(id: string, params?: types.paths['/v1/token/{id}/owners']['get']['parameters']['query']): Promise<types.paths['/v1/token/{id}/owners']['get']['responses']['200']> {
    return this.client.get(`/token/${id}/owners`, { params });
  }

  /** 获取Token流动性提供者 */
  async getTokenLiquidity(id: string, params?: types.paths['/v1/token/{id}/liquidity']['get']['parameters']['query']): Promise<types.paths['/v1/token/{id}/liquidity']['get']['responses']['200']> {
    return this.client.get(`/token/${id}/liquidity`, { params });
  }

  /** 获取Token交易记录 */
  async getTokenTrades(id: string, params?: types.paths['/v1/token/{id}/trades']['get']['parameters']['query']): Promise<types.paths['/v1/token/{id}/trades']['get']['responses']['200']> {
    return this.client.get(`/token/${id}/trades`, { params });
  }

  /** 获取Token K线数据 */
  async getTokenFeed(id: string, params?: types.paths['/v1/token/{id}/feed']['get']['parameters']['query']): Promise<types.components['schemas']['TokenFeedEntity'][]> {
    return this.client.get(`/token/${id}/feed`, { params });
  }

  /** 获取Token TradingView K线数据 */
  async getTokenTradingViewFeed(id: string, params?: types.paths['/v1/token/{id}/tv_feed']['get']['parameters']['query']): Promise<types.components['schemas']['TokenFeedEntity'][]> {
    return this.client.get(`/token/${id}/tv_feed`, { params });
  }

  /** 获取Token图片（返回二进制流） */
  async getTokenImage(id: string): Promise<Blob> {
    // 这里返回Blob，调用方可自行处理
    return this.client.get(`/token/${id}/image`, { responseType: 'blob' });
  }

  // ...可继续补充token相关API
} 