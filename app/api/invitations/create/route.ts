/**
 * Create Invitation API Route
 * POST /api/invitations/create
 * Requires authentication (Supabase Auth)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateToken } from '@/lib/token';
import { apiError, validationError, parseJsonBodyOrError, ErrorCodes } from '@/lib/api-response';

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
  auto_generate_tokens: z.number().int().min(0).max(100).optional().default(0),
  custom_data: z.object({
    venueName: z.string().max(200).optional(),
    venueAddress: z.string().max(300).optional(),
    venueMapUrl: z.string().max(500).optional(),
    personalMessage: z.string().max(300).optional(),
    musicUrl: z.string().max(500).optional(),
    videoUrl: z.string().max(500).optional(),
    contactPhone: z.string().max(30).optional(),
    contactEmail: z.string().max(100).optional(),
    contactWhatsApp: z.string().max(30).optional(),
    scheduleItems: z.array(z.object({
      time: z.string(),
      event: z.string(),
      description: z.string(),
      icon: z.string().optional(),
    })).max(20).optional(),
    features: z.object({
      enableVideo: z.boolean().optional(),
      enableMusic: z.boolean().optional(),
      enableTestimonials: z.boolean().optional(),
      enableContact: z.boolean().optional(),
      enableSchedule: z.boolean().optional(),
      enableCountdown: z.boolean().optional(),
      enableEventCards: z.boolean().optional(),
      enableDressCode: z.boolean().optional(),
      enableFoodPreference: z.boolean().optional(),
      enableAdditionalServices: z.boolean().optional(),
    }).optional(),
    dressCode: z.string().max(200).optional(),
    faqs: z.array(z.object({
      question: z.string().max(300),
      answer: z.string().max(500),
    })).max(20).optional(),
    enableFAQs: z.boolean().optional(),
    themeColors: z.object({
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      fontFamily: z.string().optional(),
    }).optional(),
  }).optional(),
});

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return apiError(ErrorCodes.UNAUTHORIZED, 401);
  }

  const parsedBody = await parseJsonBodyOrError(req);
  if (parsedBody.response) return parsedBody.response;
  const body = parsedBody.body;

  const parsed = CreateInvitationSchema.safeParse(body);
  if (!parsed.success) {
    console.error('Validation error:', parsed.error.flatten());
    return validationError(parsed.error);
  }

  // Generate default token if require_token is true
  const defaultToken = parsed.data.require_token ? generateToken() : null;

  // Mevcut DB şemasıyla uyumlu payload (eksik kolonlar şema migration sonrası eklenecek)
  const basePayload = {
    owner_id: userData.user.id,
    slug: parsed.data.slug,
    title: parsed.data.title,
    host_names: parsed.data.host_names || null,
    date_iso: parsed.data.date_iso || null,
    location: parsed.data.location || null,
    hero_image_url: parsed.data.hero_image_url && parsed.data.hero_image_url !== '' ? parsed.data.hero_image_url : null,
    language: parsed.data.language,
    template_id: parsed.data.template_id || null,
    is_published: parsed.data.is_published,
  };

  // Şemada mevcut olabilecek kolonları ayrı tut (varsa gönderilir)
  const extendedFields: Record<string, unknown> = {};
  if (parsed.data.theme_id) extendedFields.theme_id = parsed.data.theme_id;
  if (parsed.data.require_token !== undefined) extendedFields.require_token = parsed.data.require_token;
  if (defaultToken) extendedFields.default_token = defaultToken;
  extendedFields.theme_config = parsed.data.custom_data || {};

  // Önce extended field'lar ile dene, hata alırsa base payload ile tekrar dene
  const insertData = { ...basePayload, ...extendedFields };

  const firstAttempt = await supabase
    .from('invitations')
    .insert(insertData)
    .select('id,slug,title,created_at,owner_id')
    .single();

  // Şema eksikliği nedeniyle hata alındıysa sadece base payload ile dene
  const { data, error } = (firstAttempt.error && (firstAttempt.error.code === 'PGRST204' || firstAttempt.error.message?.includes('column')))
    ? await (async () => {
        console.warn('Extended columns not in schema, retrying with base payload:', firstAttempt.error!.message);
        return supabase
          .from('invitations')
          .insert(basePayload)
          .select('id,slug,title,created_at,owner_id')
          .single();
      })()
    : firstAttempt;

  if (error) {
    console.error('Database error:', error);
    if (String(error.message).toLowerCase().includes('duplicate') || String(error.code) === '23505') {
      return NextResponse.json({ error: 'SLUG_TAKEN' }, { status: 409 });
    }
    return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, error.message);
  }

  // Otomatik token oluştur (eğer isteniyorsa ve tablo destekliyorsa)
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
