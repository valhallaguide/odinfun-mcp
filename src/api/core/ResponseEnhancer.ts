import { OdinFunService } from '../OdinFunService.js';

interface EnhanceableResponse {
  price?: number;
  price_sats?: number;
  price_usd?: number;
  balance?: number | string;
  balance_formatted?: string;
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
      } else if (key === 'balance' && (typeof obj[key] === 'number' || typeof obj[key] === 'string')) {
        try {
          // Process potentially large values using BigInt to avoid overflow
          const originalBalance = typeof obj[key] === 'string' ? obj[key] : obj[key].toString();
          
          // Use BigInt for large value calculations while preserving decimal precision
          const bigIntBalance = BigInt(originalBalance);
          const divisor = BigInt(100000000000); // 10^11
          
          // Calculate actual value while preserving decimals
          // Since BigInt doesn't support decimals, we need to handle decimal points manually
          const quotient = bigIntBalance / divisor;
          const remainder = bigIntBalance % divisor;
          
          // Convert remainder to decimal part string
          let decimalPart = remainder.toString().padStart(11, '0');
          // Remove trailing zeros
          decimalPart = decimalPart.replace(/0+$/, '');
          
          // Combine integer and decimal parts
          let actualBalanceStr = quotient.toString();
          if (decimalPart !== '') {
            actualBalanceStr = `${actualBalanceStr}.${decimalPart}`;
          }
          
          // Add formatted display
          let formattedBalance;
          const actualBalanceNum = parseFloat(actualBalanceStr);
          
          if (actualBalanceNum > 10000000000) {
            // For very large values, use scientific notation
            formattedBalance = actualBalanceNum.toExponential(6);
          } else {
            // Use string with decimal places
            formattedBalance = actualBalanceStr;
            
            // For larger values, add thousands separators (integer part only)
            /*
            if (actualBalanceNum > 1000) {
              const parts = formattedBalance.split('.');
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              formattedBalance = parts.join('.');
            }
            */
          }
          
          // Keep original value, add formatted display
          result.balance_formatted = formattedBalance;
        } catch (e) {
          console.error('Error processing balance:', e);
          // If processing fails, keep the original value
          result.balance_formatted = String(obj[key]);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = this.processObject(obj[key], btcPriceUsd);
      }
    }
    return result;
  }
} 