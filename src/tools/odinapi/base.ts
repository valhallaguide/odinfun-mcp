import { z } from "zod";
import { OdinFunService } from '../../api/OdinFunService.js';
import { ODIN_API_BASE_URL } from '../../api/core/constants.js';

// Base tool registry class
export class OdinApiToolRegistry {
  protected service: OdinFunService;
  protected server: any;

  constructor(server: any) {
    this.server = server;
    this.service = new OdinFunService({ baseURL: ODIN_API_BASE_URL });
  }

  // Register a tool with validation
  protected registerTool(
    name: string,
    description: string,
    parameters: Record<string, z.ZodType<any, any>>,
    handler: (params: any) => Promise<any>
  ) {
    this.server.tool(
      name,
      description,
      z.object(parameters),
      async (params: any) => {
        try {
          const result = await handler(params);
          return {
            content: [{
              type: "text",
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ error: `Error in ${name}: ${errorMessage}` })
            }]
          };
        }
      }
    );
  }

  // Register all tools
  public registerAll() {
    // This will be implemented by subclasses
    throw new Error("registerAll must be implemented by subclasses");
  }
}

// Common response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Common parameter types
export const commonParams = {
  page: z.number().optional().describe("Page number for pagination"),
  limit: z.number().optional().describe("Number of items per page"),
  sort: z.string().optional().describe("Sort field and direction (e.g., 'price:desc')")
};

// Common error handling
export class OdinApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'OdinApiError';
  }
}

// Price conversion utilities
export const priceUtils = {
  async convertToUSD(sats: number, btcPrice: number): Promise<number> {
    return (sats * btcPrice) / 100000000;
  },

  async convertToSats(usd: number, btcPrice: number): Promise<number> {
    return (usd * 100000000) / btcPrice;
  }
}; 