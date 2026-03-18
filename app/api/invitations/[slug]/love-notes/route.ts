/**
 * Love Notes API Route
 * POST /api/invitations/[slug]/love-notes
 * Public endpoint (no authentication required)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeLoveNoteData } from '@/lib/sanitize';
import { apiError, validationError, parseJsonBodyOrError, ErrorCodes } from '@/lib/api-response';

const CreateLoveNoteSchema = z.object({
  rsvp_id: z.string().uuid(),
  guest_name: z.string().min(2).max(120),
  guest_email: z.string().email().optional().or(z.literal('')),
  message: z.string().min(1).max(1000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();

    const parsedBody = await parseJsonBodyOrError(req);
    if (parsedBody.response) return parsedBody.response;
    const body = parsedBody.body;

    const parsed = CreateLoveNoteSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // Find invitation by slug
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id, is_published')
      .eq('slug', slug)
      .maybeSingle();

    if (invError) {
      console.error('Error finding invitation:', invError);
      return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, invError.message);
    }

    if (!invitation || !invitation.is_published) {
      return apiError(ErrorCodes.NOT_FOUND, 404, 'Invitation not found');
    }

    // Verify RSVP belongs to this invitation
    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvps')
      .select('id, invitation_id')
      .eq('id', parsed.data.rsvp_id)
      .eq('invitation_id', invitation.id)
      .maybeSingle();

    if (rsvpError || !rsvp) {
      return NextResponse.json({ error: 'INVALID_RSVP' }, { status: 400 });
    }

    // Sanitize user input to prevent XSS attacks
    const sanitizedData = sanitizeLoveNoteData({
      guest_name: parsed.data.guest_name,
      guest_email: parsed.data.guest_email,
      message: parsed.data.message,
    });

    // Insert love note
    const { data: loveNote, error: insertError } = await supabase
      .from('love_notes')
      .insert({
        invitation_id: invitation.id,
        rsvp_id: parsed.data.rsvp_id,
        guest_name: sanitizedData.guest_name,
        guest_email: sanitizedData.guest_email || null,
        message: sanitizedData.message,
      })
      .select('id, created_at')
      .single();

    if (insertError) {
      console.error('Error inserting love note:', insertError);
      return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, insertError.message);
    }

    return NextResponse.json({ ok: true, love_note: loveNote }, { status: 201 });
  } catch (error) {
    console.error('Love note API error:', error);
    return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, error instanceof Error ? error.message : 'Unknown error');
  }
}

