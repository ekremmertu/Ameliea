/**
 * Plan Upgrade API
 * POST /api/payments/upgrade - Upgrade from Light to Premium plan (Iyzico: charge price difference only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PLAN_PRICING, PLAN_TYPES } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { initializePayment, type PaymentRequest } from '@/lib/iyzico';
import { env } from '@/lib/env';
import { z } from 'zod';

const upgradeSchema = z.object({
  invitationId: z.string().uuid(),
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
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: 'Invalid request body' },
        { status: 400 }
      );
    }
    const parsed = upgradeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const { invitationId, paymentCard, buyer, shippingAddress, billingAddress } = parsed.data;
    
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
        payment_method: 'card',
        payment_provider: 'iyzico',
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

    const paymentRequest: PaymentRequest = {
      price: upgradePrice,
      paidPrice: upgradePrice,
      currency: 'TRY',
      basketId: upgradePurchase.id,
      paymentCard: {
        cardHolderName: paymentCard.cardHolderName,
        cardNumber: paymentCard.cardNumber,
        expireMonth: paymentCard.expireMonth,
        expireYear: paymentCard.expireYear,
        cvc: paymentCard.cvc,
        registerCard: 0,
      },
      buyer: {
        id: user.id,
        name: buyer.name,
        surname: buyer.surname,
        gsmNumber: buyer.gsmNumber,
        email: buyer.email,
        identityNumber: buyer.identityNumber,
        registrationAddress: buyer.registrationAddress,
        city: buyer.city,
        country: buyer.country,
        zipCode: buyer.zipCode,
      },
      shippingAddress: {
        contactName: shippingAddress.contactName,
        city: shippingAddress.city,
        country: shippingAddress.country,
        address: shippingAddress.address,
        zipCode: shippingAddress.zipCode,
      },
      billingAddress: {
        contactName: billingAddress.contactName,
        city: billingAddress.city,
        country: billingAddress.country,
        address: billingAddress.address,
        zipCode: billingAddress.zipCode,
      },
      basketItems: [
        {
          id: 'plan-upgrade-light-to-premium',
          name: 'Plan Upgrade (Light → Premium)',
          category1: 'Subscription',
          itemType: 'VIRTUAL',
          price: upgradePrice,
        },
      ],
      callbackUrl: `${env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
      locale: 'tr',
      conversationId: `conv-upgrade-${upgradePurchase.id}`,
    };

    const paymentResult = await initializePayment(paymentRequest);

    if (paymentResult.status === 'failure') {
      await supabase
        .from('purchases')
        .update({ status: 'cancelled' })
        .eq('id', upgradePurchase.id);

      return NextResponse.json(
        {
          error: 'PAYMENT_INIT_FAILED',
          details: paymentResult.errorMessage,
          errorCode: paymentResult.errorCode,
        },
        { status: 400 }
      );
    }

    await supabase
      .from('purchases')
      .update({ transaction_id: paymentResult.paymentId })
      .eq('id', upgradePurchase.id);

    return NextResponse.json({
      ok: true,
      paymentId: paymentResult.paymentId,
      conversationId: paymentResult.conversationId,
      htmlContent: paymentResult.htmlContent,
      purchaseId: upgradePurchase.id,
    });
    
  } catch (error) {
    logger.apiError('POST', '/api/payments/upgrade', error as Error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to process upgrade' },
      { status: 500 }
    );
  }
}
