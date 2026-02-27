/**
 * Payment Refund API
 * POST /api/payments/refund - Initiate refund for a purchase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/rbac';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const refundSchema = z.object({
  purchaseId: z.string().uuid(),
  reason: z.string().min(10).max(500),
  amount: z.number().positive().optional(),
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
    
    // Only super admins can process refunds
    if (!isSuperAdmin(user.email)) {
      logger.warn('Unauthorized refund attempt', { userId: user.id });
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'Super admin access required' },
        { status: 403 }
      );
    }
    
    // Parse and validate request
    const body = await request.json();
    const parsed = refundSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const { purchaseId, reason, amount } = parsed.data;
    
    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();
    
    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'PURCHASE_NOT_FOUND', message: 'Purchase not found' },
        { status: 404 }
      );
    }
    
    // Check if purchase is eligible for refund
    if (purchase.status !== 'completed') {
      return NextResponse.json(
        { error: 'INVALID_STATUS', message: 'Only completed purchases can be refunded' },
        { status: 400 }
      );
    }
    
    // Calculate refund amount (full or partial)
    const refundAmount = amount || purchase.amount;
    
    if (refundAmount > purchase.amount) {
      return NextResponse.json(
        { error: 'INVALID_AMOUNT', message: 'Refund amount exceeds purchase amount' },
        { status: 400 }
      );
    }
    
    // TODO: Integrate with Iyzico refund API
    // For now, we'll just update the database
    
    // Update purchase status
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        status: 'refunded',
        refund_amount: refundAmount,
        refund_reason: reason,
        refunded_at: new Date().toISOString(),
        refunded_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', purchaseId);
    
    if (updateError) {
      logger.dbError('UPDATE', 'purchases', updateError);
      throw updateError;
    }
    
    logger.info('Payment refunded', {
      adminId: user.id,
      purchaseId,
      amount: refundAmount,
      reason,
    });
    
    return NextResponse.json({
      ok: true,
      refund: {
        purchaseId,
        amount: refundAmount,
        reason,
        refundedAt: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    logger.apiError('POST', '/api/payments/refund', error as Error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
