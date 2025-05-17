import { ServerTransport } from "@modelcontextprotocol/sdk/server/transport.js";
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { Transport } from "@modelcontextprotocol/sdk/transport.js";
import { logger } from '../utils/logger.js';

export class StreamableServerTransport implements ServerTransport, Transport {
  public readonly sessionId: string;
  private response: Response;
  private messageQueue: any[] = [];
  private isConnected: boolean = false;
  private messageCallback: ((message: any) => void) | null = null;

  constructor(private messageEndpoint: string, res: Response) {
    this.sessionId = uuidv4();
    this.response = res;
    
    // Set streaming response headers
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    this.isConnected = true;
  }

  async start(): Promise<void> {
    // No special startup logic needed for streaming
    return Promise.resolve();
  }

  async send(message: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Transport is not connected');
    }

    try {
      // Convert message to NDJSON format and send
      const jsonMessage = JSON.stringify(message);
      this.response.write(jsonMessage + '\n');
      
      // Use write callback to ensure message is sent
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
      logger.error('Error sending message:', error);
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
        logger.error('Error handling message:', error);
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