import { ServerTransport } from "@modelcontextprotocol/sdk/server/transport.js";
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { Transport } from "@modelcontextprotocol/sdk/transport.js";

export class StreamableServerTransport implements ServerTransport, Transport {
  public readonly sessionId: string;
  private response: Response;
  private messageQueue: any[] = [];
  private isConnected: boolean = false;
  private messageCallback: ((message: any) => void) | null = null;

  constructor(private messageEndpoint: string, res: Response) {
    this.sessionId = uuidv4();
    this.response = res;
    
    // 设置流式响应头
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    this.isConnected = true;
  }

  async start(): Promise<void> {
    // 流式传输不需要特殊的启动逻辑
    return Promise.resolve();
  }

  async send(message: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Transport is not connected');
    }

    try {
      // 将消息转换为 NDJSON 格式并发送
      const jsonMessage = JSON.stringify(message);
      this.response.write(jsonMessage + '\n');
      
      // 使用 write 的回调来确保消息被发送
      await new Promise<void>((resolve, reject) => {
        this.response.write('', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  onMessage(callback: (message: any) => void): void {
    this.messageCallback = callback;
  }

  async handlePostMessage(req: Request, res: Response, message: any): Promise<void> {
    if (!this.isConnected) {
      res.status(400).json({ error: 'Transport is not connected' });
      return;
    }

    if (this.messageCallback) {
      try {
        await this.messageCallback(message);
        res.status(200).json({ status: 'ok' });
      } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(400).json({ error: 'No message handler registered' });
    }
  }

  async close(): Promise<void> {
    if (this.isConnected) {
      this.isConnected = false;
      return new Promise<void>((resolve) => {
        this.response.end(() => {
          resolve();
        });
      });
    }
    return Promise.resolve();
  }
} 