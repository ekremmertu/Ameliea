/**
 * Create Invitation API Route
 * POST /api/invitations/create
 * Requires authentication (Supabase Auth)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateToken } from '@/lib/token';

const CreateInvitationSchema = z.object({
  slug: z.string().min(3).max(64).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  title: z.string().min(1).max(120),
  host_names: z.string().max(120).optional().nullable(),
  date_iso: z.string().max(40).optional().nullable(),
  location: z.string().max(160).optional().nullable(),
  hero_image_url: z.union([z.string().url(), z.literal(''), z.null()]).optional().nullable(),
  language: z.enum(['tr', 'en']).default('tr'),
  template_id: z.string().max(80).optional().nullable(),
  theme_id: z.enum(['elegant', 'modern', 'romantic', 'classic', 'minimal']).default('elegant'),
  is_published: z.boolean().optional().default(true),
  require_token: z.boolean().optional().default(false),
  auto_generate_tokens: z.number().int().min(0).max(100).optional().default(0), // Otomatik kaç token oluşturulsun
});

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = CreateInvitationSchema.safeParse(body);
  if (!parsed.success) {
    console.error('Validation error:', parsed.error.flatten());
    return NextResponse.json(
      { 
        error: 'VALIDATION_ERROR', 
        details: parsed.error.flatten() 
      }, 
      { status: 400 }
    );
  }

  // Generate default token if require_token is true
  const defaultToken = parsed.data.require_token ? generateToken() : null;

  const payload = {
    owner_id: userData.user.id,
    slug: parsed.data.slug,
    title: parsed.data.title,
    host_names: parsed.data.host_names || null,
    date_iso: parsed.data.date_iso || null,
    location: parsed.data.location || null,
    hero_image_url: parsed.data.hero_image_url && parsed.data.hero_image_url !== '' ? parsed.data.hero_image_url : null,
    language: parsed.data.language,
    template_id: parsed.data.template_id || null,
    theme_id: parsed.data.theme_id,
    is_published: parsed.data.is_published,
    require_token: parsed.data.require_token,
    default_token: defaultToken,
    theme_config: {}, // Tema özel ayarlar için
  };

  const { data, error } = await supabase
    .from('invitations')
    .insert(payload)
    .select('id,slug,title,created_at,owner_id,default_token')
    .single();

  if (error) {
    console.error('Database error:', error);
    // Check for duplicate slug
    if (String(error.message).toLowerCase().includes('duplicate') || String(error.code) === '23505') {
      return NextResponse.json({ error: 'SLUG_TAKEN' }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'SERVER_ERROR', details: error.message, code: error.code }, 
      { status: 500 }
    );
  }

  // Otomatik token oluştur (eğer isteniyorsa)
  if (parsed.data.auto_generate_tokens && parsed.data.auto_generate_tokens > 0) {
    const tokensToInsert = Array.from({ length: parsed.data.auto_generate_tokens }, () => ({
      invitation_id: data.id,
      token: generateToken(),
      status: 'pending' as const,
    }));

    await supabase
      .from('invitation_guests')
      .insert(tokensToInsert);
  }

  return NextResponse.json({ ok: true, invitation: data }, { status: 201 });
}
