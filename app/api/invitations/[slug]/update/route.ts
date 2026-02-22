/**
 * Update Invitation API Route
 * PATCH /api/invitations/[slug]/update
 * Updates an existing invitation (only owner can update)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const UpdateInvitationSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  host_names: z.string().max(120).optional(),
  date_iso: z.string().max(40).optional().nullable(),
  location: z.string().max(160).optional().nullable(),
  language: z.enum(['tr', 'en']).optional(),
  theme_id: z.enum(['elegant', 'modern', 'romantic', 'classic', 'minimal']).optional(),
  is_published: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { slug } = await params;

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
    }

    const parsed = UpdateInvitationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id, owner_id')
      .eq('slug', slug)
      .eq('owner_id', userData.user.id)
      .single();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'INVITATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update invitation
    const updateData: any = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.host_names !== undefined) updateData.host_names = parsed.data.host_names;
    if (parsed.data.date_iso !== undefined) updateData.date_iso = parsed.data.date_iso;
    if (parsed.data.location !== undefined) updateData.location = parsed.data.location;
    if (parsed.data.language !== undefined) updateData.language = parsed.data.language;
    if (parsed.data.theme_id !== undefined) updateData.theme_id = parsed.data.theme_id;
    if (parsed.data.is_published !== undefined) updateData.is_published = parsed.data.is_published;

    const { data: updated, error: updateError } = await supabase
      .from('invitations')
      .update(updateData)
      .eq('id', invitation.id)
      .select('id,slug,title,updated_at')
      .single();

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, invitation: updated }, { status: 200 });
  } catch (error) {
    console.error('Error in update invitation API:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

