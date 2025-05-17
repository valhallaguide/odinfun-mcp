// src/api/ConisterClient.ts
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent, ActorSubclass } from '@dfinity/agent';
// Import types from the .ts file
import type { _SERVICE, TokenID, TokenAmount, Operation, OperationAndId, AddRequest, AddResponse, EtchRequest, EtchResponse, LiquidityRequest, LiquidityResponse, MintRequest, MintResponse, TradeRequest, TradeResponse, WithdrawRequest, WithdrawResponse, Token } from './CanisterInterface.js';
// Import idlFactory from the .did.js file
import { idlFactory } from './CanisterInterface.did.js';

/**
 * Canister client class for interacting with Canister
 */
export class CanisterClient {
  // Declare class member properties and their types
  private agent: HttpAgent;
  private canisterId: Principal;
  // Use _SERVICE type exported from CanisterInterface.ts
  private actor: ActorSubclass<_SERVICE>;

  /**
   * Create a new Canister client
   * @param agent - ICP Agent
   * @param canisterIdInput - Canister ID (Principal, string, or null)
   */
  constructor(agent: HttpAgent, canisterIdInput: Principal | string | null = null) {
    this.agent = agent;

    this.canisterId = canisterIdInput ? 
      typeof canisterIdInput === 'string' ? Principal.fromText(canisterIdInput) : canisterIdInput :
      Principal.fromText('z2vm5-gaaaa-aaaaj-azw6q-cai');
    
    this.actor = Actor.createActor<_SERVICE>(idlFactory, {
      agent,
      canisterId: this.canisterId
    });
  }

  /**
   * Get balance
   * @param tokenId - Token ID
   * @param account - Account
   * @param network - Network
   * @returns Balance
   */
  async getBalance(tokenId: string, account: string, network: TokenID = 'mainnet'): Promise<TokenAmount> {
    return this.actor.getBalance(tokenId, account, network);
  }

  /**
   * Get locked tokens
   * @param arg0 - User identifier or other parameter (rename for clarity if needed)
   * @returns Locked token status
   */
  async getLockedTokens(arg0: string): Promise<{ trade: Array<TokenID>, withdraw: Array<TokenID>, liquidity: Array<TokenID> }> {
    return this.actor.getLockedTokens(arg0);
  }

  /**
   * Get operation
   * @param account - User identifier or other parameter
   * @param operationId - Operation ID or index
   * @returns Operation or null
   */
  async getOperation(account: string, operationId: bigint): Promise<Operation | null> {
    const result = await this.actor.getOperation(account, operationId);
    return result[0] ?? null;
  }

  /**
   * Get operation list
   * @param arg0 - Start index
   * @param arg1 - End index
   * @returns Operation list
   */
  async getOperations(arg0: bigint, arg1: bigint): Promise<Array<OperationAndId>> {
    return this.actor.getOperations(arg0, arg1);
  }

  /**
   * Get statistics
   * @param arg0 - Parameter 0 (rename for clarity if needed)
   * @returns Statistics
   */
  async getStats(arg0: string): Promise<Array<[string, string]>> {
     return this.actor.getStats(arg0);
  }

   /**
   * Get token
   * @param account - Account
   * @param tokenId - Token ID
   * @returns Token info or null
   */
  async getToken(account: string, tokenId: TokenID): Promise<Token | null> {
    const result = await this.actor.getToken(account, tokenId);
    return result[0] ?? null;
  }

  /**
   * Get token index
   * @param tokenID - Token ID
   * @returns Token index
   */
  async getTokenIndex(tokenID: TokenID): Promise<bigint> {
    return this.actor.getTokenIndex(tokenID);
  }

  /**
   * Add token
   * @param request - Add request
   * @returns Add response
   */
  async tokenAdd(request: AddRequest): Promise<AddResponse> {
    return this.actor.token_add(request);
  }

  /**
   * Mint rune
   * @param request - Mint request
   * @returns Mint response
   */
  async tokenEtch(request: EtchRequest): Promise<EtchResponse> {
    return this.actor.token_etch(request);
  }

  /**
   * Liquidity operation
   * @param request - Liquidity request
   * @returns Liquidity response
   */
  async tokenLiquidity(request: LiquidityRequest): Promise<LiquidityResponse> {
    return this.actor.token_liquidity(request);
  }

  /**
   * Mint token
   * @param request - Mint request
   * @returns Mint response
   */
  async tokenMint(request: MintRequest): Promise<MintResponse> {
    return this.actor.token_mint(request);
  }

  /**
   * Trade token
   * @param request - Trade request
   * @returns Trade response
   */
  async tokenTrade(request: TradeRequest): Promise<TradeResponse> {
    return this.actor.token_trade(request);
  }

  /**
   * Withdraw token
   * @param request - Withdraw request
   * @returns Withdraw response
   */
  async tokenWithdraw(request: WithdrawRequest): Promise<WithdrawResponse> {
    return this.actor.token_withdraw(request);
  }

  /**
   * Claim voucher
   * @param code - Voucher code
   * @returns Voucher amount or null
   */
  async voucherClaim(code: string): Promise<TokenAmount | null> {
    const result = await this.actor.voucher_claim(code);
    return result[0] ?? null;
  }

  /**
   * Convert Satoshi to BTC
   * @param satoshis - Satoshi amount
   * @returns BTC amount
   */
  static convertToBTC(satoshis: number): number {
    return Number((satoshis / 1000).toFixed(6));
  }

  /**
   * Convert Satoshi to token amount (confirm logic and unit as needed)
   * @param satoshis - Satoshi amount
   * @returns Token amount
   */
  static convertToTokenAmount(satoshis: number): number {
    // Note: This conversion may not apply to all tokens, depends on decimals
    return Number((satoshis / 100000000).toFixed(0)); // Assume 1 BTC = 10^8 satoshi, but tokens may have different decimals
  }

  /**
   * Calculate percent difference
   * @param a - Value A
   * @param b - Value B
   * @returns Percent difference
   */
  static calculatePercentDifference(a: number, b: number): number {
    if (a + b === 0) return 0; // Avoid division by zero
    const difference = Math.abs(a - b);
    const average = (a + b) / 2;
    // Avoid division by zero if average is 0 (when a = -b)
    return average === 0 ? Infinity : (difference / average) * 100;
  }
}

// No longer need module.exports