// src/api/CanisterInterface.did.d.ts

// This file provides type declarations for the auto-generated CanisterInterface.did.js

// It's often difficult to precisely type the IDL object and the service it produces
// in a simple .d.ts file without more context or potentially duplicating complex types.
// Using 'any' provides basic type checking for the existence of these exports.
// For a more strongly typed experience, consider tools or methods that generate
// TypeScript interfaces directly from your .did file if available (e.g. via dfx extensions or community tools).

/**
 * Represents the IDL object passed to idlFactory and init functions.
 * This is a simplified representation. For full type safety, you would
 * import or define the actual IDL types from @dfinity/candid or similar.
 */
interface CandidIDLObject {
    // Define known properties/methods of the IDL object if necessary
    // Example:
    // Record: (fields: Record<string, any>) => any;
    // Vec: (type: any) => any;
    // Text: any;
    // Principal: any;
    // Nat64: any;
    // ... and so on for all IDL types used in your .did.js file
    [key: string]: any; // General fallback for other IDL properties
}

interface IDLFactoryArgs {
    IDL: CandidIDLObject;
}

// Replace 'any' with a more specific type if you know the structure of the service
// e.g. import { _SERVICE } from './declarations/your_canister/your_canister.did';
// and use _SERVICE as the return type.
export declare const idlFactory: (args: IDLFactoryArgs) => any; 

// Replace 'any[]' with the actual type of the init args array if known.
export declare const init: (args: IDLFactoryArgs) => any[];