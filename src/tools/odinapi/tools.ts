import { z } from "zod";
import { OdinApiToolRegistry, priceUtils, commonParams } from './base.js';

export class CommonTools extends OdinApiToolRegistry {
  public registerAll() {
    this.registerPriceTools();
    this.registerSearchTools();
    this.registerDataEnhancementTools();
  }

  private registerPriceTools() {
    // Convert price between units
    this.registerTool(
      "odinapi.tools.price.convert",
      "Convert price between different units (sats/USD)",
      {
        amount: z.number().describe("Amount to convert"),
        fromUnit: z.enum(['sats', 'usd']).describe("Source unit"),
        toUnit: z.enum(['sats', 'usd']).describe("Target unit")
      },
      async (params) => {
        const btcPrice = await this.service.getBTCPrice();
        if (!btcPrice?.amount) {
          throw new Error("Failed to get BTC price");
        }

        if (params.fromUnit === params.toUnit) {
          return { amount: params.amount, unit: params.fromUnit };
        }

        if (params.fromUnit === 'sats' && params.toUnit === 'usd') {
          const usdAmount = await priceUtils.convertToUSD(params.amount, btcPrice.amount);
          return { amount: usdAmount, unit: 'usd' };
        } else {
          const satsAmount = await priceUtils.convertToSats(params.amount, btcPrice.amount);
          return { amount: satsAmount, unit: 'sats' };
        }
      }
    );

    // Get BTC price
    this.registerTool(
      "odinapi.tools.price.getBTC",
      "Get current BTC price in USD",
      {},
      async () => {
        return await this.service.getBTCPrice();
      }
    );
  }

  private registerSearchTools() {
    // Search across all entities
    this.registerTool(
      "odinapi.tools.search.global",
      "Search across all entities (tokens, users, etc.)",
      {
        query: z.string().describe("Search query"),
        types: z.array(z.enum(['token', 'user', 'comment'])).optional()
          .describe("Entity types to search in"),
        ...commonParams
      },
      async (params) => {
        return await this.service.search.search(params.query, params.types);
      }
    );

    // Search tokens
    this.registerTool(
      "odinapi.tools.search.tokens",
      "Search for tokens by name or ticker",
      {
        query: z.string().describe("Search query"),
        ...commonParams
      },
      async (params) => {
        const results = await this.service.search.search(params.query, ['token']);
        return results;
      }
    );

    // Search users
    this.registerTool(
      "odinapi.tools.search.users",
      "Search for users by username",
      {
        query: z.string().describe("Search query"),
        ...commonParams
      },
      async (params) => {
        const results = await this.service.search.search(params.query, ['user']);
        return results;
      }
    );
  }

  private registerDataEnhancementTools() {
    // Enhance token data with additional information
    this.registerTool(
      "odinapi.tools.enhance.tokenData",
      "Enhance token data with additional information (price in USD, etc.)",
      {
        tokenId: z.string().describe("Token ID"),
        includePrice: z.boolean().optional().describe("Include price information (default: true)"),
        includeHolders: z.boolean().optional().describe("Include holder information (default: false)"),
        includeLiquidity: z.boolean().optional().describe("Include liquidity information (default: true)")
      },
      async (params) => {
        const token = await this.service.token.getTokenById(params.tokenId, params.includeHolders);
        const enhancedData: any = { ...token };

        if (params.includePrice !== false) {
          const btcPrice = await this.service.getBTCPrice();
          if (token.price && btcPrice?.amount) {
            enhancedData.price_usd = await priceUtils.convertToUSD(token.price * 0.001, btcPrice.amount);
          }
        }

        if (params.includeLiquidity !== false) {
          const liquidity = await this.service.token.getTokenLiquidity(params.tokenId);
          enhancedData.liquidity = liquidity;
        }

        return enhancedData;
      }
    );

    // Enhance user data with additional information
    this.registerTool(
      "odinapi.tools.enhance.userData",
      "Enhance user data with additional information (balances, activities, etc.)",
      {
        principalId: z.string().describe("User Principal ID"),
        includeBalances: z.boolean().optional().describe("Include balance information (default: true)"),
        includeActivities: z.boolean().optional().describe("Include activity information (default: false)"),
        includeFavorites: z.boolean().optional().describe("Include favorite tokens (default: false)")
      },
      async (params) => {
        const user = await this.service.user.getUserByPrincipal(params.principalId);
        const enhancedData: any = { ...user };

        if (params.includeBalances !== false) {
          const balances = await this.service.user.getUserBalances(params.principalId);
          enhancedData.balances = balances;
        }

        if (params.includeActivities) {
          const activities = await this.service.user.getUserActivity(params.principalId);
          enhancedData.activities = activities;
        }

        if (params.includeFavorites) {
          const response = await this.service.user.getUserTokens(params.principalId);
          const tokens = response.content['application/json'].data || [];
          enhancedData.favorites = tokens.filter((t: any) => t.token?.favorite);
        }

        return enhancedData;
      }
    );
  }
} 