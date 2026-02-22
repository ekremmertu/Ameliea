/**
 * Create Purchase API Route
 * POST /api/purchases/create
 * Creates a purchase record for the authenticated user
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const CreatePurchaseSchema = z.object({
  plan_type: z.enum(['light', 'premium']),
  amount: z.number().positive(),
  currency: z.string().default('TRY'),
  payment_method: z.string().optional(),
  payment_provider: z.string().optional(),
  transaction_id: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
    }

    const parsed = CreatePurchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          details: parsed.error.flatten() 
        }, 
        { status: 400 }
      );
    }

    // Check if user already has an active purchase
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id, status, expires_at, plan_type')
      .eq('user_id', userData.user.id)
      .eq('status', 'completed')
      .order('purchased_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPurchase) {
      // Check if purchase has expired
      const hasExpired = existingPurchase.expires_at 
        ? new Date(existingPurchase.expires_at) < new Date()
        : false;

      if (!hasExpired) {
        // User already has active purchase
        return NextResponse.json(
          { error: 'ALREADY_PURCHASED', message: 'User already has an active purchase' },
          { status: 409 }
        );
      }
    }

    // Calculate expires_at based on plan_type
    // Light plan: 1 month from now
    // Premium plan: Lifetime (null)
    let expiresAt: string | null = null;
    if (parsed.data.plan_type === 'light') {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // Add 1 month
      expiresAt = expiryDate.toISOString();
    }
    // Premium plan: expires_at remains null (lifetime access)

    // Create purchase record
    const { data: purchase, error: insertError } = await supabase
      .from('purchases')
      .insert({
        user_id: userData.user.id,
        plan_type: parsed.data.plan_type,
        status: 'completed',
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        payment_method: parsed.data.payment_method || 'manual',
        payment_provider: parsed.data.payment_provider || 'test',
        transaction_id: parsed.data.transaction_id || `test-${Date.now()}`,
        expires_at: expiresAt,
      })
      .select('id, created_at, expires_at')
      .single();

    if (insertError) {
      console.error('Error creating purchase:', insertError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: insertError.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, purchase }, { status: 201 });
  } catch (error) {
    console.error('Purchase API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

