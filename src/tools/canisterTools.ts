import { z } from "zod";
import { HttpAgent } from '@dfinity/agent';
import { CanisterClient } from '../api/CanisterClient.js';

export function registerCanisterTools(server: any) {
  // Only initialize once
  const agent = new HttpAgent({ host: 'https://ic0.app' });
  const client = new CanisterClient(agent);

  // Get balance (already exists)
  server.tool(
    "canister_getBalance",
    {
      arg0: z.string(), // Token ID
      arg1: z.string(), // Account
      arg2: z.string()  // Network
    },
    async (params: any) => {
      const result = await client.getBalance(params.arg0, params.arg1, params.arg2);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // Withdraw
  server.tool(
    "canister_withdraw",
    {
      tokenId: z.string(), // Token ID
      amount: z.string(),  // Amount (string, needs to be converted to BigInt)
      address: z.string(), // Withdrawal address
      protocol: z.any()    // Protocol type (object, e.g. {btc:null})
    },
    async (params: any) => {
      const request = {
        tokenid: params.tokenId,
        amount: BigInt(params.amount),
        address: params.address,
        protocol: params.protocol
      };
      const result = await client.tokenWithdraw(request);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // Create new token
  server.tool(
    "canister_createToken",
    {
      metadata: z.any(), // Metadata object
      code: z.any(),      // Exchange code or discount code
      prebuy_amount: z.any() // Pre-purchase amount
    },
    async (params: any) => {
      const request = {
        metadata: params.metadata,
        code: params.code,
        prebuy_amount: params.prebuy_amount
      };
      const result = await client.tokenMint(request);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // Buy token with BTC
  server.tool(
    "canister_buyTokenWithBtc",
    {
      tokenId: z.string(), // Token ID
      btcAmount: z.string(), // BTC amount (string, needs to be converted to BigInt)
      slippage: z.any().optional() // Slippage setting (e.g. [[bigint, bigint]])
    },
    async (params: any) => {
      let settings: [] | [{ slippage: [] | [[bigint, bigint]] }] = [];
      if (params.slippage) settings = [{ slippage: params.slippage }];
      const request = {
        tokenid: params.tokenId,
        typeof: { buy: null },
        amount: { btc: BigInt(params.btcAmount) },
        settings: settings as any // Type assertion, compatible with TradeRequest
      };
      const result = await client.tokenTrade(request);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // Sell token for BTC
  server.tool(
    "canister_sellTokenForBtc",
    {
      tokenId: z.string(), // Token ID
      btcAmount: z.string(), // BTC amount (string, needs to be converted to BigInt)
      slippage: z.any().optional() // Slippage setting
    },
    async (params: any) => {
      let settings: [] | [{ slippage: [] | [[bigint, bigint]] }] = [];
      if (params.slippage) settings = [{ slippage: params.slippage }];
      const request = {
        tokenid: params.tokenId,
        typeof: { sell: null },
        amount: { btc: BigInt(params.btcAmount) },
        settings: settings as any
      };
      const result = await client.tokenTrade(request);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // Buy specified amount of token with BTC
  server.tool(
    "canister_buyTokenAmount",
    {
      tokenId: z.string(), // Token ID
      tokenAmount: z.string(), // Token amount (string, needs to be converted to BigInt)
      slippage: z.any().optional() // Slippage setting
    },
    async (params: any) => {
      let settings: [] | [{ slippage: [] | [[bigint, bigint]] }] = [];
      if (params.slippage) settings = [{ slippage: params.slippage }];
      const request = {
        tokenid: params.tokenId,
        typeof: { buy: null },
        amount: { token: BigInt(params.tokenAmount) },
        settings: settings as any
      };
      const result = await client.tokenTrade(request);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // Sell specified amount of token
  server.tool(
    "canister_sellTokenAmount",
    {
      tokenId: z.string(), // Token ID
      tokenAmount: z.string(), // Token amount (string, needs to be converted to BigInt)
      slippage: z.any().optional() // Slippage setting
    },
    async (params: any) => {
      let settings: [] | [{ slippage: [] | [[bigint, bigint]] }] = [];
      if (params.slippage) settings = [{ slippage: params.slippage }];
      const request = {
        tokenid: params.tokenId,
        typeof: { sell: null },
        amount: { token: BigInt(params.tokenAmount) },
        settings: settings as any
      };
      const result = await client.tokenTrade(request);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // Add liquidity
  server.tool(
    "canister_addLiquidity",
    {
      tokenId: z.string(), // Token ID
      amount: z.string()   // Amount (string, needs to be converted to BigInt)
    },
    async (params: any) => {
      const request = {
        tokenid: params.tokenId,
        typeof: { add: null },
        amount: BigInt(params.amount)
      };
      const result = await client.tokenLiquidity(request);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // Remove liquidity
  server.tool(
    "canister_removeLiquidity",
    {
      tokenId: z.string(), // Token ID
      amount: z.string()   // Amount (string, needs to be converted to BigInt)
    },
    async (params: any) => {
      const request = {
        tokenid: params.tokenId,
        typeof: { remove: null },
        amount: BigInt(params.amount)
      };
      const result = await client.tokenLiquidity(request);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
} 