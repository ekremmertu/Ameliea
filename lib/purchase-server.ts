/**
 * Purchase Utilities (Server-side)
 * Helper functions for purchase checking on the server
 */

import { createSupabaseServerClient } from './supabase/server';

/**
 * Check if a user has an active purchase (server-side)
 */
export async function hasActivePurchaseServer(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;

  try {
    const supabase = await createSupabaseServerClient();
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

