/**
 * Invitation Tokens API Route
 * GET /api/invitations/[slug]/tokens - Get all tokens for an invitation
 * POST /api/invitations/[slug]/tokens - Create new token(s) for an invitation
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateToken } from '@/lib/token';
import { apiError, validationError, parseJsonBodyOrError, ErrorCodes } from '@/lib/api-response';

const CreateTokenSchema = z.object({
  count: z.number().int().min(1).max(100).default(1), // Kaç token oluşturulacak
  guest_name: z.string().optional(),
  guest_email: z.string().email().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return apiError(ErrorCodes.UNAUTHORIZED, 401);
    }

    const { slug } = await params;

    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id, owner_id')
      .eq('slug', slug)
      .eq('owner_id', userData.user.id)
      .single();

    if (invError || !invitation) {
      return apiError(ErrorCodes.NOT_FOUND, 404, 'Invitation not found');
    }

    const { data: tokens, error } = await supabase
      .from('invitation_guests')
      .select('id, token, guest_name, guest_email, status, opened_at, responded_at, created_at')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tokens:', error);
      return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, error.message);
    }

    return NextResponse.json({ tokens: tokens || [] }, { status: 200 });
  } catch (error) {
    console.error('Error in tokens API:', error);
    return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return apiError(ErrorCodes.UNAUTHORIZED, 401);
    }

    const { slug } = await params;

    const parsedBody = await parseJsonBodyOrError(request);
    if (parsedBody.response) return parsedBody.response;
    const body = parsedBody.body;

    const parsed = CreateTokenSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // Get invitation and verify ownership
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id, owner_id')
      .eq('slug', slug)
      .eq('owner_id', userData.user.id)
      .single();

    if (invError || !invitation) {
      return apiError(ErrorCodes.NOT_FOUND, 404, 'Invitation not found');
    }

    // Generate tokens
    const tokensToInsert = Array.from({ length: parsed.data.count }, () => ({
      invitation_id: invitation.id,
      token: generateToken(),
      guest_name: parsed.data.guest_name || null,
      guest_email: parsed.data.guest_email || null,
      status: 'pending' as const,
    }));

    const { data: insertedTokens, error: insertError } = await supabase
      .from('invitation_guests')
      .insert(tokensToInsert)
      .select('id, token, guest_name, guest_email, status, created_at');

    if (insertError) {
      console.error('Error inserting tokens:', insertError);
      return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, insertError.message);
    }

    return NextResponse.json(
      { ok: true, tokens: insertedTokens },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in tokens API:', error);
    return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, error instanceof Error ? error.message : 'Unknown error');
  }
}

