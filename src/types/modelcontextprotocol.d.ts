declare module '@modelcontextprotocol/sdk/server/transport.js' {
  export interface ServerTransport {
    readonly sessionId: string;
    send(message: any): Promise<void>;
    onMessage(callback: (message: any) => void): void;
    close(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/transport.js' {
  export interface Transport {
    readonly sessionId: string;
    start(): Promise<void>;
    send(message: any): Promise<void>;
    onMessage(callback: (message: any) => void): void;
    close(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/server/mcp.js' {
  import { Transport } from '../transport.js';
  
  export interface McpServerOptions {
    name: string;
    version: string;
  }

  export class McpServer {
    constructor(options: McpServerOptions);
    connect(transport: Transport): Promise<void>;
    tool(name: string, description: string, schema: any, handler: (params: any) => Promise<any>): void;
  }
} 