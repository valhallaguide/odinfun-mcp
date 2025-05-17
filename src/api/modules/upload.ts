import { ApiClient } from '../core/ApiClient.js';
import * as types from '../core/types.js';

export class UploadApiModule {
  constructor(private client: ApiClient) {}

  /** 上传文件（返回上传结果） */
  async uploadFile(formData: FormData): Promise<{ data: { upload: string } }> {
    return this.client.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /** 获取上传的文件（图片流） */
  async getFile(filename: string): Promise<Blob> {
    return this.client.get(`/upload/${filename}`, { responseType: 'blob' });
  }

  // ...可继续补充上传相关API
} 