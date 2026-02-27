/**
 * Admin API: Testimonial Moderation
 * POST /api/admin/testimonials/moderate - Approve/reject testimonials in bulk
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/rbac';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const moderateSchema = z.object({
  testimonialIds: z.array(z.string()).min(1),
  action: z.enum(['approve', 'reject']),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check admin permission
    if (!isAdmin(user.email)) {
      logger.warn('Unauthorized testimonial moderation attempt', { userId: user.id });
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Parse and validate request
    const body = await request.json();
    const parsed = moderateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const { testimonialIds, action } = parsed.data;
    const approved = action === 'approve';
    
    // Update testimonials
    const { data, error } = await supabase
      .from('testimonials')
      .update({ approved, updated_at: new Date().toISOString() })
      .in('id', testimonialIds)
      .select();
    
    if (error) {
      logger.dbError('UPDATE', 'testimonials', error);
      throw error;
    }
    
    logger.info('Admin: Testimonials moderated', {
      adminId: user.id,
      action,
      count: testimonialIds.length,
    });
    
    return NextResponse.json({
      ok: true,
      action,
      moderated: data?.length || 0,
      testimonials: data,
    });
    
  } catch (error) {
    logger.apiError('POST', '/api/admin/testimonials/moderate', error as Error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to moderate testimonials' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/testimonials/moderate - Get pending testimonials
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check admin permission
    if (!isAdmin(user.email)) {
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Get pending testimonials
    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        id,
        invitation_id,
        name,
        message,
        approved,
        created_at,
        invitations (
          slug,
          bride_name,
          groom_name
        )
      `)
      .eq('approved', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      logger.dbError('SELECT', 'testimonials', error);
      throw error;
    }
    
    return NextResponse.json({
      testimonials: data || [],
      count: data?.length || 0,
    });
    
  } catch (error) {
    logger.apiError('GET', '/api/admin/testimonials/moderate', error as Error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to fetch pending testimonials' },
      { status: 500 }
    );
  }
}
