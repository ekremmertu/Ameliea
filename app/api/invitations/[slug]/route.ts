/**
 * Invitation API Route
 * GET /api/invitations/[slug] - Get invitation by slug (public)
 * DELETE /api/invitations/[slug] - Delete invitation (owner only)
 * Supports token-based access control
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isValidTokenFormat } from '@/lib/token';
import { getTheme, type ThemeId } from '@/lib/themes';
import { apiError, ErrorCodes } from '@/lib/api-response';

/** Test için mock davetiye — veritabanı olmadan /invitation/test-guest çalışsın */
const TEST_GUEST_SLUG = 'test-guest';
const MOCK_INVITATION = {
  id: 'test-invitation-id',
  slug: TEST_GUEST_SLUG,
  host_names: 'Ayşe & Mehmet',
  title: 'Ayşe & Mehmet',
  groomName: 'Mehmet',
  brideName: 'Ayşe',
  date_iso: '2026-04-15',
  weddingDate: '2026-04-15',
  weddingTime: '14:00',
  location: 'Örnek Mah. Düğün Sk. No:1, İstanbul',
  venueName: 'Gül Bahçesi Düğün Salonu',
  venueAddress: 'Örnek Mah. Düğün Sk. No:1, İstanbul',
  venueMapUrl: 'https://maps.google.com',
  personalMessage: 'Sizleri aramızda görmek bizi çok mutlu edecek.',
  rsvpDeadline: '2026-03-15',
  contactPhone: '+90 532 000 00 00',
  contactEmail: 'ornek@davetiye.com',
  contactWhatsApp: '+905320000000',
  scheduleItems: [
    { time: '14:00', event: 'Nikah', description: 'Nikah töreni' },
    { time: '16:00', event: 'Kokteyl', description: 'İkram ve sohbet' },
    { time: '19:00', event: 'Düğün', description: 'Yemek ve dans' },
  ],
  features: {
    enableTestimonials: true,
    enableContact: true,
    enableSchedule: true,
  },
  theme_id: 'elegant' as const,
  theme: {
    primaryColor: '#c8a24a',
    secondaryColor: '#a12b3a',
    fontFamily: 'serif',
  },
  isOwner: false, // test davetiyesinde sahip yok
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 400, 'Invitation slug is required');
    }

    // Test slug: only in development (avoid real invitation slug collision in production)
    const allowTestSlugs = process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_ALLOW_TEST_SLUGS === 'true';
    const testSlugs = [TEST_GUEST_SLUG, 'test', 'demo'];
    if (allowTestSlugs && testSlugs.includes(slug.toLowerCase())) {
      return NextResponse.json(MOCK_INVITATION);
    }

    // Get token from query params
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    const supabase = await createSupabaseServerClient();

    // Fetch invitation from database (RLS allows public read for published invitations)
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching invitation:', error);
      return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, error.message);
    }

    if (!invitation) {
      return apiError(ErrorCodes.NOT_FOUND, 404, 'Invitation not found');
    }

    // Token kontrolü
    if (invitation.require_token) {
      // Token zorunlu ise kontrol et
      if (!token) {
        return apiError(ErrorCodes.FORBIDDEN, 403, 'This invitation requires a token to access');
      }

      // Token formatını kontrol et
      if (!isValidTokenFormat(token)) {
        return apiError(ErrorCodes.VALIDATION_ERROR, 400, 'Invalid token format');
      }

      // Token'ın geçerli olup olmadığını kontrol et
      // 1. Default token kontrolü
      if (invitation.default_token === token) {
        // Default token geçerli, kullanım sayacını artır
        await supabase
          .from('invitations')
          .update({ current_uses: (invitation.current_uses || 0) + 1 })
          .eq('id', invitation.id);
      } else {
        // 2. Guest token kontrolü
        const { data: guestToken, error: tokenError } = await supabase
          .from('invitation_guests')
          .select('id, status, opened_at')
          .eq('invitation_id', invitation.id)
          .eq('token', token)
          .maybeSingle();

        if (tokenError || !guestToken) {
          return apiError(ErrorCodes.FORBIDDEN, 403, 'Invalid or expired token');
        }

        // Token'ı "opened" olarak işaretle (eğer henüz açılmadıysa)
        if (guestToken.status === 'pending') {
          await supabase
            .from('invitation_guests')
            .update({ 
              status: 'opened',
              opened_at: new Date().toISOString(),
            })
            .eq('id', guestToken.id);
        }
      }

      // Süre ve kullanım limiti kontrolü (admin tarafından ayarlanmışsa)
      if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
        return apiError(ErrorCodes.FORBIDDEN, 403, 'This invitation has expired');
      }

      if (invitation.max_uses && (invitation.current_uses || 0) >= invitation.max_uses) {
        return apiError(ErrorCodes.FORBIDDEN, 403, 'Maximum usage limit reached');
      }
    }

    // Sahiplik: giriş yapan kullanıcı bu davetiyenin sahibi mi? (sadece sahip yönetim linki görsün)
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = !!(user && invitation.owner_id && invitation.owner_id === user.id);

    // Tema: theme_id kolonu yoksa template_id'den türet
    const themeId = (
      invitation.theme_id ||
      (invitation.template_id ? require('@/lib/theme-assets').getThemeAssetsByStyleKey(invitation.template_id)?.themeId : null) ||
      'elegant'
    ) as ThemeId;
    const themeConfig = getTheme(themeId);

    // Extract custom data from theme_config (stored during creation)
    const customData = (invitation.theme_config && typeof invitation.theme_config === 'object')
      ? invitation.theme_config as Record<string, unknown>
      : {};

    // Return formatted response (compatible with existing frontend)
    return NextResponse.json({
      id: invitation.id,
      slug: invitation.slug,
      coupleName: invitation.host_names || invitation.title,
      title: invitation.title,
      host_names: invitation.host_names,
      weddingDate: invitation.date_iso,
      venueName: (customData.venueName as string) || invitation.location,
      venueAddress: (customData.venueAddress as string) || invitation.location,
      venueMapUrl: (customData.venueMapUrl as string) || undefined,
      personalMessage: (customData.personalMessage as string) || undefined,
      musicUrl: (customData.musicUrl as string) || undefined,
      videoUrl: (customData.videoUrl as string) || undefined,
      contactPhone: (customData.contactPhone as string) || undefined,
      contactEmail: (customData.contactEmail as string) || undefined,
      contactWhatsApp: (customData.contactWhatsApp as string) || undefined,
      scheduleItems: (customData.scheduleItems as Array<Record<string, string>>) || undefined,
      features: (customData.features as Record<string, boolean>) || undefined,
      dressCode: (customData.dressCode as string) || undefined,
      faqs: (customData.faqs as Array<Record<string, string>>) || undefined,
      enableFAQs: (customData.enableFAQs as boolean) || false,
      theme_id: themeId,
      theme: (customData.themeColors as Record<string, string>) || {
        primaryColor: themeConfig.colors.primary,
        secondaryColor: themeConfig.colors.secondary,
        fontFamily: themeConfig.fonts.heading,
      },
      createdAt: invitation.created_at,
      updatedAt: invitation.updated_at,
      isOwner,
    });

  } catch (error) {
    console.error('Error fetching invitation:', error);
    return apiError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      500,
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 400, 'Invitation slug is required');
    }

    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return apiError(ErrorCodes.UNAUTHORIZED, 401, 'Authentication required');
    }

    // Find invitation and verify ownership
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id, owner_id')
      .eq('slug', slug)
      .maybeSingle();

    if (invError) {
      console.error('Error finding invitation:', invError);
      return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, invError.message);
    }

    if (!invitation) {
      return apiError(ErrorCodes.NOT_FOUND, 404, 'Invitation not found');
    }

    if (invitation.owner_id !== user.id) {
      return apiError(ErrorCodes.FORBIDDEN, 403, 'Only the invitation owner can delete this invitation');
    }

    // Delete invitation (cascade will delete related records)
    const { error: deleteError } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitation.id);

    if (deleteError) {
      console.error('Error deleting invitation:', deleteError);
      return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, deleteError.message);
    }

    return NextResponse.json({
      ok: true,
      message: 'Invitation deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting invitation:', error);
    return apiError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      500,
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
