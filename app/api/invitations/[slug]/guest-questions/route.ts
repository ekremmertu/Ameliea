/**
 * Guest Questions API Route
 * GET /api/invitations/[slug]/guest-questions - Get questions for an invitation
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { slug } = await params;

    // Get invitation by slug
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'INVITATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get guest questions
    const { data: questions, error } = await supabase
      .from('guest_questions')
      .select('id, question, order_index')
      .eq('invitation_id', invitation.id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching guest questions:', error);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: questions || [] }, { status: 200 });
  } catch (error) {
    console.error('Error in guest questions API:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

