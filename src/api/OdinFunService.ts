// src/api/OdinFunService.ts - Odin.fun API Service Aggregator
import { ApiClient, type ApiClientConfig } from './core/ApiClient.js';
import { ODIN_API_BASE_URL } from './core/constants.js';

import { AuthApiModule } from './modules/auth.js';
import { UserApiModule } from './modules/user.js';
import { TokenApiModule } from './modules/token.js';
import { TradeApiModule } from './modules/trade.js';
import { CommentsApiModule } from './modules/comments.js';
import { MarketApiModule } from './modules/market.js';
import { TokenTagApiModule } from './modules/tokenTag.js';
import { FavoriteApiModule } from './modules/favorite.js';
import { SettingsApiModule } from './modules/settings.js';
import { UploadApiModule } from './modules/upload.js';
import { BtcApiModule } from './modules/btc.js';
import { SnapshotApiModule } from './modules/snapshot.js';
import { ActivityApiModule } from './modules/activity.js';
import { RuneApiModule } from './modules/rune.js';
import { TransactionApiModule } from './modules/transaction.js';
import { SearchApiModule } from './modules/search.js';
import { BlifeApiModule } from './modules/blife.js';
import { StripeApiModule } from './modules/stripe.js';

export class OdinFunService {
  private client: ApiClient;
  
  // API Modules
  public readonly auth: AuthApiModule;
  public readonly user: UserApiModule;
  public readonly token: TokenApiModule;
  public readonly trade: TradeApiModule;
  public readonly comments: CommentsApiModule;
  public readonly market: MarketApiModule;
  public readonly tokenTag: TokenTagApiModule;
  public readonly favorite: FavoriteApiModule;
  public readonly settings: SettingsApiModule;
  public readonly upload: UploadApiModule;
  public readonly btc: BtcApiModule;
  public readonly snapshot: SnapshotApiModule;
  public readonly activity: ActivityApiModule;
  public readonly rune: RuneApiModule;
  public readonly transaction: TransactionApiModule;
  public readonly search: SearchApiModule;
  public readonly blife: BlifeApiModule;
  public readonly stripe: StripeApiModule;

  constructor(config: ApiClientConfig) {
    this.client = new ApiClient(config);
    this.auth = new AuthApiModule(this.client);
    this.user = new UserApiModule(this.client);
    this.token = new TokenApiModule(this.client);
    this.trade = new TradeApiModule(this.client);
    this.comments = new CommentsApiModule(this.client);
    this.market = new MarketApiModule(this.client);
    this.tokenTag = new TokenTagApiModule(this.client);
    this.favorite = new FavoriteApiModule(this.client);
    this.settings = new SettingsApiModule(this.client);
    this.upload = new UploadApiModule(this.client);
    this.btc = new BtcApiModule(this.client);
    this.snapshot = new SnapshotApiModule(this.client);
    this.activity = new ActivityApiModule(this.client);
    this.rune = new RuneApiModule(this.client);
    this.transaction = new TransactionApiModule(this.client);
    this.search = new SearchApiModule(this.client);
    this.blife = new BlifeApiModule(this.client);
    this.stripe = new StripeApiModule(this.client);
  }

  /**
   * Fetches the current BTC price.
   * This method is based on the REFACTORING_GUIDE.md example.
   * The endpoint /currency/btc is NOT defined in the provided odinfunapi.json.
   * This implementation assumes such an endpoint might exist or be added later.
   * It might require authentication (AuthParams) depending on actual API design.
   */
  async getBTCPrice(params?: any): Promise<any | null> {
    // If /currency/btc requires auth, params should be passed.
    // If it's a public endpoint, params might be undefined.
    // The ApiClient's mock implementation for /currency/btc currently doesn't enforce auth.
    try {
      const data = await this.client.get<any>('/currency/btc', params);
      return data;
    } catch (error) {
      console.error('[OdinFunService] Error fetching BTC price:', error);
      return null;
    }
  }

  // Potentially add other direct utility methods here if they don't fit a specific module
  // or are cross-cutting.
} 