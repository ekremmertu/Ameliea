/**
 * Guest Answers API Route
 * POST /api/invitations/[slug]/guest-answers - Submit answers to guest questions
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const GuestAnswerSchema = z.object({
  rsvp_id: z.string().uuid(),
  answers: z.array(z.object({
    question_id: z.string().uuid(),
    answer: z.string().min(1, 'Answer cannot be empty'),
  })),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { slug } = await params;

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
    }

    const parsed = GuestAnswerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

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

    // Verify RSVP exists and belongs to this invitation
    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvps')
      .select('id, invitation_id')
      .eq('id', parsed.data.rsvp_id)
      .eq('invitation_id', invitation.id)
      .single();

    if (rsvpError || !rsvp) {
      return NextResponse.json(
        { error: 'RSVP_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Insert answers
    const answersToInsert = parsed.data.answers.map(answer => ({
      invitation_id: invitation.id,
      rsvp_id: parsed.data.rsvp_id,
      question_id: answer.question_id,
      answer: answer.answer,
    }));

    const { data: insertedAnswers, error: insertError } = await supabase
      .from('guest_answers')
      .upsert(answersToInsert, {
        onConflict: 'rsvp_id,question_id',
      })
      .select('id, question_id, answer');

    if (insertError) {
      console.error('Error inserting guest answers:', insertError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, answers: insertedAnswers },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in guest answers API:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

