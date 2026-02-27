/**
 * Testimonials API Route
 * GET /api/invitations/[slug]/testimonials - Get testimonials (approved ones for public, all for owner)
 * POST /api/invitations/[slug]/testimonials - Create testimonial (public, requires approval)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { sanitizeTestimonialData } from '@/lib/sanitize';

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
        { error: 'INVALID_SLUG', message: 'Invitation slug is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Find invitation
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id, owner_id, is_published')
      .eq('slug', slug)
      .maybeSingle();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'INVITATION_NOT_FOUND', message: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Check if user is owner
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user && user.id === invitation.owner_id;

    // Build query based on ownership
    let query = supabase
      .from('testimonials')
      .select('id, name, message, approved, created_at')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false });

    // Non-owners can only see approved testimonials
    if (!isOwner) {
      query = query.eq('approved', true);
    }

    const { data: testimonials, error: testimonialsError } = await query;

    if (testimonialsError) {
      console.error('Error fetching testimonials:', testimonialsError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: testimonialsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      testimonials: testimonials || [],
      isOwner,
    });

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
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
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = createTestimonialSchema.safeParse(body);
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

    // Find invitation
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id, is_published')
      .eq('slug', slug)
      .maybeSingle();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'INVITATION_NOT_FOUND', message: 'Invitation not found' },
        { status: 404 }
      );
    }

    if (!invitation.is_published) {
      return NextResponse.json(
        { error: 'INVITATION_NOT_PUBLISHED', message: 'This invitation is not published' },
        { status: 403 }
      );
    }

    // Sanitize user input to prevent XSS attacks
    const sanitizedData = sanitizeTestimonialData({
      name: validationResult.data.name,
      message: validationResult.data.message,
    });

    // Insert testimonial (will be pending approval by default)
    const { data: testimonial, error: insertError } = await supabase
      .from('testimonials')
      .insert({
        invitation_id: invitation.id,
        name: sanitizedData.name,
        message: sanitizedData.message,
        approved: false, // Requires owner approval
      })
      .select('id, created_at')
      .single();

    if (insertError) {
      console.error('Error creating testimonial:', insertError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      testimonial,
      message: 'Testimonial submitted successfully. It will be visible after approval.',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
