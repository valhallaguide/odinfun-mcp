import { z } from "zod";
import { OdinApiToolRegistry, commonParams, priceUtils } from './base.js';
import { OdinFunService } from '../../api/OdinFunService.js';

// Define token type to include our custom fields
interface TokenWithPrice {
  id: string;
  name: string;
  price?: number;
  price_usd?: number;
  [key: string]: any; // Allow other properties from the API response
}

export class MarketTools extends OdinApiToolRegistry {
  public registerAll() {
    this.registerTokenTools();
    this.registerPriceTools();
    this.registerTradeTools();
    this.registerLiquidityTools();
  }

  private registerTokenTools() {
    // Get token information
    this.registerTool(
      "odinapi.market.token.getInfo",
      "Get detailed token information including price, volume, holders, etc.",
      {
        tokenId: z.string().describe("Token ID"),
        includePrice: z.boolean().optional().describe("Include price information (default: true)"),
        includeHolders: z.boolean().optional().describe("Include holder information (default: false)")
      },
      async (params) => {
        const token = await this.service.token.getTokenById(params.tokenId, params.includeHolders) as TokenWithPrice;
        if (params.includePrice !== false) {
          const btcPrice = await this.service.getBTCPrice();
          if (token.price && btcPrice?.amount) {
            token.price_usd = await priceUtils.convertToUSD(token.price * 0.001, btcPrice.amount);
          }
        }
        return token;
      }
    );

    // Get token list
    this.registerTool(
      "odinapi.market.token.list",
      "Get list of tokens with optional filtering and sorting",
      {
        ...commonParams,
        sortBy: z.enum(['marketcap', 'volume', 'price', 'holders']).optional()
          .describe("Sort field (marketcap, volume, price, holders)"),
        sortOrder: z.enum(['asc', 'desc']).optional()
          .describe("Sort order (asc, desc)")
      },
      async (params) => {
        // Map our sort parameters to API's expected format
        let sort: "marketcap:desc" | "marketcap:asc" | "price:desc" | "price:asc" | undefined;
        if (params.sortBy) {
          const field = params.sortBy === 'holders' ? 'holder_count' : params.sortBy;
          sort = `${field}:${params.sortOrder || 'desc'}` as any;
        }
        return await this.service.token.getTokens({
          page: params.page,
          limit: params.limit,
          sort
        });
      }
    );
  }

  private registerPriceTools() {
    // Get BTC price
    this.registerTool(
      "odinapi.market.price.getBTC",
      "Get current BTC price in USD",
      {},
      async () => {
        return await this.service.getBTCPrice();
      }
    );

    // Get token price history
    this.registerTool(
      "odinapi.market.price.getHistory",
      "Get token price history (candlestick data)",
      {
        tokenId: z.string().describe("Token ID"),
        resolution: z.enum(['1', '15', '60', '240']).describe("Candlestick resolution in minutes"),
        from: z.string().optional().describe("Start time (ISO string)"),
        to: z.string().optional().describe("End time (ISO string)"),
        count: z.number().optional().describe("Number of candles to fetch")
      },
      async (params) => {
        return await this.service.token.getTokenFeed(params.tokenId, {
          resolution: parseInt(params.resolution),
          from: params.from ? new Date(params.from).getTime() : undefined,
          to: params.to ? new Date(params.to).getTime() : undefined
        });
      }
    );
  }

  private registerTradeTools() {
    // Get token trades
    this.registerTool(
      "odinapi.market.trade.list",
      "Get list of trades for a token",
      {
        tokenId: z.string().describe("Token ID"),
        ...commonParams,
        tradeType: z.enum(['buy', 'sell', 'all']).optional()
          .describe("Filter trades by type (buy, sell, all)")
      },
      async (params) => {
        const queryParams: any = {
          token: params.tokenId,
          page: params.page,
          limit: params.limit
        };
        
        // Map trade type to API parameters
        if (params.tradeType && params.tradeType !== 'all') {
          queryParams.amount_btc_min = params.tradeType === 'buy' ? 0 : undefined;
          queryParams.amount_btc_max = params.tradeType === 'sell' ? 0 : undefined;
        }
        
        return await this.service.trade.getTrades(queryParams);
      }
    );

    // Get user trades
    this.registerTool(
      "odinapi.market.trade.getUserTrades",
      "Get trades for a specific user",
      {
        principalId: z.string().describe("User Principal ID"),
        ...commonParams,
        tokenId: z.string().optional().describe("Filter by token ID")
      },
      async (params) => {
        return await this.service.trade.getTrades({
          user: params.principalId,
          token: params.tokenId,
          page: params.page,
          limit: params.limit
        });
      }
    );
  }

  private registerLiquidityTools() {
    // Get token liquidity
    this.registerTool(
      "odinapi.market.liquidity.getInfo",
      "Get liquidity information for a token",
      {
        tokenId: z.string().describe("Token ID")
      },
      async (params) => {
        return await this.service.token.getTokenLiquidity(params.tokenId);
      }
    );

    // Get user liquidity positions
    this.registerTool(
      "odinapi.market.liquidity.getUserPositions",
      "Get user's liquidity positions",
      {
        principalId: z.string().describe("User Principal ID"),
        ...commonParams
      },
      async (params) => {
        const response = await this.service.user.getUserTokens(params.principalId);
        const positions = response.content['application/json'].data || [];
        return positions.filter((t: any) => t.token?.liquidity);
      }
    );
  }
} 