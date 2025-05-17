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
- `odinapi_enhancedResponse`: Call any Odin.fun API method and automatically enhance the response with price_sats and price_usd fields

#### Authentication Tools
- `odinapi_authIdentity`: Authenticate using ICP identity (Ed25519KeyIdentity)
- `odinapi_identity_postComment`: Post a comment on a token

#### Market Tools
- `odinapi.market.token.getInfo`: Get detailed token information (price, volume, holders, etc.)
- `odinapi.market.token.list`: List tokens with filtering and sorting
- `odinapi.market.price.getBTC`: Get current BTC price in USD
- `odinapi.market.price.getHistory`: Get token price history (candlestick data)
- `odinapi.market.trade.list`: Get trade records for a token
- `odinapi.market.liquidity.getInfo`: Get liquidity information for a token
- `odinapi.market.liquidity.getUserPositions`: Get user's liquidity positions
- `odinapi_comment_getBTCPrice`: Get current BTC price in USD
- `odinapi_comment_getTokens`: Get recently active Odin.fun tokens
- `odinapi_comment_getTokensByHighestMarketcap`: Get Odin.fun tokens with highest market cap
- `odinapi_token_getTradesByTime`: Get token trades by time range
- `odinapi_token_getTradesByUser`: Get token trades by specific user

#### User Tools
- `odinapi.user.profile.getInfo`: Get user profile information
- `odinapi.user.profile.list`: List users (with search)
- `odinapi.user.assets.getBalances`: Get all token balances for a user
- `odinapi.user.assets.getTokenBalance`: Get balance for a specific token
- `odinapi.user.assets.getCreatedTokens`: Get tokens created by the user
- `odinapi.user.activity.list`: Get user activity history
- `odinapi.user.favorite.list`: Get user's favorite tokens
- `odinapi.user.favorite.toggle`: Add or remove a token from favorites

#### Social Tools
- `odinapi.social.comment.list`: Get comments for a token
- `odinapi.social.comment.post`: Post a comment on a token
- `odinapi.social.activity.feed`: Get recent activities across all tokens
- `odinapi.social.activity.getTokenActivities`: Get activities for a specific token

#### Common/Utility Tools
- `odinapi.tools.price.convert`: Convert price between sats and USD
- `odinapi.tools.price.getBTC`: Get current BTC price in USD
- `odinapi.tools.search.global`: Search across all entities (tokens, users, etc.)
- `odinapi.tools.enhance.tokenData`: Enhance token data with price, liquidity, etc.
- `odinapi.tools.enhance.userData`: Enhance user data with balances, activities, favorites, etc.

> All tool names and parameters are now standardized and documented in code. See the codebase for full parameter details and usage examples.

## License

MIT
