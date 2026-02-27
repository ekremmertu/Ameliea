/**
 * Purchases API Route
 * GET /api/purchases - Get user's purchase history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status'); // Filter by status
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('purchases')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status && ['pending', 'completed', 'cancelled', 'refunded'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: purchases, error: purchasesError, count } = await query;

    if (purchasesError) {
      console.error('Error fetching purchases:', purchasesError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: purchasesError.message },
        { status: 500 }
      );
    }

    // Calculate active purchases
    const activePurchases = purchases?.filter(p => {
      if (p.status !== 'completed') return false;
      if (!p.expires_at) return true; // No expiration = active
      return new Date(p.expires_at) > new Date();
    }) || [];

    return NextResponse.json({
      purchases: purchases || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
      stats: {
        total_purchases: count || 0,
        active_purchases: activePurchases.length,
        total_spent: purchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      },
    });

  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
