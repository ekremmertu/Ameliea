/**
 * Token Utilities
 * Helper functions for generating and validating invitation tokens
 */

import crypto from 'crypto';

/**
 * Generate a secure random token (32 characters)
 */
export function generateToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Validate token format (32 hex characters)
 */
export function isValidTokenFormat(token: string): boolean {
  return /^[a-f0-9]{32}$/i.test(token);
}

