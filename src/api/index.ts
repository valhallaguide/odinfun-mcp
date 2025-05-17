// src/api/index.ts - Main export entry point for the API client structure

export { OdinFunService } from './OdinFunService.js';
export type { ApiClientConfig } from './core/ApiClient.js'; // Exporting ApiClientConfig might be useful for consumers

// Export all core types if they are intended for external use by consumers of the service
export * from './core/types.js';

// Optionally, export module classes if direct instantiation or access is desired,
// though typically interaction would be through OdinFunService.
// export * from './modules/auth.js';
// export * from './modules/user.js';
// export * from './modules/token.js';
// export * from './modules/game.js';
// ... etc.

// Export core client and error too, if needed externally
// export { ApiClient, ApiError } from './core/ApiClient.js'; 