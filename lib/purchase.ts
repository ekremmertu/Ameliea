/**
 * Purchase Utilities
 * Helper functions for purchase checking
 */

import { createSupabaseBrowserClient } from './supabase/client';

export type PlanType = 'light' | 'premium' | null;

/**
 * Check if a user has an active purchase (client-side)
 */
export async function hasActivePurchase(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;

  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('purchases')
      .select('id, status, expires_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('purchased_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    // Check if purchase has expired
    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      if (expiresAt < now) {
        return false; // Purchase expired
      }
    }

    return true; // Active purchase found
  } catch (error) {
    console.error('Error checking purchase:', error);
    return false;
  }
}

/**
 * Get user's active plan type (client-side)
 * Returns 'light', 'premium', or null if no active purchase
 */
export async function getUserPlanType(userId: string | null | undefined): Promise<PlanType> {
  if (!userId) return null;

  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('purchases')
      .select('plan_type, status, expires_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('purchased_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Check if purchase has expired
    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      if (expiresAt < now) {
        return null; // Purchase expired
      }
    }

    return (data.plan_type as 'light' | 'premium') || null;
  } catch (error) {
    console.error('Error getting plan type:', error);
    return null;
  }
}
