import { OdinFunService } from '../OdinFunService.js';

interface EnhanceableResponse {
  price?: number;
  price_sats?: number;
  price_usd?: number;
  [key: string]: any;
}

export class ResponseEnhancer {
  constructor(private service: OdinFunService) {}

  /**
   * Enhances API response with price information
   * @param response - The API response to enhance
   * @returns Enhanced response with price_sats and price_usd fields
   */
  async enhanceResponse(response: any): Promise<any> {
    if (!response) return response;

    // Get BTC/USD price
    const btcPriceResp = await this.service.getBTCPrice();
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

    return this.processObject(response, btcPriceUsd);
  }

  /**
   * Process object recursively to add price information
   * @param obj - Object to process
   * @param btcPriceUsd - BTC price in USD
   * @returns Processed object with price information
   */
  private processObject(obj: any, btcPriceUsd: number): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Process array
    if (Array.isArray(obj)) {
      return obj.map(item => this.processObject(item, btcPriceUsd));
    }
    
    // Handle paginated responses
    if (obj.content && obj.content['application/json']?.data) {
      obj.content['application/json'].data = this.processObject(obj.content['application/json'].data, btcPriceUsd);
      return obj;
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
        result[key] = this.processObject(obj[key], btcPriceUsd);
      }
    }
    return result;
  }
} 