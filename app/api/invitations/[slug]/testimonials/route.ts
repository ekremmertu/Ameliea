/**
 * Testimonials API Route
 * GET /api/invitations/[slug]/testimonials - Get all testimonials (public)
 * POST /api/invitations/[slug]/testimonials - Create testimonial (public)
 * 
 * Note: Testimonials table not yet in Supabase schema
 * This is a placeholder for future implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createTestimonialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message is too long'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Invitation slug is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Find invitation
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
    // TODO: Add testimonials table to Supabase schema
    return NextResponse.json({
      testimonials: [],
    });

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = createTestimonialSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Find invitation
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
    // TODO: Add testimonials table to Supabase schema
    return NextResponse.json(
      { error: 'Testimonials feature not yet implemented' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
