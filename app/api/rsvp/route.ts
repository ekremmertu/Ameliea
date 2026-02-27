/**
 * RSVP Submission API Route
 * POST /api/rsvp
 * Public endpoint (no authentication required)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeRsvpData } from '@/lib/sanitize';
import { sendRSVPConfirmation, sendRSVPNotificationToOwner } from '@/lib/notifications';

const RSVPSubmitSchema = z.object({
  slug: z.string().min(3).max(64),
  token: z.string().optional(), // Token (if invitation requires it)
  full_name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  attendance: z.enum(['yes', 'no', 'maybe']),
  guests_count: z.number().int().min(1).max(20).default(1),
  note: z.string().max(500).optional().or(z.literal('')),
  selected_events: z.array(z.string()).optional(), // Array of event names
  website: z.string().optional(), // bot trap
});

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
    }

    const parsed = RSVPSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          details: parsed.error.flatten() 
        }, 
        { status: 400 }
      );
    }

    // Bot trap: if website field is filled, silently accept (it's a bot)
    if (parsed.data.website && parsed.data.website.trim().length > 0) {
      return NextResponse.json({ ok: true }); // silently accept bots
    }

    // Find invitation by slug
    const { data: inv, error: invErr } = await supabase
      .from('invitations')
      .select('id,is_published,require_token,default_token,title,host_names,owner_id')
      .eq('slug', parsed.data.slug)
      .maybeSingle();

    if (invErr) {
      console.error('Error finding invitation:', invErr);
      return NextResponse.json({ error: 'SERVER_ERROR', details: invErr.message }, { status: 500 });
    }

    if (!inv || !inv.is_published) {
      return NextResponse.json({ error: 'INVITATION_NOT_FOUND' }, { status: 404 });
    }

    // Token kontrolü (eğer require_token true ise)
    let guestTokenId: string | null = null;
    if (inv.require_token) {
      if (!parsed.data.token) {
        return NextResponse.json(
          { error: 'TOKEN_REQUIRED', message: 'Token is required for this invitation' },
          { status: 403 }
        );
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
          return NextResponse.json(
            { error: 'INVALID_TOKEN', message: 'Invalid token' },
            { status: 403 }
          );
        }

        guestTokenId = guestToken.id;
      }
    }

    // Sanitize user input to prevent XSS attacks
    const sanitizedData = sanitizeRsvpData({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      note: parsed.data.note,
    });

    // Insert RSVP - selected_events may not exist in DB yet, so we'll try without it first if it fails
    const insertData: any = {
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
          return NextResponse.json(
            { error: 'SERVER_ERROR', details: retryError.message }, 
            { status: 500 }
          );
        }

        // Token'ı "responded" olarak işaretle
        if (guestTokenId) {
          await supabase
            .from('invitation_guests')
            .update({ 
              status: 'responded',
              responded_at: new Date().toISOString(),
            })
            .eq('id', guestTokenId);
        }

        return NextResponse.json({ ok: true, rsvp: rsvpRetry }, { status: 201 });
      }

      return NextResponse.json(
        { error: 'SERVER_ERROR', details: error.message }, 
        { status: 500 }
      );
    }

    // Token'ı "responded" olarak işaretle
    if (guestTokenId) {
      await supabase
        .from('invitation_guests')
        .update({ 
          status: 'responded',
          responded_at: new Date().toISOString(),
        })
        .eq('id', guestTokenId);
    }

    // Send notifications (async, don't wait)
    if (sanitizedData.email) {
      sendRSVPConfirmation(
        sanitizedData.email,
        sanitizedData.full_name,
        inv.title || inv.host_names || 'Wedding',
        parsed.data.attendance
      ).catch(err => console.error('RSVP confirmation email failed:', err));
    }

    // Notify invitation owner
    const { data: owner } = await supabase.auth.admin.getUserById(inv.owner_id);
    if (owner?.user?.email) {
      sendRSVPNotificationToOwner(
        owner.user.email,
        sanitizedData.full_name,
        inv.title || inv.host_names || 'Wedding',
        parsed.data.attendance
      ).catch(err => console.error('Owner notification failed:', err));
    }

    return NextResponse.json({ ok: true, rsvp }, { status: 201 });
  } catch (error) {
    console.error('RSVP API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
