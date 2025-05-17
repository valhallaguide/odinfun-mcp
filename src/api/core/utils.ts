// src/api/core/utils.ts - Odin.fun API common utility functions

/**
 * Example utility function: Convert prices or transform data.
 * This is a placeholder and can be expanded based on actual needs.
 */
export function convertSatoshisToBTC(satoshis: number): number {
  if (typeof satoshis !== 'number' || isNaN(satoshis)) {
    console.warn('[utils] Invalid input for convertSatoshisToBTC. Expected a number.');
    return 0;
  }
  return satoshis / 100000000;
}

export function convertBTCToSatoshis(btc: number): number {
  if (typeof btc !== 'number' || isNaN(btc)) {
    console.warn('[utils] Invalid input for convertBTCToSatoshis. Expected a number.');
    return 0;
  }
  return Math.round(btc * 100000000);
}

// Add other utility functions as needed.
// For example, data formatting functions, error checking helpers, etc.

/**
 * A simple utility to check if an object is an OdinFunErrorResponse.
 * Can be used in error handling logic within service or tool layers.
 */

export function isOdinFunError(obj: any): obj is any {
  return obj && typeof obj.code === 'number' && typeof obj.message === 'string' && obj.code !== 0;
}

// Original content commented out for now:
/*
export function someUtil(param: TestExport) {
  console.log(param.id);
}
*/ 