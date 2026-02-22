/**
 * Guest Questions Management API Route
 * POST /api/invitations/guest-questions - Create/update guest questions for an invitation
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const GuestQuestionsSchema = z.object({
  invitation_id: z.string().uuid(),
  questions: z.array(z.object({
    invitation_id: z.string().uuid(),
    question: z.string().min(1),
    order_index: z.number().int().min(0),
  })),
});

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
    }

    const parsed = GuestQuestionsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify invitation ownership
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id, owner_id')
      .eq('id', parsed.data.invitation_id)
      .eq('owner_id', userData.user.id)
      .single();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'INVITATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete existing questions
    await supabase
      .from('guest_questions')
      .delete()
      .eq('invitation_id', parsed.data.invitation_id);

    // Insert new questions
    if (parsed.data.questions.length > 0) {
      const { data: insertedQuestions, error: insertError } = await supabase
        .from('guest_questions')
        .insert(parsed.data.questions)
        .select('id, question, order_index');

      if (insertError) {
        console.error('Error inserting guest questions:', insertError);
        return NextResponse.json(
          { error: 'SERVER_ERROR', details: insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { ok: true, questions: insertedQuestions },
        { status: 201 }
      );
    }

    return NextResponse.json({ ok: true, questions: [] }, { status: 201 });
  } catch (error) {
    console.error('Error in guest questions API:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

