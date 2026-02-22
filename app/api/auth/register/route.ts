/**
 * Register API Route
 * POST /api/auth/register
 * Server-side user registration (no email sent)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { env } from '@/lib/env';

const RegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  kvkkAccepted: z.boolean().refine((val) => val === true, {
    message: 'KVKK acceptance is required',
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Terms acceptance is required',
  }),
  marketingAccepted: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
    }

    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Use service role key to create user without sending email
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'SERVICE_ROLE_KEY_NOT_CONFIGURED' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create user with admin API (no email sent)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true, // Auto-confirm (no email sent)
      user_metadata: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        phone: parsed.data.phone || '',
        full_name: `${parsed.data.firstName} ${parsed.data.lastName}`,
        // Legal consents
        kvkk_accepted: parsed.data.kvkkAccepted,
        kvkk_accepted_at: new Date().toISOString(),
        terms_accepted: parsed.data.termsAccepted,
        terms_accepted_at: new Date().toISOString(),
        marketing_accepted: parsed.data.marketingAccepted || false,
        marketing_accepted_at: parsed.data.marketingAccepted ? new Date().toISOString() : null,
      },
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'USER_ALREADY_EXISTS' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'REGISTRATION_FAILED', details: authError.message },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'USER_CREATION_FAILED' },
        { status: 500 }
      );
    }

    // Return user data (client will handle login)
    return NextResponse.json({
      ok: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

