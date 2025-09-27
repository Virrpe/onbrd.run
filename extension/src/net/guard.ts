/**
 * Network Guard Module - Privacy Local-Only Mode
 * 
 * This module provides guarded versions of fetch and WebSocket that respect
 * the LOCAL_ONLY and ALLOW_NETWORK configuration settings.
 */

import { LOCAL_ONLY, ALLOW_NETWORK } from '../config';

/**
 * Error thrown when network access is disabled in local-only mode
 */
export class NetworkDisabledError extends Error {
  constructor(message: string = 'Network access is disabled in local-only mode') {
    super(message);
    this.name = 'NetworkDisabledError';
  }
}

/**
 * Guarded fetch function that respects privacy settings
 * @param input - The resource to fetch
 * @param init - Optional fetch options
 * @returns Promise that resolves to Response or throws NetworkDisabledError
 */
export async function guardedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Check if network access is allowed
  if (LOCAL_ONLY && !ALLOW_NETWORK) {
    throw new NetworkDisabledError(`Cannot fetch ${input}: Network access is disabled in local-only mode`);
  }
  
  // If we reach here, network access is allowed - proceed with normal fetch
  return fetch(input, init);
}

/**
 * Guarded WebSocket constructor that respects privacy settings
 * @param url - The WebSocket URL
 * @param protocols - Optional protocols
 * @returns WebSocket instance or throws NetworkDisabledError
 */
export function guardedWebSocket(url: string | URL, protocols?: string | string[]): WebSocket {
  // Check if network access is allowed
  if (LOCAL_ONLY && !ALLOW_NETWORK) {
    throw new NetworkDisabledError(`Cannot connect to WebSocket ${url}: Network access is disabled in local-only mode`);
  }
  
  // If we reach here, network access is allowed - proceed with normal WebSocket
  return new WebSocket(url, protocols);
}

/**
 * Check if network access is currently allowed
 * @returns true if network access is allowed, false otherwise
 */
export function isNetworkAllowed(): boolean {
  return !(LOCAL_ONLY && !ALLOW_NETWORK);
}

/**
 * Get current network guard status for debugging
 * @returns object with current network guard settings
 */
export function getNetworkGuardStatus() {
  return {
    local_only: LOCAL_ONLY,
    allow_network: ALLOW_NETWORK,
    network_allowed: isNetworkAllowed()
  };
}