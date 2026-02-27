/**
 * Payment Status API Route
 * GET /api/payments/[id]/status - Check payment status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { checkPaymentStatus } from '@/lib/iyzico';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'INVALID_ID', message: 'Payment ID is required' },
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

    // Find purchase by ID and verify ownership
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (purchaseError) {
      console.error('Error finding purchase:', purchaseError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: purchaseError.message },
        { status: 500 }
      );
    }

    if (!purchase) {
      return NextResponse.json(
        { error: 'PURCHASE_NOT_FOUND', message: 'Purchase not found' },
        { status: 404 }
      );
    }

    if (purchase.user_id !== user.id) {
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'You can only check your own payment status' },
        { status: 403 }
      );
    }

    // If purchase is already completed or cancelled, return status from database
    if (purchase.status === 'completed' || purchase.status === 'cancelled' || purchase.status === 'refunded') {
      return NextResponse.json({
        purchase_id: purchase.id,
        status: purchase.status,
        plan_type: purchase.plan_type,
        amount: purchase.amount,
        currency: purchase.currency,
        purchased_at: purchase.purchased_at,
        expires_at: purchase.expires_at,
        payment_provider: purchase.payment_provider,
        transaction_id: purchase.transaction_id,
      });
    }

    // If pending, check with Iyzico
    if (purchase.transaction_id && purchase.payment_provider === 'iyzico') {
      try {
        const paymentStatus = await checkPaymentStatus(purchase.transaction_id);

        if (paymentStatus.status === 'success' && paymentStatus.paymentStatus === 'SUCCESS') {
          // Update purchase status to completed
          const { error: updateError } = await supabase
            .from('purchases')
            .update({
              status: 'completed',
              purchased_at: new Date().toISOString(),
            })
            .eq('id', purchase.id);

          if (updateError) {
            console.error('Error updating purchase status:', updateError);
          }

          return NextResponse.json({
            purchase_id: purchase.id,
            status: 'completed',
            plan_type: purchase.plan_type,
            amount: purchase.amount,
            currency: purchase.currency,
            purchased_at: new Date().toISOString(),
            payment_provider: purchase.payment_provider,
            transaction_id: purchase.transaction_id,
          });
        } else {
          // Payment failed or still pending
          return NextResponse.json({
            purchase_id: purchase.id,
            status: 'pending',
            payment_status: paymentStatus.paymentStatus,
            plan_type: purchase.plan_type,
            amount: purchase.amount,
            currency: purchase.currency,
            payment_provider: purchase.payment_provider,
          });
        }
      } catch (iyzicoError) {
        console.error('Error checking Iyzico payment status:', iyzicoError);
        // Return database status if Iyzico check fails
        return NextResponse.json({
          purchase_id: purchase.id,
          status: purchase.status,
          plan_type: purchase.plan_type,
          amount: purchase.amount,
          currency: purchase.currency,
          payment_provider: purchase.payment_provider,
          error: 'Payment provider check failed',
        });
      }
    }

    // Default: return database status
    return NextResponse.json({
      purchase_id: purchase.id,
      status: purchase.status,
      plan_type: purchase.plan_type,
      amount: purchase.amount,
      currency: purchase.currency,
      payment_provider: purchase.payment_provider,
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
