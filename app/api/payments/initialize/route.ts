/**
 * Payment Initialization API Route
 * POST /api/payments/initialize
 * Initializes Iyzico payment and returns 3D Secure HTML or payment form
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { initializePayment, type PaymentRequest } from '@/lib/iyzico';
import { env } from '@/lib/env';

const InitializePaymentSchema = z.object({
  plan_type: z.enum(['light', 'premium']),
  paymentCard: z.object({
    cardHolderName: z.string().min(3, 'Card holder name is required'),
    cardNumber: z.string().regex(/^\d{13,19}$/, 'Invalid card number'),
    expireMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid expire month (MM format)'),
    expireYear: z.string().regex(/^\d{2}$/, 'Invalid expire year (YY format)'),
    cvc: z.string().regex(/^\d{3,4}$/, 'Invalid CVC'),
  }),
  buyer: z.object({
    name: z.string().min(2, 'Name is required'),
    surname: z.string().min(2, 'Surname is required'),
    gsmNumber: z.string().min(10, 'Phone number is required'),
    email: z.string().email('Invalid email'),
    identityNumber: z.string().min(11, 'Identity number is required'),
    registrationAddress: z.string().min(10, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    country: z.string().default('Turkey'),
    zipCode: z.string().min(5, 'Zip code is required'),
  }),
  shippingAddress: z.object({
    contactName: z.string().min(2, 'Contact name is required'),
    city: z.string().min(2, 'City is required'),
    country: z.string().default('Turkey'),
    address: z.string().min(10, 'Address is required'),
    zipCode: z.string().min(5, 'Zip code is required'),
  }),
  billingAddress: z.object({
    contactName: z.string().min(2, 'Contact name is required'),
    city: z.string().min(2, 'City is required'),
    country: z.string().default('Turkey'),
    address: z.string().min(10, 'Address is required'),
    zipCode: z.string().min(5, 'Zip code is required'),
  }),
});

export async function POST(req: Request) {
  try {
    // Log request for debugging
    console.log('[Payment Initialize] POST request received at /api/payments/initialize');
    
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      console.log('[Payment Initialize] Unauthorized - no user');
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    
    console.log('[Payment Initialize] User authenticated:', userData.user.id);

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
    }

    const parsed = InitializePaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Check if user already has an active purchase
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id, status, expires_at')
      .eq('user_id', userData.user.id)
      .eq('status', 'completed')
      .order('purchased_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPurchase) {
      const hasExpired = existingPurchase.expires_at
        ? new Date(existingPurchase.expires_at) < new Date()
        : false;

      if (!hasExpired) {
        return NextResponse.json(
          { error: 'ALREADY_PURCHASED', message: 'User already has an active purchase' },
          { status: 409 }
        );
      }
    }

    // Calculate amount based on plan type
    const amount = parsed.data.plan_type === 'light' ? 1999.0 : 3999.0;
    const planName = parsed.data.plan_type === 'light' ? 'Light Plan' : 'Premium Plan';

    // Create a pending purchase record first (will be updated to completed after successful payment)
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: userData.user.id,
        plan_type: parsed.data.plan_type,
        status: 'pending',
        amount: amount,
        currency: 'TRY',
        payment_method: 'card',
        payment_provider: 'iyzico',
      })
      .select('id, created_at')
      .single();

    if (purchaseError || !purchase) {
      console.error('Error creating pending purchase:', purchaseError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: purchaseError?.message || 'Failed to create purchase record' },
        { status: 500 }
      );
    }

    // Prepare Iyzico payment request
    const paymentRequest: PaymentRequest = {
      price: amount,
      paidPrice: amount,
      currency: 'TRY',
      basketId: purchase.id,
      paymentCard: {
        cardHolderName: parsed.data.paymentCard.cardHolderName,
        cardNumber: parsed.data.paymentCard.cardNumber,
        expireMonth: parsed.data.paymentCard.expireMonth,
        expireYear: parsed.data.paymentCard.expireYear,
        cvc: parsed.data.paymentCard.cvc,
        registerCard: 0, // Don't register card
      },
      buyer: {
        id: userData.user.id,
        name: parsed.data.buyer.name,
        surname: parsed.data.buyer.surname,
        gsmNumber: parsed.data.buyer.gsmNumber,
        email: parsed.data.buyer.email,
        identityNumber: parsed.data.buyer.identityNumber,
        registrationAddress: parsed.data.buyer.registrationAddress,
        city: parsed.data.buyer.city,
        country: parsed.data.buyer.country,
        zipCode: parsed.data.buyer.zipCode,
      },
      shippingAddress: {
        contactName: parsed.data.shippingAddress.contactName,
        city: parsed.data.shippingAddress.city,
        country: parsed.data.shippingAddress.country,
        address: parsed.data.shippingAddress.address,
        zipCode: parsed.data.shippingAddress.zipCode,
      },
      billingAddress: {
        contactName: parsed.data.billingAddress.contactName,
        city: parsed.data.billingAddress.city,
        country: parsed.data.billingAddress.country,
        address: parsed.data.billingAddress.address,
        zipCode: parsed.data.billingAddress.zipCode,
      },
      basketItems: [
        {
          id: `plan-${parsed.data.plan_type}`,
          name: planName,
          category1: 'Subscription',
          itemType: 'VIRTUAL',
          price: amount,
        },
      ],
      callbackUrl: `${env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
      locale: 'tr',
      conversationId: `conv-${purchase.id}`,
    };

    // Initialize payment with Iyzico
    const paymentResult = await initializePayment(paymentRequest);

    if (paymentResult.status === 'failure') {
      // Update purchase status to cancelled
      await supabase
        .from('purchases')
        .update({ status: 'cancelled' })
        .eq('id', purchase.id);

      return NextResponse.json(
        {
          error: 'PAYMENT_INIT_FAILED',
          details: paymentResult.errorMessage,
          errorCode: paymentResult.errorCode,
        },
        { status: 400 }
      );
    }

    // Store payment ID in purchase record for tracking
    await supabase
      .from('purchases')
      .update({
        transaction_id: paymentResult.paymentId,
      })
      .eq('id', purchase.id);

    // Return 3D Secure HTML content
    return NextResponse.json({
      ok: true,
      paymentId: paymentResult.paymentId,
      conversationId: paymentResult.conversationId,
      htmlContent: paymentResult.htmlContent, // 3D Secure HTML to render
      purchaseId: purchase.id,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log full error details for debugging
    console.error('Full error details:', {
      message: errorMessage,
      stack: errorStack,
      error,
    });
    
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        details: errorMessage,
        // Only include stack in development
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}

