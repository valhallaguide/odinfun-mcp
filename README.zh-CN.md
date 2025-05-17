# odinfun-mcp

`odinfun-mcp` 是基于[模型上下文协议(MCP)](https://github.com/modelcontextprotocol/sdk)实现的Odin.fun服务器。它提供罐子资产管理和OdinFun API工具，适用于区块链资产管理和数据查询场景。

> 本文档还提供[English](readme.md)和[繁體中文](README.zh-TW.md)版本。

## 功能特点

- **罐子资产管理工具**
  - 查询余额、提现、创建新代币
  - 使用BTC买卖代币，按数量买卖
  - 添加/移除流动性

- **OdinFun API工具**
  - 用户身份认证、更改用户名、发布评论
  - 查询Odin.fun代币列表、市场数据、K线图、持有者、流动性、评论等
  - 查询用户资产、创建/收藏的代币、流动性、活动记录等

## 安装

```bash
npm install odinfun-mcp
```

## 使用方法

1. **构建项目**
   ```bash
   npm run build
   ```

2. **启动服务器**

   服务器支持三种启动模式：

   - **stdio模式**（默认）- 适用于CLI应用和集成：
     ```bash
     npm start
     # 或
     node dist/server.js
     ```
     使用stdin/stdout进行通信，适用于命令行工具和支持基于stdio的MCP连接的应用集成。

   - **HTTP+SSE模式** - 适用于Web应用和现代客户端（添加`--sse`参数）：
     ```bash
     node dist/server.js --sse
     ```
     在端口3000上启动HTTP服务器，提供SSE端点：
     - `/sse` - SSE连接端点
     - `/messages?sessionId=<id>&mode=sse` - 消息处理端点
     - `/` - 服务器状态端点

   - **HTTP+Streamable模式** - 适用于需要流式响应的应用（添加`--streamable`参数）：
     ```bash
     node dist/server.js --streamable
     ```
     在端口3000上启动HTTP服务器，提供流式端点：
     - `/stream` - 流连接端点
     - `/messages?sessionId=<id>&mode=streamable` - 消息处理端点
     - `/` - 服务器状态端点

   注意：SSE和Streamable模式可以同时启用：
   ```bash
   node dist/server.js --sse --streamable
   ```

3. **与MCP项目集成**  
   您可以在自己的MCP服务器项目中导入和注册这些工具，或直接运行本包提供的服务器。

## 主要导出和入口

- 入口文件：`dist/server.js`
- 类型声明：`dist/server.d.ts`

## 主要工具概述

### canisterTools

- `canister_getBalance`：查询代币余额
- `canister_withdraw`：提现代币
- `canister_createToken`：创建新代币
- `canister_buyTokenWithBtc` / `canister_sellTokenForBtc`：使用BTC买卖代币
- `canister_buyTokenAmount` / `canister_sellTokenAmount`：按数量买卖代币
- `canister_addLiquidity` / `canister_removeLiquidity`：添加/移除流动性

### odinFunTools

OdinFun API工具现在按功能模块组织，以便于使用和更好的AI集成。所有工具名称都已标准化并按以下方式分组：

#### 系统工具
- `odinapi_getPriceUnitInfo`：获取Odin.fun API中的价格单位信息，帮助理解价格值的解释方式
- `odinapi_getFaqInfo`：获取Odin.fun官方FAQ信息，包括代币定价、AMM、绑定曲线和平台功能等详细信息

#### 认证工具
- `odinapi_authIdentity`：使用ICP身份(Ed25519KeyIdentity)进行身份认证
- `odinapi_identity_postComment`：在代币上发布评论

#### 市场工具
- `odinapi_market_token_getInfo`：获取代币详细信息（价格、交易量、持有者等）
- `odinapi_market_token_list`：获取代币列表，支持过滤和排序
- `odinapi_market_price_getBTC`：获取当前BTC美元价格
- `odinapi_market_price_getHistory`：获取代币价格历史（K线数据）
- `odinapi_market_trade_list`：获取代币交易记录
- `odinapi_market_liquidity_getInfo`：获取代币流动性信息
- `odinapi_market_liquidity_getUserPositions`：获取用户流动性头寸
- `odinapi_comment_getBTCPrice`：获取当前BTC价格（美元计价）
- `odinapi_comment_getTokens`：获取最近活跃的Odin.fun代币列表
- `odinapi_comment_getTokensByHighestMarketcap`：获取市值最高的Odin.fun代币列表
- `odinapi_token_getTradesByTime`：按时间范围获取代币交易记录
- `odinapi_token_getTradesByUser`：获取特定用户的代币交易记录

#### 用户工具
- `odinapi_user_profile_getInfo`：获取用户资料信息
- `odinapi_user_profile_list`：列出用户（支持搜索）
- `odinapi_user_assets_getBalances`：获取用户所有代币余额
- `odinapi_user_assets_getTokenBalance`：获取特定代币余额
- `odinapi_user_assets_getCreatedTokens`：获取用户创建的代币
- `odinapi_user_activity_list`：获取用户活动历史
- `odinapi_user_favorite_list`：获取用户收藏的代币
- `odinapi_user_favorite_toggle`：添加或移除收藏的代币

#### 社交工具
- `odinapi_social_comment_list`：获取代币评论
- `odinapi_social_comment_post`：在代币上发布评论
- `odinapi_social_activity_feed`：获取所有代币的最近活动
- `odinapi_social_activity_getTokenActivities`：获取特定代币的活动

#### 通用/工具类
- `odinapi_tools_price_convert`：在聪和美元之间转换价格
- `odinapi_tools_price_getBTC`：获取当前BTC美元价格
- `odinapi_tools_search_global`：全局搜索（代币、用户等）
- `odinapi_tools_enhance_tokenData`：增强代币数据（价格、流动性等）
- `odinapi_tools_enhance_userData`：增强用户数据（余额、活动、收藏等）

> 所有工具名称和参数现在都已标准化并在代码中记录。有关完整参数详情和使用示例，请参阅代码库。

## 许可证

MIT 