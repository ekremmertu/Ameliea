/**
 * RSVP Submission API Route
 * POST /api/rsvp
 * Public endpoint (no authentication required)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { sanitizeRsvpData } from '@/lib/sanitize';
import { sendRSVPConfirmation, sendRSVPNotificationToOwner } from '@/lib/notifications';
import { apiError, validationError, parseJsonBodyOrError, ErrorCodes } from '@/lib/api-response';

/** RSVP için RLS'yi bypass eden admin client (service role) */
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const RSVPSubmitSchema = z.object({
  slug: z.string().min(3).max(64),
  token: z.string().optional(),
  full_name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  attendance: z.enum(['yes', 'no', 'maybe']),
  guests_count: z.number().int().min(1).max(20).default(1),
  note: z.string().max(500).optional().or(z.literal('')),
  love_note_message: z.string().max(1000).optional().or(z.literal('')),
  selected_events: z.array(z.string()).optional(),
  website: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();

    const parsedBody = await parseJsonBodyOrError(req);
    if (parsedBody.response) return parsedBody.response;
    const body = parsedBody.body;

    const parsed = RSVPSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // Bot trap: if website field is filled, silently accept (it's a bot)
    if (parsed.data.website && parsed.data.website.trim().length > 0) {
      return NextResponse.json({ ok: true }); // silently accept bots
    }

    // Find invitation by slug (require_token ve default_token kolonları DB'de olmayabilir, önce temel kolonlarla dene)
    let inv: Record<string, unknown> | null = null;
    let invErr: { message?: string; code?: string } | null = null;
    
    const fullResult = await supabase
      .from('invitations')
      .select('id,is_published,require_token,default_token,title,host_names,owner_id')
      .eq('slug', parsed.data.slug)
      .maybeSingle();

    if (fullResult.error && (fullResult.error.code === 'PGRST204' || fullResult.error.message?.includes('column'))) {
      // Eksik kolonlar var, temel sorgu ile dene
      const baseResult = await supabase
        .from('invitations')
        .select('id,is_published,title,host_names,owner_id')
        .eq('slug', parsed.data.slug)
        .maybeSingle();
      inv = baseResult.data as Record<string, unknown> | null;
      invErr = baseResult.error as { message?: string; code?: string } | null;
    } else {
      inv = fullResult.data as Record<string, unknown> | null;
      invErr = fullResult.error as { message?: string; code?: string } | null;
    }

    if (invErr) {
      console.error('Error finding invitation:', invErr);
      return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, (invErr as { message?: string }).message);
    }

    if (!inv || inv.is_published === false) {
      return apiError(ErrorCodes.NOT_FOUND, 404, 'Invitation not found');
    }

    // Token kontrolü (eğer require_token true ise)
    let guestTokenId: string | null = null;
    if (inv.require_token) {
      if (!parsed.data.token) {
        return apiError(ErrorCodes.FORBIDDEN, 403, 'Token is required for this invitation');
      }

      // Default token kontrolü
      if (inv.default_token === parsed.data.token) {
        // Default token kullanılıyor, guest token yok
        guestTokenId = null;
      } else {
        // Guest token kontrolü
        const { data: guestToken, error: tokenError } = await supabase
          .from('invitation_guests')
          .select('id, status')
          .eq('invitation_id', inv.id)
          .eq('token', parsed.data.token)
          .maybeSingle();

        if (tokenError || !guestToken) {
          return apiError(ErrorCodes.FORBIDDEN, 403, 'Invalid token');
        }

        guestTokenId = guestToken.id;
      }
    }

    const sanitizedData = sanitizeRsvpData({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      note: parsed.data.note,
    });

    const loveNoteMessage = parsed.data.love_note_message?.trim();

    // Insert RSVP - selected_events may not exist in DB yet, so we'll try without it first if it fails
    const insertData: Record<string, unknown> = {
      invitation_id: inv.id,
      full_name: sanitizedData.full_name,
      email: sanitizedData.email || null,
      phone: sanitizedData.phone || null,
      attendance: parsed.data.attendance,
      guests_count: parsed.data.guests_count,
      note: sanitizedData.note || null,
    };

    // Only add selected_events if it's provided (column may not exist yet)
    if (parsed.data.selected_events && parsed.data.selected_events.length > 0) {
      insertData.selected_events = parsed.data.selected_events;
    }

    const { data: rsvp, error } = await supabase
      .from('rsvps')
      .insert(insertData)
      .select('id,created_at')
      .single();

    if (error) {
      console.error('Error inserting RSVP:', error);
      // If error is about selected_events column, try without it
      if (error.message.includes('selected_events') || error.message.includes('column') || error.code === '42703') {
        delete insertData.selected_events;
        const { data: rsvpRetry, error: retryError } = await supabase
          .from('rsvps')
          .insert(insertData)
          .select('id,created_at')
          .single();
        
        if (retryError) {
          console.error('Error inserting RSVP (retry):', retryError);
          return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, retryError.message);
        }

        if (guestTokenId) {
          await supabase
            .from('invitation_guests')
            .update({ 
              status: 'responded',
              responded_at: new Date().toISOString(),
            })
            .eq('id', guestTokenId);
        }

        if (loveNoteMessage && rsvpRetry?.id) {
          await supabase.from('love_notes').insert({
            invitation_id: inv.id,
            rsvp_id: rsvpRetry.id,
            guest_name: sanitizedData.full_name,
            guest_email: sanitizedData.email || null,
            message: loveNoteMessage,
          }).then(({ error: lnErr }) => {
            if (lnErr) console.error('Love note insert failed:', lnErr);
          });
        }

        return NextResponse.json({ ok: true, rsvp: rsvpRetry }, { status: 201 });
      }

      return apiError(ErrorCodes.INTERNAL_SERVER_ERROR, 500, undefined, error.message);
    }

    if (guestTokenId) {
      await supabase
        .from('invitation_guests')
        .update({ 
          status: 'responded',
          responded_at: new Date().toISOString(),
        })
        .eq('id', guestTokenId);
    }

    if (loveNoteMessage && rsvp?.id) {
      await supabase.from('love_notes').insert({
        invitation_id: inv.id,
        rsvp_id: rsvp.id,
        guest_name: sanitizedData.full_name,
        guest_email: sanitizedData.email || null,
        message: loveNoteMessage,
      }).then(({ error: lnErr }) => {
        if (lnErr) console.error('Love note insert failed:', lnErr);
      });
    }

    // Send notifications (async, don't wait)
    if (sanitizedData.email) {
      sendRSVPConfirmation(
        sanitizedData.email,
        sanitizedData.full_name,
        String(inv.title || inv.host_names || 'Wedding'),
        parsed.data.attendance
      ).catch(err => console.error('RSVP confirmation email failed:', err));
    }

    // Notify invitation owner
    const { data: owner } = await supabase.auth.admin.getUserById(inv.owner_id as string);
    if (owner?.user?.email) {
      sendRSVPNotificationToOwner(
        owner.user.email,
        sanitizedData.full_name,
        String(inv.title || inv.host_names || 'Wedding'),
        parsed.data.attendance
      ).catch(err => console.error('Owner notification failed:', err));
    }

    return NextResponse.json({ ok: true, rsvp }, { status: 201 });
  } catch (error) {
    console.error('RSVP API error:', error);
    return apiError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      500,
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
