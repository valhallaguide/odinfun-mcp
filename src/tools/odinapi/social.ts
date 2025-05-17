import { z } from "zod";
import { OdinApiToolRegistry, commonParams } from './base.js';

export class SocialTools extends OdinApiToolRegistry {
  public registerAll() {
    this.registerCommentTools();
    this.registerActivityTools();
  }

  private registerCommentTools() {
    // Get token comments
    this.registerTool(
      "odinapi.social.comment.list",
      "Get comments for a token",
      {
        tokenId: z.string().describe("Token ID"),
        ...commonParams
      },
      async (params) => {
        return await this.service.comments.getTokenComments(params.tokenId);
      }
    );

    // Post a comment
    this.registerTool(
      "odinapi.social.comment.post",
      "Post a comment on a token",
      {
        tokenId: z.string().describe("Token ID"),
        message: z.string().describe("Comment message"),
        community: z.number().optional().describe("Community ID (default: 0)")
      },
      async (params) => {
        return await this.service.comments.postTokenComment(params.tokenId, {
          message: params.message,
          community: params.community || 0
        });
      }
    );

    // Note: Comment deletion is not supported by the API
  }

  private registerActivityTools() {
    // Get recent activities
    this.registerTool(
      "odinapi.social.activity.feed",
      "Get recent activities across all tokens",
      {
        ...commonParams,
        type: z.enum(['all', 'trade', 'liquidity', 'comment', 'token']).optional()
          .describe("Filter activities by type")
      },
      async (params) => {
        const response = await this.service.activity.getActivities();
        const activities = response.content['application/json'].data || [];
        if (params.type && params.type !== 'all') {
          return activities.filter((a: any) => a.action === params.type);
        }
        return activities;
      }
    );

    // Get activities for a token (using the main activities endpoint with filtering)
    this.registerTool(
      "odinapi.social.activity.getTokenActivities",
      "Get activities for a specific token",
      {
        tokenId: z.string().describe("Token ID"),
        ...commonParams,
        type: z.enum(['all', 'trade', 'liquidity', 'comment']).optional()
          .describe("Filter activities by type")
      },
      async (params) => {
        const response = await this.service.activity.getActivities();
        const activities = response.content['application/json'].data || [];
        // Filter activities for the specific token
        const tokenActivities = activities.filter((a: any) => a.token?.id === params.tokenId);
        if (params.type && params.type !== 'all') {
          return tokenActivities.filter((a: any) => a.action === params.type);
        }
        return tokenActivities;
      }
    );
  }
} 