/**
 * Invitation Tokens API Route
 * GET /api/invitations/[slug]/tokens - Get all tokens for an invitation
 * POST /api/invitations/[slug]/tokens - Create new token(s) for an invitation
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateToken } from '@/lib/token';

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
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { slug } = await params;

    // Get invitation and verify ownership
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

    // Get all tokens for this invitation
    const { data: tokens, error } = await supabase
      .from('invitation_guests')
      .select('id, token, guest_name, guest_email, status, opened_at, responded_at, created_at')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tokens:', error);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ tokens: tokens || [] }, { status: 200 });
  } catch (error) {
    console.error('Error in tokens API:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
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
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { slug } = await params;

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
    }

    const parsed = CreateTokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Get invitation and verify ownership
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
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, tokens: insertedTokens },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in tokens API:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

