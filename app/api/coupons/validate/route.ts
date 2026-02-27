/**
 * Coupon Validation API
 * POST /api/coupons/validate - Validate a coupon code
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const validateSchema = z.object({
  code: z.string().min(3).max(50),
  planType: z.enum(['light', 'premium']),
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
    
    // Parse and validate request
    const body = await request.json();
    const parsed = validateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const { code, planType } = parsed.data;
    
    // Get coupon from database
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();
    
    if (couponError || !coupon) {
      return NextResponse.json(
        { error: 'INVALID_COUPON', message: 'Coupon code is invalid' },
        { status: 404 }
      );
    }
    
    // Check if coupon is active
    if (!coupon.is_active) {
      return NextResponse.json(
        { error: 'INACTIVE_COUPON', message: 'This coupon is no longer active' },
        { status: 400 }
      );
    }
    
    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'EXPIRED_COUPON', message: 'This coupon has expired' },
        { status: 400 }
      );
    }
    
    // Check usage limit
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json(
        { error: 'COUPON_LIMIT_REACHED', message: 'This coupon has reached its usage limit' },
        { status: 400 }
      );
    }
    
    // Check if user already used this coupon
    const { data: userUsage } = await supabase
      .from('coupon_usage')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('user_id', user.id)
      .single();
    
    if (userUsage && !coupon.allow_multiple_uses) {
      return NextResponse.json(
        { error: 'COUPON_ALREADY_USED', message: 'You have already used this coupon' },
        { status: 400 }
      );
    }
    
    // Check plan type restriction
    if (coupon.applicable_plans && !coupon.applicable_plans.includes(planType)) {
      return NextResponse.json(
        { error: 'INVALID_PLAN', message: 'This coupon is not valid for the selected plan' },
        { status: 400 }
      );
    }
    
    logger.info('Coupon validated', {
      userId: user.id,
      couponCode: code,
      planType,
    });
    
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        description: coupon.description,
      },
    });
    
  } catch (error) {
    logger.apiError('POST', '/api/coupons/validate', error as Error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
