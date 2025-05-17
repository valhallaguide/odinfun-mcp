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

// Add utility function for price conversion
async function convertPrices(data: any): Promise<any> {
  // Get BTC/USD price
  const btcPriceResp = await odinFunService.getBTCPrice();
  // Safely access btcPriceResp data, BTC price is in amount field
  let btcPriceUsd = 0;
  try {
    if (btcPriceResp && 
        typeof btcPriceResp === 'object' && 
        'amount' in btcPriceResp) {
      btcPriceUsd = Number(btcPriceResp.amount) || 0;
    }
  } catch (e) {
    console.error('Error parsing BTC price:', e);
  }
  
  // Process object recursively
  function processObject(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Process array
    if (Array.isArray(obj)) {
      return obj.map(item => processObject(item));
    }
    
    // Process object
    const result = {...obj};
    for (const key in obj) {
      if (key === 'price' && typeof obj[key] === 'number') {
        const priceSats = obj[key] * 0.001;
        const priceUsd = priceSats * btcPriceUsd / 100000000;
        result.price_sats = `${priceSats} sats`;
        result.price_usd = `$${priceUsd.toFixed(8)} usd`;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = processObject(obj[key]);
      }
    }
    return result;
  }
  
  return processObject(data);
}

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
      return {
        content: [{
          type: "text",
          text: getApiDocumentation('price')
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
      return {
        content: [{
          type: "text",
          text: getApiDocumentation('faq')
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
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
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
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
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
        
        // Log the raw response for debugging
        //console.error('Raw API Response:', JSON.stringify(tokensResp, null, 2));
        
        // Check if the response is valid
        if (!tokensResp) {
          //console.error('API returned null or undefined response');
          return { content: [{ type: "text", text: JSON.stringify({ error: 'API returned no data' }) }] };
        }
        
        // Try to extract tokens from different possible response structures
        let tokens: Token[] = [];
        if (Array.isArray(tokensResp)) {
          tokens = tokensResp as Token[];
        } else if (typeof tokensResp === 'object') {
          if ('data' in tokensResp && Array.isArray(tokensResp.data)) {
            tokens = tokensResp.data as Token[];
          } else if ('content' in tokensResp && 
                     typeof tokensResp.content === 'object' && 
                     'application/json' in tokensResp.content &&
                     Array.isArray(tokensResp.content['application/json'].data)) {
            tokens = tokensResp.content['application/json'].data as Token[];
          }
        }
        
        //console.error('Extracted tokens:', tokens.length);
        
        // Further filter tokens by name or ticker
        const input = name.trim().toLowerCase();
        const filtered = tokens.filter(token => {
          if (!token || typeof token !== 'object') return false;
          const n = (token.name || '').toLowerCase();
          const t = (token.ticker || '').toLowerCase();
          return n.includes(input) || t.includes(input);
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
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
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
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
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
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
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
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
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
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
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
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
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
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
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
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
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
      const tokenBalance = Array.isArray(result) ? result.find((b: any) => b.token === params.tokenId) : undefined;
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
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
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
      const favoriteTokens = Array.isArray(result) ? result.filter((t: any) => t.favorite) : [];
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
      const liquidityTokens = Array.isArray(result) ? result.filter((t: any) => t.liquidity) : [];
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
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );  

  /**
   * Get price-enhanced API response
   * Enhances any Odin.fun API response by adding price_sats and price_usd fields
   * @param apiMethod - API method name
   * @param params - Parameters for the API method
   */
  server.tool(
    "odinapi_enhancedResponse",
    "Call any Odin.fun API method and automatically enhance the response with price_sats and price_usd fields",
    {
      apiMethod: z.string().describe("API method name, e.g. getToken, getTokenTrades"),
      params: z.any().describe("Parameters for the API method")
    },
    async (params: any) => {
      // Use type assertion to safely access API methods
      const api = odinFunService as Record<string, any>;
      
      if (typeof api[params.apiMethod] !== 'function') {
        return { content: [{ type: "text", text: JSON.stringify({ error: "Invalid API method" }) }] };
      }
      
      try {
        // Call the specified API method
        const result = await api[params.apiMethod](...(Array.isArray(params.params) ? params.params : [params.params]));
        
        // Enhance response data
        const enhancedResult = await convertPrices(result);
        
        return { content: [{ type: "text", text: JSON.stringify(enhancedResult, null, 2) }] };
      } catch (error: unknown) {
        // Handle errors, ensure type safety for error object
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: `Error calling ${params.apiMethod}: ${errorMessage}` })
          }]
        };
      }
    }
  );
}