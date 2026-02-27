/**
 * User Account API Route
 * DELETE /api/user/account - Delete user account (KVKK compliance)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE_MY_ACCOUNT'),
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate confirmation
    const validationResult = deleteAccountSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'CONFIRMATION_REQUIRED',
          message: 'Please confirm account deletion by sending { "confirmation": "DELETE_MY_ACCOUNT" }',
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

    // Note: Deleting the user from Supabase Auth will cascade delete related data
    // due to foreign key constraints (invitations, RSVPs, purchases, etc.)
    
    // Delete user account
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error deleting user account:', deleteError);
      return NextResponse.json(
        { error: 'DELETE_FAILED', details: deleteError.message },
        { status: 500 }
      );
    }

    // Sign out the user
    await supabase.auth.signOut();

    return NextResponse.json({
      ok: true,
      message: 'Account deleted successfully. All your data has been removed.',
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
