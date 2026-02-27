/**
 * Plan Upgrade API
 * POST /api/payments/upgrade - Upgrade from Light to Premium plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PLAN_PRICING, PLAN_TYPES } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const upgradeSchema = z.object({
  invitationId: z.string().uuid(),
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
    const parsed = upgradeSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const { invitationId } = parsed.data;
    
    // Get invitation and verify ownership
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('*, purchases!inner(*)')
      .eq('id', invitationId)
      .eq('owner_id', user.id)
      .single();
    
    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'INVITATION_NOT_FOUND', message: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    // Check current plan
    const currentPurchase = invitation.purchases[0];
    
    if (!currentPurchase) {
      return NextResponse.json(
        { error: 'NO_PURCHASE', message: 'No active purchase found for this invitation' },
        { status: 400 }
      );
    }
    
    if (currentPurchase.plan_type !== PLAN_TYPES.LIGHT) {
      return NextResponse.json(
        { error: 'INVALID_UPGRADE', message: 'Can only upgrade from Light to Premium plan' },
        { status: 400 }
      );
    }
    
    if (currentPurchase.status !== 'completed') {
      return NextResponse.json(
        { error: 'INVALID_STATUS', message: 'Current purchase must be completed' },
        { status: 400 }
      );
    }
    
    // Calculate upgrade price (difference between plans)
    const lightPrice = PLAN_PRICING[PLAN_TYPES.LIGHT].amount;
    const premiumPrice = PLAN_PRICING[PLAN_TYPES.PREMIUM].amount;
    const upgradePrice = premiumPrice - lightPrice;
    
    if (upgradePrice <= 0) {
      return NextResponse.json(
        { error: 'INVALID_PRICE', message: 'Invalid upgrade pricing' },
        { status: 500 }
      );
    }
    
    // Create upgrade purchase record
    const { data: upgradePurchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        plan_type: PLAN_TYPES.PREMIUM,
        amount: upgradePrice,
        currency: 'TRY',
        status: 'pending',
        is_upgrade: true,
        upgraded_from_purchase_id: currentPurchase.id,
        invitation_id: invitationId,
      })
      .select()
      .single();
    
    if (purchaseError || !upgradePurchase) {
      logger.dbError('INSERT', 'purchases', purchaseError as Error);
      throw purchaseError;
    }
    
    logger.paymentInitiated(user.id, upgradePrice, 'premium_upgrade');
    
    // TODO: Integrate with Iyzico payment gateway
    // For now, return the upgrade purchase details
    
    return NextResponse.json({
      ok: true,
      upgrade: {
        purchaseId: upgradePurchase.id,
        fromPlan: PLAN_TYPES.LIGHT,
        toPlan: PLAN_TYPES.PREMIUM,
        amount: upgradePrice,
        currency: 'TRY',
      },
      message: 'Upgrade initiated. Please complete payment.',
    });
    
  } catch (error) {
    logger.apiError('POST', '/api/payments/upgrade', error as Error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to process upgrade' },
      { status: 500 }
    );
  }
}
