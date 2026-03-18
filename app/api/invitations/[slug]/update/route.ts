/**
 * Update Invitation API Route
 * PATCH /api/invitations/[slug]/update
 * Updates an existing invitation (only owner can update)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { apiError, validationError, parseJsonBodyOrError, ErrorCodes } from '@/lib/api-response';
import { requireAuth, getInvitationBySlug } from '@/lib/api-helpers';

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
    const auth = await requireAuth(supabase);
    if (auth.response) return auth.response;
    const user = auth.user;

    const { slug } = await params;

    const parsedBody = await parseJsonBodyOrError(request);
    if (parsedBody.response) return parsedBody.response;
    const body = parsedBody.body;

    const parsed = UpdateInvitationSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const invResult = await getInvitationBySlug<{ id: string; owner_id: string }>(supabase, slug, { requireOwner: true, userId: user.id });
    if (invResult.response) return invResult.response;
    const invitation = invResult.invitation!;

    // Update invitation
    const updateData: Record<string, unknown> = {};
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
      return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, updateError.message);
    }

    return NextResponse.json({ ok: true, invitation: updated }, { status: 200 });
  } catch (error) {
    console.error('Error in update invitation API:', error);
    return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, error instanceof Error ? error.message : 'Unknown error');
  }
}

