import { z } from "zod";
import { OdinApiToolRegistry, commonParams } from './base.js';

export class UserTools extends OdinApiToolRegistry {
  public registerAll() {
    this.registerProfileTools();
    this.registerAssetTools();
    this.registerActivityTools();
    this.registerFavoriteTools();
  }

  private registerProfileTools() {
    // Get user profile
    this.registerTool(
      "odinapi_user_profile_getInfo",
      "Get user profile information",
      {
        principalId: z.string().describe("User Principal ID")
      },
      async (params) => {
        return await this.service.user.getUserByPrincipal(params.principalId);
      }
    );

    // Get user list
    this.registerTool(
      "odinapi_user_profile_list",
      "Get list of users with optional search",
      {
        ...commonParams,
        username: z.string().optional().describe("Search by username")
      },
      async (params) => {
        return await this.service.user.getUsers(params.username);
      }
    );
  }

  private registerAssetTools() {
    // Get user balances
    this.registerTool(
      "odinapi_user_assets_getBalances",
      "Get all token balances for a user",
      {
        principalId: z.string().describe("User Principal ID")
      },
      async (params) => {
        return await this.service.user.getUserBalances(params.principalId);
      }
    );

    // Get specific token balance
    this.registerTool(
      "odinapi_user_assets_getTokenBalance",
      "Get balance for a specific token",
      {
        principalId: z.string().describe("User Principal ID"),
        tokenId: z.string().describe("Token ID")
      },
      async (params) => {
        const response = await this.service.user.getUserBalances(params.principalId);
        const balances = response.content['application/json'].data || [];
        const tokenBalance = balances.find((b: any) => b.token?.id === params.tokenId);
        return tokenBalance || null;
      }
    );

    // Get created tokens
    this.registerTool(
      "odinapi_user_assets_getCreatedTokens",
      "Get tokens created by the user",
      {
        principalId: z.string().describe("User Principal ID"),
        ...commonParams
      },
      async (params) => {
        return await this.service.user.getUserCreatedTokens(params.principalId);
      }
    );
  }

  private registerActivityTools() {
    // Get user activities
    this.registerTool(
      "odinapi_user_activity_list",
      "Get user activity history",
      {
        principalId: z.string().describe("User Principal ID"),
        ...commonParams,
        type: z.enum(['all', 'trade', 'liquidity', 'comment']).optional()
          .describe("Filter activities by type")
      },
      async (params) => {
        const response = await this.service.user.getUserActivity(params.principalId);
        const activities = response.content['application/json'].data || [];
        if (params.type && params.type !== 'all') {
          return activities.filter((a: any) => a.action === params.type);
        }
        return activities;
      }
    );
  }

  private registerFavoriteTools() {
    // Get favorite tokens
    this.registerTool(
      "odinapi_user_favorite_list",
      "Get user's favorite tokens",
      {
        principalId: z.string().describe("User Principal ID"),
        ...commonParams
      },
      async (params) => {
        const response = await this.service.user.getUserTokens(params.principalId);
        const tokens = response.content['application/json'].data || [];
        const favorites = tokens.filter((t: any) => t.token?.favorite);
        return favorites;
      }
    );

    // Add/remove favorite
    this.registerTool(
      "odinapi_user_favorite_toggle",
      "Add or remove a token from favorites",
      {
        principalId: z.string().describe("User Principal ID"),
        tokenId: z.string().describe("Token ID"),
        action: z.enum(['add', 'remove']).describe("Action to perform (add/remove)")
      },
      async (params) => {
        if (params.action === 'add') {
          return await this.service.favorite.addFavorite(params.tokenId);
        } else {
          return await this.service.favorite.removeFavorite(params.tokenId);
        }
      }
    );
  }
} 