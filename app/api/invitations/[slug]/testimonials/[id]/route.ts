/**
 * Testimonial by ID API Route
 * DELETE /api/invitations/[slug]/testimonials/[id] - Delete testimonial (owner only)
 * PATCH /api/invitations/[slug]/testimonials/[id] - Approve/reject testimonial (owner only)
 * 
 * Note: Testimonials table not yet in Supabase schema
 * This is a placeholder for future implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateTestimonialSchema = z.object({
  approved: z.boolean(),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
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

    const { slug, id } = await params;

    // Find invitation (RLS ensures only owner can access)
    const supabaseClient = supabase;
    const { data: invitation, error: invError } = await supabaseClient
      .from('invitations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Testimonials feature not yet implemented in Supabase schema
    // TODO: Add testimonials table to Supabase schema if needed
    return NextResponse.json(
      { error: 'Testimonials feature not yet implemented in Supabase schema' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
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

    const { slug, id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = updateTestimonialSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Find invitation (RLS ensures only owner can access)
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Testimonials feature not yet implemented in Supabase schema
    // TODO: Add testimonials table to Supabase schema if needed
    return NextResponse.json(
      { error: 'Testimonials feature not yet implemented in Supabase schema' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
