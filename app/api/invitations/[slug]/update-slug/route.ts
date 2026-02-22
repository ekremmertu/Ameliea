/**
 * Update Invitation Slug API Route
 * POST /api/invitations/[slug]/update-slug
 * Requires authentication + ownership check
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateSlugSchema = z.object({
  newSlug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .max(100, 'Slug is too long'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check authentication
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = updateSlugSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { newSlug } = validationResult.data;

    // Find invitation (RLS ensures only owner can access)
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id,slug,title')
      .eq('slug', slug)
      .maybeSingle();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Check if new slug is already taken
    if (newSlug !== slug) {
      const { data: existing } = await supabase
        .from('invitations')
        .select('id')
        .eq('slug', newSlug)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        );
      }
    }

    // Update slug in database (RLS ensures only owner can update)
    const { data: updatedInvitation, error: updateError } = await supabase
      .from('invitations')
      .update({ slug: newSlug })
      .eq('id', invitation.id)
      .select('id,slug,title,updated_at')
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update slug', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: updatedInvitation.id,
        slug: updatedInvitation.slug,
        title: updatedInvitation.title,
        updatedAt: updatedInvitation.updated_at,
      },
    });

  } catch (error) {
    console.error('Error updating slug:', error);
    
    // Handle Prisma unique constraint error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
