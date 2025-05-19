import { z } from "zod";
import { OdinFunService } from '../api/OdinFunService.js';
import { ODIN_API_BASE_URL } from '../api/core/constants.js';
import { getApiDocumentation } from '../docs/odinApiDocs.js';

// Define Token interface
interface Token {
  id: string;
  name: string;
  ticker: string;
  [key: string]: any; // Allow other properties
}

// Initialize OdinFunService instance
const odinFunService = new OdinFunService({ baseURL: ODIN_API_BASE_URL });



export function registerOdinFunTools(server: any) {
  /**
   * Get information about price units in Odin.fun API
   * This helps AI understand how to interpret price values
   */
  server.tool(
    "odinapi_getPriceUnitInfo",
    "Get information about price units in Odin.fun API. All prices returned by API need to be multiplied by 0.001 to convert to actual satoshi values",
    {},
    async () => {
      const doc = getApiDocumentation('price');
      return {
        content: [{
          type: "text",
          text: doc.content
        }]
      };
    }
  );

  /**
   * Get FAQ information from Odin.fun
   * This provides official information about Odin.fun platform
   */
  server.tool(
    "odinapi_getFaqInfo",
    "Get official FAQ information about Odin.fun. Includes details about token pricing, AMM, bonding curve, and platform functionality.",
    {},
    async () => {
      const doc = getApiDocumentation('faq');
      return {
        content: [{
          type: "text",
          text: doc.content
        }]
      };
    }
  );

  /**
   * Authorize identity
   * @param identity - ICP identity (Ed25519KeyIdentity)
   */
  server.tool(
    "odinapi_authIdentity",
    {
      identity: z.any()
    },
    async (params: any) => {
      const result = await odinFunService.auth.authenticate(params.identity);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  /**
   * Change username
   * @param username - New username
   * @param principalId - Principal ID string
   * @param authToken - Authorization token
   */
  // server.tool(
  //   "odinapi_identity_changeName",
  //   {
  //     username: z.string(),
  //     principalId: z.string(),
  //     authToken: z.string()
  //   },
  //   async (params: any) => {
  //     const result = await odinFunService.user.changeUsername(params.username, params.principalId, params.authToken);
  //     return { content: [{ type: "text", text: JSON.stringify(result) }] };
  //   }
  // );

  /**
   * Post a comment
   * @param comment - Comment content
   * @param principalId - Principal ID string
   * @param tokenId - Token ID
   * @param authToken - Authorization token
   */
  server.tool(
    "odinapi_identity_postComment",
    {
      comment: z.string(),
      principalId: z.string(),
      tokenId: z.string(),
      authToken: z.string()
    },
    async (params: any) => {
      const result = await odinFunService.comments.postTokenComment(params.tokenId, { message: params.comment, community: 0 });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  /**
   * Get BTC price information
   * No parameters
   */
  server.tool(
    "odinapi_comment_getBTCPrice",
    "Get the current BTC price, the value is in USD.",
    {},
    async (_params: any) => {
      const result = await odinFunService.getBTCPrice();
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  /**
   * Get recently traded Odin.fun tokens
   * @param page - Page number (optional, default 1)
   * @param limit - Items per page (optional, default 100)
   */
  server.tool(
    "odinapi_comment_getTokens",
    "Get recently active Odin.fun tokens. Returns an array. Supports pagination with page and limit.",
    {
      page: z.number().optional(),
      limit: z.number().optional()
    },
    async (params: any) => {
      const result = await odinFunService.token.getTokens({ page: params.page ?? 1, limit: params.limit ?? 100 });
      const enhancedResult = await odinFunService.enhanceResponse(result);
      return { content: [{ type: "text", text: JSON.stringify(enhancedResult) }] };
    }
  );

  /**
   * Get Odin.fun tokens with the highest market cap
   * @param page - Page number (optional, default 1)
   * @param limit - Items per page (optional, default 100)
   */
  server.tool(
    "odinapi_comment_getTokensByHighestMarketcap",
    "Get Odin.fun tokens with the highest market cap. Returns an array. Supports pagination with page and limit.",
    {
      page: z.number().optional(),
      limit: z.number().optional()
    },
    async (params: any) => {
      const result = await odinFunService.token.getTokens({ sort: 'marketcap:desc', page: params.page ?? 1, limit: params.limit ?? 100 });
      const enhancedResult = await odinFunService.enhanceResponse(result);
      return { content: [{ type: "text", text: JSON.stringify(enhancedResult) }] };
    }
  );

   /**
   * Get tokens by name or ticker
   * @param name - Token name or ticker
   * Returns all tokens whose name or ticker matches the input (may be multiple due to duplicate names)
   */
   server.tool(
    "odinapi_token_getTokenByName",
    "Get token information by name or ticker. Returns all tokens whose name or ticker matches the input. There may be multiple tokens with the same name.",
    {
      name: z.string()
    },
    async (params: any) => {
      const name = params.name;
      //console.error('Searching for token with name:', name);
      try {
        // Use getTokens API to query tokens
        const tokensResp = await odinFunService.token.getTokens({
          page: 1,
          limit: 1000,
          price_min: 200,
          holders_min: 10,
          search: name
        });

        // Enhance the response with price information
        const enhancedResp = await odinFunService.enhanceResponse(tokensResp);
        
        // Log the raw response for debugging
        //console.error('Raw API Response:', JSON.stringify(tokensResp, null, 2));
        
        // Check if the response is valid
        if (!enhancedResp) {
          //console.error('API returned null or undefined response');
          return { content: [{ type: "text", text: JSON.stringify({ error: 'API returned no data' }) }] };
        }
        
        // Try to extract tokens from different possible response structures
        let tokens: Token[] = [];
        if (Array.isArray(enhancedResp)) {
          tokens = enhancedResp as Token[];
        } else if (typeof enhancedResp === 'object') {
          if ('data' in enhancedResp && Array.isArray(enhancedResp.data)) {
            tokens = enhancedResp.data as Token[];
          } else if ('content' in enhancedResp && 
                     typeof enhancedResp.content === 'object' && 
                     'application/json' in enhancedResp.content &&
                     Array.isArray(enhancedResp.content['application/json'].data)) {
            tokens = enhancedResp.content['application/json'].data as Token[];
          }
        }
        
        //console.error('Extracted tokens:', tokens.length);
        
        // Further filter tokens by name or ticker
        const input = name.trim().toLowerCase();
        const filtered = tokens.filter(token => {
          if (!token || typeof token !== 'object') return false;
          const n = (token.name || '').toLowerCase();
          const t = (token.ticker || '').toLowerCase();
          const id = (token.id || '').toLowerCase();
          const rune = (token.rune || '').toLowerCase();
          return n.includes(input) || 
                 t.includes(input) || 
                 id === input ||     // ID通常需要精确匹配
                 rune.includes(input);
        });
        
        //console.error('Filtered tokens:', filtered.length);
        return { content: [{ type: "text", text: JSON.stringify(filtered) }] };
      } catch (error) {
       //console.error('Error in getTokenByName:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: JSON.stringify({ error: `Failed to fetch tokens: ${errorMessage}` }) }] };
      }
    }
  );

  /**
   * Get token information
   * @param tokenId - Token ID
   */
  server.tool(
    "odinapi_token_getToken",
    "Get information for the specified token. Returns a token info object.",
    {
      tokenId: z.string()
    },
    async (params: any) => {
      const result = await odinFunService.token.getTokenById(params.tokenId, false);
      const enhancedResult = await odinFunService.enhanceResponse(result);
      return { content: [{ type: "text", text: JSON.stringify(enhancedResult) }] };
    }
  );

  /**
   * Get holders for a token
   * @param id - Token ID
   * @param page - Page number (optional, default 1)
   * @param limit - Page size (optional, default 9999)
   */
  server.tool(
    "odinapi_token_getHolders",
    "Get holders for the specified token. Returns an array. Supports pagination with page and limit.",
    {
      id: z.string(),
      page: z.number().optional(),
      limit: z.number().optional()
    },
    async (params: any) => {
      const result = await odinFunService.token.getTokenOwners(params.id, { page: params.page ?? 1, limit: params.limit ?? 9999 });
      const enhancedResult = await odinFunService.enhanceResponse(result);
      return { content: [{ type: "text", text: JSON.stringify(enhancedResult) }] };
    }
  );

  /**
   * Get liquidities information for a token
   * @param token_id Token ID
   * Note: All prices and values are in 0.001 satoshi units
   */
  server.tool(
    "odinapi_token_getLiquidities",
    "Get liquidity information for a specific token. Note: All price and BTC values returned are in 0.001 satoshi units. Multiply by 0.001 to get actual satoshi values.",
    {
      token_id: z.string()
    },
    async (params: any) => {
      const result = await odinFunService.token.getTokenLiquidity(params.token_id);
      const enhancedResult = await odinFunService.enhanceResponse(result);
      return { content: [{ type: "text", text: JSON.stringify(enhancedResult) }] };
    }
  );

  /**
   * Get token comments list
   * @param id - Token ID
   */
  server.tool(
    "odinapi_token_getComments",
    "Get comments for the specified token. Returns an array.",
    {
      id: z.string()
    },
    async (params: any) => {
      const result = await odinFunService.comments.getTokenComments(params.id);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  

  /**
   * Get token candlestick (K-line) data
   * @param tokenId - Token ID
   * @param resolution - K-line resolution (1,15,60,240)
   * @param from - Optional, start time (ISO string)
   * @param to - Optional, end time (ISO string)
   * @param last - Number of items to fetch
   */
  server.tool(
    "odinapi_token_getBars",
    "Get candlestick (K-line) data for the specified token. Returns an array.",
    {
      tokenId: z.string(),
      resolution: z.union([
        z.literal(1),
        z.literal(15),
        z.literal(60),
        z.literal(240)
      ]),
      from: z.string().optional(),
      to: z.string().optional(),
      last: z.number()
    },
    async (params: any) => {
      const { tokenId, ...rest } = params;
      const result = await odinFunService.token.getTokenFeed(tokenId, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );  

  /**
   * Get token trades
   * @param tokenId - Token ID
   * @param page - Page number (optional, default 1)
   * @param limit - Items per page (optional, default 1000)
   */
  server.tool(
    "odinapi_token_getTrades",
    "Get trades for the specified token. Returns an array. Supports pagination with page and limit.",
    {
      tokenId: z.string(),
      page: z.number().optional(),
      limit: z.number().optional()
    },
    async (params: any) => {
      const result = await odinFunService.trade.getTrades({
        token: params.tokenId,
        page: params.page ?? 1,
        limit: params.limit ?? 1000
      });
      const enhancedResult = await odinFunService.enhanceResponse(result);
      return { content: [{ type: "text", text: JSON.stringify(enhancedResult) }] };
    }
  );

  /**
   * Get token trades by time
   * @param Id - Token ID
   * @param LastActionTimestamp - Last action timestamp (string | number)
   */
  server.tool(
    "odinapi_token_getTradesByTime",
    "Get trades for the specified token by time. Returns an array. Use Id and LastActionTimestamp to get trades in a specific time range.",
    {
      Id: z.string(),
      LastActionTimestamp: z.union([z.string(), z.number()])
    },
    async (params: any) => {
      const result = await odinFunService.trade.getTrades({ token: params.Id, time_min: params.LastActionTimestamp });
      const enhancedResult = await odinFunService.enhanceResponse(result);
      return { content: [{ type: "text", text: JSON.stringify(enhancedResult) }] };
    }
  );

  /**
   * Get token trades by user
   * @param tokenId - Token ID
   * @param user - User principal ID
   */
  server.tool(
    "odinapi_token_getTradesByUser",
    "Get trades for the specified token by user. Returns an array. Use tokenId and user to get trades for a specific user.",
    {
      tokenId: z.string(),
      user: z.string()
    },
    async (params: any) => {
      const result = await odinFunService.trade.getTrades({ token: params.tokenId, user: params.user });
      const enhancedResult = await odinFunService.enhanceResponse(result);
      return { content: [{ type: "text", text: JSON.stringify(enhancedResult) }] };
    }
  ); 

  /**
   * Get Odin.fun user list
   * @param username - Optional, username, supports fuzzy search
   */
  server.tool(
    "odinapi_user_getUsers",
    "Get Odin.fun user list. Returns an array. Supports fuzzy search by username.",
    {
      username: z.string().optional()
    },
    async (params: any) => {
      const result = await odinFunService.user.getUsers(params.username);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  /**
   * Get Odin.fun user information
   * @param principalId - Principal ID string
   */
  server.tool(
    "odinapi_user_getUser",
    "Get information for the specified Odin.fun user. Returns a user info object.",
    {
      principalId: z.string()
    },
    async (params: any) => {
      const result = await odinFunService.user.getUserByPrincipal(params.principalId);
      const enhancedResult = await odinFunService.enhanceResponse(result);
      return { content: [{ type: "text", text: JSON.stringify(enhancedResult) }] };
    }
  );

  /**
   * Get user balances
   * @param principalId - Principal ID string
   */
  server.tool(
    "odinapi_user_getBalances",
    "Get balance information for the specified Odin.fun user. Returns a user balance info object.",
    {
      principalId: z.string()
    },
    async (params: any) => {
      const result = await odinFunService.user.getUserBalances(params.principalId);
      const enhancedResult = await odinFunService.enhanceResponse(result);
      return { content: [{ type: "text", text: JSON.stringify(enhancedResult) }] };
    }
  );

  /**
   * Get user token balance
   * @param principalId - Principal ID string
   * @param tokenId - Token ID
   */
  server.tool(
    "odinapi_user_getTokenBalance",
    "Get the specified token balance for the specified Odin.fun user. Returns a user token balance info object.",
    {
      principalId: z.string(),
      tokenId: z.string()
    },
    async (params: any) => {
      const result = await odinFunService.user.getUserBalances(params.principalId);
      const enhancedResult = await odinFunService.enhanceResponse(result);
      const tokenBalance = Array.isArray(enhancedResult) ? enhancedResult.find((b: any) => b.token === params.tokenId) : undefined;
      return { content: [{ type: "text", text: JSON.stringify(tokenBalance) }] };
    }
  );

  /**
   * Get tokens created by user
   * @param principalId - User Principal ID
   */
  server.tool(
    "odinapi_user_getCreatedTokens",
    "Get tokens created by the specified Odin.fun user. Returns an array.",
    {
      principalId: z.string()
    },
    async (params: any) => {
      const result = await odinFunService.user.getUserCreatedTokens(params.principalId);
      const enhancedResult = await odinFunService.enhanceResponse(result);
      return { content: [{ type: "text", text: JSON.stringify(enhancedResult) }] };
    }
  );

  /**
   * Get tokens favorited by user
   * @param principalId - User Principal ID
   */
  server.tool(
    "odinapi_user_getFavoriteTokens",
    "Get tokens favorited by the specified Odin.fun user. Returns an array.",
    {
      principalId: z.string()
    },
    async (params: any) => {
      const result = await odinFunService.user.getUserTokens(params.principalId);
      const enhancedResult = await odinFunService.enhanceResponse(result);
      const favoriteTokens = Array.isArray(enhancedResult) ? enhancedResult.filter((t: any) => t.favorite) : [];
      return { content: [{ type: "text", text: JSON.stringify(favoriteTokens) }] };
    }
  );

  /**
   * Get user's liquidity positions
   * @param user_principal User principal ID
   * Note: All prices and values are in 0.001 satoshi units
   */
  server.tool(
    "odinapi_user_getLiquidity",
    "Get user's liquidity positions. Note: All price and BTC values returned are in 0.001 satoshi units. Multiply by 0.001 to get actual satoshi values.",
    {
      user_principal: z.string()
    },
    async (params: any) => {
      const result = await odinFunService.user.getUserTokens(params.user_principal);
      const enhancedResult = await odinFunService.enhanceResponse(result);
      const liquidityTokens = Array.isArray(enhancedResult) ? enhancedResult.filter((t: any) => t.liquidity) : [];
      return { content: [{ type: "text", text: JSON.stringify(liquidityTokens) }] };
    }
  );

  /**
   * Get user activity records
   * @param principalId - User Principal ID
   */
  server.tool(
    "odinapi_user_getActivities",
    "Get activity records for the specified Odin.fun user. Returns an array.",
    {
      principalId: z.string()
    },
    async (params: any) => {
      const result = await odinFunService.user.getUserActivity(params.principalId);
      const enhancedResult = await odinFunService.enhanceResponse(result);
      return { content: [{ type: "text", text: JSON.stringify(enhancedResult) }] };
    }
  );  


}