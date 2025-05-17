# odinfun-mcp

`odinfun-mcp` is a server implementation for Odin.fun based on the [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/sdk). It provides canister asset management and OdinFun API tools, suitable for blockchain asset management and data query scenarios.

> This document is also available in [简体中文](README.zh-CN.md) and [繁體中文](README.zh-TW.md).

## Features

- **Canister Asset Management Tools**
  - Query balance, withdraw, create new tokens
  - Buy/sell tokens with BTC, buy/sell by amount
  - Add/remove liquidity

- **OdinFun API Tools**
  - User identity authentication, change username, post comments
  - Query Odin.fun token list, market data, candlesticks, holders, liquidity, comments, etc.
  - Query user assets, created/favorited tokens, liquidity, activity records, and more

## Installation

```bash
npm install odinfun-mcp
```

## Usage

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start the server**

   The server supports three startup modes:

   - **stdio mode** (default) - For CLI applications and integration:
     ```bash
     npm start
     # or
     node dist/server.js
     ```
     This uses stdin/stdout for communication, suitable for command-line tools and integration with applications that support stdio-based MCP connections.

   - **HTTP+SSE mode** - For web applications and modern clients (add `--sse` parameter):
     ```bash
     node dist/server.js --sse
     ```
     This starts an HTTP server on port 3000 with SSE endpoints:
     - `/sse` - SSE connection endpoint
     - `/messages?sessionId=<id>&mode=sse` - Message handling endpoint
     - `/` - Server status endpoint

   - **HTTP+Streamable mode** - For applications that need streamable responses (add `--streamable` parameter):
     ```bash
     node dist/server.js --streamable
     ```
     This starts an HTTP server on port 3000 with streamable endpoints:
     - `/stream` - Stream connection endpoint
     - `/messages?sessionId=<id>&mode=streamable` - Message handling endpoint
     - `/` - Server status endpoint

   Note: Both SSE and Streamable modes can be enabled simultaneously:
   ```bash
   node dist/server.js --sse --streamable
   ```

3. **Integrate with your MCP project**  
   You can import and register these tools in your own MCP server project, or directly run the server provided by this package.

## Main Exports & Entry

- Entry file: `dist/server.js`
- Type declarations: `dist/server.d.ts`

## Main Tools Overview

### canisterTools

- `canister_getBalance`: Query token balance
- `canister_withdraw`: Withdraw tokens
- `canister_createToken`: Create new token
- `canister_buyTokenWithBtc` / `canister_sellTokenForBtc`: Buy/sell tokens with BTC
- `canister_buyTokenAmount` / `canister_sellTokenAmount`: Buy/sell tokens by amount
- `canister_addLiquidity` / `canister_removeLiquidity`: Add/remove liquidity

### odinFunTools

OdinFun API tools are now organized by functional modules for easier use and better AI integration. All tool names are standardized and grouped as follows:

#### System Tools
- `odinapi_getPriceUnitInfo`: Get information about price units in Odin.fun API, helping understand how to interpret price values
- `odinapi_getFaqInfo`: Get official FAQ information about Odin.fun, including details about token pricing, AMM, bonding curve, and platform functionality

#### Authentication Tools
- `odinapi_authIdentity`: Authenticate using ICP identity (Ed25519KeyIdentity)
- `odinapi_identity_postComment`: Post a comment on a token

#### Market Tools
- `odinapi_market_token_getInfo`: Get detailed token information (price, volume, holders, etc.)
- `odinapi_market_token_list`: List tokens with filtering and sorting
- `odinapi_market_price_getBTC`: Get current BTC price in USD
- `odinapi_market_price_getHistory`: Get token price history (candlestick data)
- `odinapi_market_trade_list`: Get trade records for a token
- `odinapi_market_liquidity_getInfo`: Get liquidity information for a token
- `odinapi_market_liquidity_getUserPositions`: Get user's liquidity positions
- `odinapi_comment_getBTCPrice`: Get current BTC price in USD
- `odinapi_comment_getTokens`: Get recently active Odin.fun tokens
- `odinapi_comment_getTokensByHighestMarketcap`: Get Odin.fun tokens with highest market cap
- `odinapi_token_getTradesByTime`: Get token trades by time range
- `odinapi_token_getTradesByUser`: Get token trades by specific user

#### User Tools
- `odinapi_user_profile_getInfo`: Get user profile information
- `odinapi_user_profile_list`: List users (with search)
- `odinapi_user_assets_getBalances`: Get all token balances for a user
- `odinapi_user_assets_getTokenBalance`: Get balance for a specific token
- `odinapi_user_assets_getCreatedTokens`: Get tokens created by the user
- `odinapi_user_activity_list`: Get user activity history
- `odinapi_user_favorite_list`: Get user's favorite tokens
- `odinapi_user_favorite_toggle`: Add or remove a token from favorites

#### Social Tools
- `odinapi_social_comment_list`: Get comments for a token
- `odinapi_social_comment_post`: Post a comment on a token
- `odinapi_social_activity_feed`: Get recent activities across all tokens
- `odinapi_social_activity_getTokenActivities`: Get activities for a specific token

#### Common/Utility Tools
- `odinapi_tools_price_convert`: Convert price between sats and USD
- `odinapi_tools_price_getBTC`: Get current BTC price in USD
- `odinapi_tools_search_global`: Search across all entities (tokens, users, etc.)
- `odinapi_tools_enhance_tokenData`: Enhance token data with price, liquidity, etc.
- `odinapi_tools_enhance_userData`: Enhance user data with balances, activities, favorites, etc.

> All tool names and parameters are now standardized and documented in code. See the codebase for full parameter details and usage examples.

## License

MIT
