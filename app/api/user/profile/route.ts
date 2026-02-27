/**
 * User Profile API Route
 * GET /api/user/profile - Get current user profile
 * PATCH /api/user/profile - Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { sanitizeText, sanitizeEmail, sanitizePhone } from '@/lib/sanitize';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
});

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

    // Get user metadata
    const profile = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.user_metadata?.full_name || '',
      phone: user.user_metadata?.phone || '',
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    // Get user's purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('id, plan_type, status, amount, currency, purchased_at, expires_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('purchased_at', { ascending: false });

    if (purchasesError) {
      console.error('Error fetching purchases:', purchasesError);
    }

    // Get user's invitations count
    const { count: invitationsCount, error: countError } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id);

    if (countError) {
      console.error('Error counting invitations:', countError);
    }

    return NextResponse.json({
      profile,
      purchases: purchases || [],
      stats: {
        invitations_count: invitationsCount || 0,
        active_purchases: purchases?.filter(p => {
          if (!p.expires_at) return true; // No expiration = active
          return new Date(p.expires_at) > new Date();
        }).length || 0,
      },
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Sanitize input
    const updates: Record<string, string> = {};
    if (validationResult.data.name) {
      updates.name = sanitizeText(validationResult.data.name);
    }
    if (validationResult.data.phone) {
      updates.phone = sanitizePhone(validationResult.data.phone);
    }

    // Update user metadata
    const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
      data: updates,
    });

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'UPDATE_FAILED', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      profile: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        name: updatedUser.user.user_metadata?.name || '',
        phone: updatedUser.user.user_metadata?.phone || '',
        updated_at: updatedUser.user.updated_at,
      },
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
