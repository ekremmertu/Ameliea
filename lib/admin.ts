/**
 * Admin Utilities
 * Helper functions for admin role checking
 */

import { env } from './env';

/**
 * Check if an email is an admin
 * Works in both server-side and client-side contexts
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  // Try NEXT_PUBLIC_ADMIN_EMAILS first (client-side), then ADMIN_EMAILS (server-side)
  const adminEmailsStr = 
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_ADMIN_EMAILS : null) || // Client-side
    env.ADMIN_EMAILS || // Server-side via env.ts
    process.env.ADMIN_EMAILS || // Server-side direct
    process.env.NEXT_PUBLIC_ADMIN_EMAILS || // Fallback for client-side
    '';
  
  const adminEmails = adminEmailsStr.split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
  
  const isAdmin = adminEmails.includes(email.toLowerCase());
  
  // No console logs for security - admin emails should not be exposed
  return isAdmin;
}

/**
 * Get list of admin emails
 */
export function getAdminEmails(): string[] {
  return env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
}

