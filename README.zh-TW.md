# odinfun-mcp

`odinfun-mcp` 是基於[模型上下文協議(MCP)](https://github.com/modelcontextprotocol/sdk)實現的Odin.fun伺服器。它提供罐子資產管理和OdinFun API工具，適用於區塊鏈資產管理和數據查詢場景。

> 本文檔還提供[English](readme.md)和[简体中文](README.zh-CN.md)版本。

## 功能特點

- **罐子資產管理工具**
  - 查詢餘額、提現、創建新代幣
  - 使用BTC買賣代幣，按數量買賣
  - 添加/移除流動性

- **OdinFun API工具**
  - 用戶身份認證、更改用戶名、發布評論
  - 查詢Odin.fun代幣列表、市場數據、K線圖、持有者、流動性、評論等
  - 查詢用戶資產、創建/收藏的代幣、流動性、活動記錄等

## 安裝

```bash
npm install odinfun-mcp
```

## 使用方法

1. **構建項目**
   ```bash
   npm run build
   ```

2. **啟動伺服器**

   伺服器支持三種啟動模式：

   - **stdio模式**（默認）- 適用於CLI應用和集成：
     ```bash
     npm start
     # 或
     node dist/server.js
     ```
     使用stdin/stdout進行通信，適用於命令行工具和支持基於stdio的MCP連接的應用集成。

   - **HTTP+SSE模式** - 適用於Web應用和現代客戶端（添加`--sse`參數）：
     ```bash
     node dist/server.js --sse
     ```
     在端口3000上啟動HTTP伺服器，提供SSE端點：
     - `/sse` - SSE連接端點
     - `/messages?sessionId=<id>&mode=sse` - 消息處理端點
     - `/` - 伺服器狀態端點

   - **HTTP+Streamable模式** - 適用於需要流式響應的應用（添加`--streamable`參數）：
     ```bash
     node dist/server.js --streamable
     ```
     在端口3000上啟動HTTP伺服器，提供流式端點：
     - `/stream` - 流連接端點
     - `/messages?sessionId=<id>&mode=streamable` - 消息處理端點
     - `/` - 伺服器狀態端點

   注意：SSE和Streamable模式可以同時啟用：
   ```bash
   node dist/server.js --sse --streamable
   ```

3. **與MCP項目集成**  
   您可以在自己的MCP伺服器項目中導入和註冊這些工具，或直接運行本包提供的伺服器。

## 主要導出和入口

- 入口文件：`dist/server.js`
- 類型聲明：`dist/server.d.ts`

## 主要工具概述

### canisterTools

- `canister_getBalance`：查詢代幣餘額
- `canister_withdraw`：提現代幣
- `canister_createToken`：創建新代幣
- `canister_buyTokenWithBtc` / `canister_sellTokenForBtc`：使用BTC買賣代幣
- `canister_buyTokenAmount` / `canister_sellTokenAmount`：按數量買賣代幣
- `canister_addLiquidity` / `canister_removeLiquidity`：添加/移除流動性

### odinFunTools

OdinFun API工具現在按功能模組組織，以便於使用和更好的AI集成。所有工具名稱都已標準化並按以下方式分組：

#### 系統工具
- `odinapi_getPriceUnitInfo`：獲取Odin.fun API中的價格單位信息，幫助理解價格值的解釋方式
- `odinapi_getFaqInfo`：獲取Odin.fun官方FAQ信息，包括代幣定價、AMM、綁定曲線和平台功能等詳細信息
- `odinapi_enhancedResponse`：調用任何Odin.fun API方法並自動增強響應，添加price_sats和price_usd字段

#### 認證工具
- `odinapi_authIdentity`：使用ICP身份(Ed25519KeyIdentity)進行身份認證
- `odinapi_identity_postComment`：在代幣上發布評論

#### 市場工具
- `odinapi_market_token_getInfo`：獲取代幣詳細信息（價格、交易量、持有者等）
- `odinapi_market_token_list`：獲取代幣列表，支持過濾和排序
- `odinapi_market_price_getBTC`：獲取當前BTC美元價格
- `odinapi_market_price_getHistory`：獲取代幣價格歷史（K線數據）
- `odinapi_market_trade_list`：獲取代幣交易記錄
- `odinapi_market_liquidity_getInfo`：獲取代幣流動性信息
- `odinapi_market_liquidity_getUserPositions`：獲取用戶流動性頭寸
- `odinapi_comment_getBTCPrice`：獲取當前BTC價格（美元計價）
- `odinapi_comment_getTokens`：獲取最近活躍的Odin.fun代幣列表
- `odinapi_comment_getTokensByHighestMarketcap`：獲取市值最高的Odin.fun代幣列表
- `odinapi_token_getTradesByTime`：按時間範圍獲取代幣交易記錄
- `odinapi_token_getTradesByUser`：獲取特定用戶的代幣交易記錄

#### 用戶工具
- `odinapi_user_profile_getInfo`：獲取用戶資料信息
- `odinapi_user_profile_list`：列出用戶（支持搜索）
- `odinapi_user_assets_getBalances`：獲取用戶所有代幣餘額
- `odinapi_user_assets_getTokenBalance`：獲取特定代幣餘額
- `odinapi_user_assets_getCreatedTokens`：獲取用戶創建的代幣
- `odinapi_user_activity_list`：獲取用戶活動歷史
- `odinapi_user_favorite_list`：獲取用戶收藏的代幣
- `odinapi_user_favorite_toggle`：添加或移除收藏的代幣

#### 社交工具
- `odinapi_social_comment_list`：獲取代幣評論
- `odinapi_social_comment_post`：在代幣上發布評論
- `odinapi_social_activity_feed`：獲取所有代幣的最近活動
- `odinapi_social_activity_getTokenActivities`：獲取特定代幣的活動

#### 通用/工具類
- `odinapi_tools_price_convert`：在聰和美元之間轉換價格
- `odinapi_tools_price_getBTC`：獲取當前BTC美元價格
- `odinapi_tools_search_global`：全局搜索（代幣、用戶等）
- `odinapi_tools_enhance_tokenData`：增強代幣數據（價格、流動性等）
- `odinapi_tools_enhance_userData`：增強用戶數據（餘額、活動、收藏等）

> 所有工具名稱和參數現在都已標準化並在代碼中記錄。有關完整參數詳情和使用示例，請參閱代碼庫。

## 許可證

MIT 