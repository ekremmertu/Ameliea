/**
 * Get RSVPs for Invitation API Route
 * GET /api/invitations/[slug]/rsvps
 * Requires authentication + ownership check (RLS handles this)
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check authentication
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Invitation slug is required' },
        { status: 400 }
      );
    }

    // Find invitation (RLS ensures only owner can access)
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (invError) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Fetch RSVPs (RLS ensures only owner can access)
    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false });

    if (rsvpError) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // Return formatted response
    return NextResponse.json({
      responses: (rsvps || []).map((rsvp: { id: string; full_name: string; email?: string; phone?: string; attendance: string; guests_count: number; note?: string; created_at: string }) => ({
        id: rsvp.id,
        name: rsvp.full_name,
        email: rsvp.email,
        phone: rsvp.phone,
        attending: rsvp.attendance === 'yes',
        guests: rsvp.guests_count,
        dietaryRestrictions: null, // Not in current schema
        message: rsvp.note,
        submittedAt: rsvp.created_at,
      })),
    });

  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
