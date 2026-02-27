/**
 * Testimonial Management API Route
 * PATCH /api/invitations/[slug]/testimonials/[id] - Approve/reject testimonial (owner only)
 * DELETE /api/invitations/[slug]/testimonials/[id] - Delete testimonial (owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateTestimonialSchema = z.object({
  approved: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = updateTestimonialSchema.safeParse(body);
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
      .select('id, owner_id')
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
        { error: 'FORBIDDEN', message: 'Only the invitation owner can manage testimonials' },
        { status: 403 }
      );
    }

    // Update testimonial
    const { data: testimonial, error: updateError } = await supabase
      .from('testimonials')
      .update({
        approved: validationResult.data.approved,
      })
      .eq('id', id)
      .eq('invitation_id', invitation.id)
      .select('id, approved, updated_at')
      .single();

    if (updateError) {
      console.error('Error updating testimonial:', updateError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: updateError.message },
        { status: 500 }
      );
    }

    if (!testimonial) {
      return NextResponse.json(
        { error: 'TESTIMONIAL_NOT_FOUND', message: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      testimonial,
      message: validationResult.data.approved ? 'Testimonial approved' : 'Testimonial rejected',
    });

  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
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
      .select('id, owner_id')
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
        { error: 'FORBIDDEN', message: 'Only the invitation owner can delete testimonials' },
        { status: 403 }
      );
    }

    // Delete testimonial
    const { error: deleteError } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)
      .eq('invitation_id', invitation.id);

    if (deleteError) {
      console.error('Error deleting testimonial:', deleteError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Testimonial deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
