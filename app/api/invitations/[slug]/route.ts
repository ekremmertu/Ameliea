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
  venuePhotos: [] as string[],
  personalMessage: 'Sizleri aramızda görmek bizi çok mutlu edecek.',
  rsvpDeadline: '2026-03-15',
  musicUrl: undefined as string | undefined,
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  contactPhone: '+90 532 000 00 00',
  contactEmail: 'ornek@davetiye.com',
  contactWhatsApp: '+905320000000',
  scheduleItems: [
    { time: '14:00', event: 'Nikah', description: 'Nikah töreni' },
    { time: '16:00', event: 'Kokteyl', description: 'İkram ve sohbet' },
    { time: '19:00', event: 'Düğün', description: 'Yemek ve dans' },
  ],
  features: {
    enableVideo: true,
    enableMusic: false,
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
      return NextResponse.json(
        { error: 'Invitation slug is required' },
        { status: 400 }
      );
    }

    // Test slug: veritabanına gitmeden mock davetiye dön (test-guest, test, demo)
    const testSlugs = [TEST_GUEST_SLUG, 'test', 'demo'];
    if (testSlugs.includes(slug.toLowerCase())) {
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
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Token kontrolü
    if (invitation.require_token) {
      // Token zorunlu ise kontrol et
      if (!token) {
        return NextResponse.json(
          { error: 'TOKEN_REQUIRED', message: 'This invitation requires a token to access' },
          { status: 403 }
        );
      }

      // Token formatını kontrol et
      if (!isValidTokenFormat(token)) {
        return NextResponse.json(
          { error: 'INVALID_TOKEN_FORMAT' },
          { status: 400 }
        );
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
          return NextResponse.json(
            { error: 'INVALID_TOKEN', message: 'Invalid or expired token' },
            { status: 403 }
          );
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
        return NextResponse.json(
          { error: 'INVITATION_EXPIRED', message: 'This invitation has expired' },
          { status: 403 }
        );
      }

      if (invitation.max_uses && (invitation.current_uses || 0) >= invitation.max_uses) {
        return NextResponse.json(
          { error: 'INVITATION_LIMIT_REACHED', message: 'Maximum usage limit reached' },
          { status: 403 }
        );
      }
    }

    // Sahiplik: giriş yapan kullanıcı bu davetiyenin sahibi mi? (sadece sahip yönetim linki görsün)
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = !!(user && invitation.user_id && invitation.user_id === user.id);

    // Get theme configuration
    const themeId = (invitation.theme_id || 'elegant') as ThemeId;
    const themeConfig = getTheme(themeId);

    // Return formatted response (compatible with existing frontend)
    return NextResponse.json({
      id: invitation.id,
      slug: invitation.slug,
      coupleName: invitation.host_names || invitation.title,
      title: invitation.title,
      host_names: invitation.host_names,
      weddingDate: invitation.date_iso,
      venueName: invitation.location,
      venueAddress: invitation.location,
      theme_id: themeId,
      theme: {
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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
      return NextResponse.json(
        { error: 'INVALID_SLUG', message: 'Invitation slug is required' },
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

    // Find invitation and verify ownership
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id, owner_id')
      .eq('slug', slug)
      .maybeSingle();

    if (invError) {
      console.error('Error finding invitation:', invError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: invError.message },
        { status: 500 }
      );
    }

    if (!invitation) {
      return NextResponse.json(
        { error: 'INVITATION_NOT_FOUND', message: 'Invitation not found' },
        { status: 404 }
      );
    }

    if (invitation.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'Only the invitation owner can delete this invitation' },
        { status: 403 }
      );
    }

    // Delete invitation (cascade will delete related records)
    const { error: deleteError } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitation.id);

    if (deleteError) {
      console.error('Error deleting invitation:', deleteError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Invitation deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting invitation:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
