// src/api/core/ApiClient.ts - Core HTTP client for Odin.fun API
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  token?: string;
  timeout?: number;
}

export class ApiError extends Error {
  constructor(message: string, public code?: number, public status?: number, public responseData?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
    });

    // 请求拦截器：自动加 token
    this.axiosInstance.interceptors.request.use((request) => {
      if (config.token) {
        request.headers = request.headers || {};
        request.headers['Authorization'] = `Bearer ${config.token}`;
      }
      return request;
    });
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.axiosInstance.get<T>(url, config);
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.axiosInstance.post<T>(url, data, config);
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.axiosInstance.patch<T>(url, data, config);
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.axiosInstance.delete<T>(url, config);
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  private handleError(err: any): never {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message || err.message);
    }
    throw err;
  }
} 