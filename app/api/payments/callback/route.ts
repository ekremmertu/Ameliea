/**
 * Payment Callback API Route
 * POST /api/payments/callback
 * Handles Iyzico payment callback after 3D Secure authentication
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { handlePaymentCallback } from '@/lib/iyzico';
import { env } from '@/lib/env';

const CallbackSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  conversationData: z.string().optional(),
});

// Also handle GET requests (fallback - Iyzico may redirect with query params)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('paymentId');
    const conversationData = url.searchParams.get('conversationData') || undefined;

    if (!paymentId) {
      return NextResponse.json({ error: 'PAYMENT_ID_REQUIRED' }, { status: 400 });
    }

    // Use same logic as POST
    const callbackResult = await handlePaymentCallback({
      paymentId,
      conversationData,
    });

    if (callbackResult.status === 'failure') {
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/payment/failure?paymentId=${paymentId}&error=${encodeURIComponent(callbackResult.errorMessage || 'Payment failed')}`
      );
    }

    // Find purchase by transaction_id (paymentId)
    const supabase = await createSupabaseServerClient();
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id, user_id, plan_type, amount, status')
      .eq('transaction_id', paymentId)
      .eq('status', 'pending')
      .maybeSingle();

    if (!purchase) {
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/payment/failure?paymentId=${paymentId}&error=${encodeURIComponent('Purchase not found')}`
      );
    }

    if (callbackResult.paymentStatus === 'SUCCESS') {
      const expiresAt =
        purchase.plan_type === 'light'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : null;

      await supabase
        .from('purchases')
        .update({
          status: 'completed',
          expires_at: expiresAt,
        })
        .eq('id', purchase.id);

      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/payment/success?purchaseId=${purchase.id}`
      );
    } else {
      await supabase
        .from('purchases')
        .update({ status: 'cancelled' })
        .eq('id', purchase.id);

      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/payment/failure?paymentId=${paymentId}&error=${encodeURIComponent(callbackResult.errorMessage || 'Payment failed')}`
      );
    }
  } catch (error) {
    console.error('Payment callback GET error:', error);
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/payment/failure?error=${encodeURIComponent('Internal server error')}`
    );
  }
}

// Iyzico callback can be POST (form data) or GET (query params)
export async function POST(req: Request) {
  try {
    // Iyzico sends form data, not JSON
    const formData = await req.formData().catch(() => null);
    let paymentId: string | null = null;
    let conversationData: string | undefined = undefined;

    if (formData) {
      paymentId = formData.get('paymentId') as string | null;
      conversationData = formData.get('conversationData') as string | undefined;
    } else {
      // Fallback: try JSON
      const body = await req.json().catch(() => null);
      if (body) {
        paymentId = body.paymentId;
        conversationData = body.conversationData;
      }
    }

    if (!paymentId) {
      return NextResponse.json({ error: 'PAYMENT_ID_REQUIRED' }, { status: 400 });
    }

    const parsed = CallbackSchema.safeParse({ paymentId, conversationData });
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Handle payment callback with Iyzico
    const callbackResult = await handlePaymentCallback({
      paymentId: parsed.data.paymentId,
      conversationData: parsed.data.conversationData,
    });

    if (callbackResult.status === 'failure') {
      return NextResponse.json(
        {
          error: 'PAYMENT_CALLBACK_FAILED',
          details: callbackResult.errorMessage,
          errorCode: callbackResult.errorCode,
        },
        { status: 400 }
      );
    }

    // Find purchase by transaction_id (paymentId)
    const supabase = await createSupabaseServerClient();
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id, user_id, plan_type, amount, status')
      .eq('transaction_id', parsed.data.paymentId)
      .eq('status', 'pending')
      .maybeSingle();

    if (purchaseError || !purchase) {
      console.error('Purchase not found for payment:', parsed.data.paymentId);
      return NextResponse.json(
        {
          error: 'PURCHASE_NOT_FOUND',
          details: 'Purchase record not found for this payment',
        },
        { status: 404 }
      );
    }

    // Check payment status
    if (callbackResult.paymentStatus === 'SUCCESS') {
      // Payment successful - update purchase status
      const expiresAt =
        purchase.plan_type === 'light'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : null;

      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          status: 'completed',
          expires_at: expiresAt,
        })
        .eq('id', purchase.id);

      if (updateError) {
        console.error('Error updating purchase:', updateError);
        return NextResponse.json(
          {
            error: 'UPDATE_FAILED',
            details: 'Failed to update purchase status',
          },
          { status: 500 }
        );
      }

      // Redirect to success page
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/payment/success?purchaseId=${purchase.id}`
      );
    } else {
      // Payment failed - update purchase status
      await supabase
        .from('purchases')
        .update({ status: 'cancelled' })
        .eq('id', purchase.id);

      // Redirect to failure page
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/payment/failure?paymentId=${parsed.data.paymentId}&error=${encodeURIComponent(callbackResult.errorMessage || 'Payment failed')}`
      );
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

