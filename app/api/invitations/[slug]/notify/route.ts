/**
 * Send Invitations API Route
 * POST /api/invitations/[slug]/notify - Send invitation to guests (owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { sendBulkInvitations } from '@/lib/notifications';
import { env } from '@/lib/env';

const notifyGuestsSchema = z.object({
  guests: z.array(z.object({
    email: z.string().email(),
    name: z.string().min(1),
    token: z.string().optional(),
  })).min(1).max(100), // Max 100 guests per request
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = notifyGuestsSchema.safeParse(body);
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

    // Find invitation and verify ownership
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id, owner_id, title, host_names, is_published')
      .eq('slug', slug)
      .maybeSingle();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'INVITATION_NOT_FOUND', message: 'Invitation not found' },
        { status: 404 }
      );
    }

    if (invitation.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'Only the invitation owner can send notifications' },
        { status: 403 }
      );
    }

    if (!invitation.is_published) {
      return NextResponse.json(
        { error: 'INVITATION_NOT_PUBLISHED', message: 'Invitation must be published before sending' },
        { status: 400 }
      );
    }

    // Send invitations
    const invitationTitle = invitation.title || invitation.host_names || 'Wedding Invitation';
    const baseUrl = env.NEXT_PUBLIC_APP_URL;

    const { sent, failed, results } = await sendBulkInvitations(
      validationResult.data.guests,
      invitationTitle,
      slug,
      baseUrl
    );

    // Log notification activity (optional: store in database)
    console.log(`Sent ${sent} invitations, ${failed} failed for invitation ${slug}`);

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: validationResult.data.guests.length,
      message: `Successfully sent ${sent} invitation(s). ${failed} failed.`,
    });

  } catch (error) {
    console.error('Notify API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
