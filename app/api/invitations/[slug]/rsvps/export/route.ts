/**
 * RSVP Export API Route
 * GET /api/invitations/[slug]/rsvps/export - Export RSVPs as CSV (owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
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
      .select('id, owner_id, title, host_names')
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
        { error: 'FORBIDDEN', message: 'Only the invitation owner can export RSVPs' },
        { status: 403 }
      );
    }

    // Fetch all RSVPs for this invitation
    const { data: rsvps, error: rsvpsError } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false });

    if (rsvpsError) {
      console.error('Error fetching RSVPs:', rsvpsError);
      return NextResponse.json(
        { error: 'SERVER_ERROR', details: rsvpsError.message },
        { status: 500 }
      );
    }

    // Generate CSV
    const csvRows: string[] = [];
    
    // CSV Header
    csvRows.push([
      'Name',
      'Email',
      'Phone',
      'Attendance',
      'Guests Count',
      'Note',
      'Selected Events',
      'Submitted At',
    ].join(','));

    // CSV Data
    for (const rsvp of rsvps || []) {
      const row = [
        escapeCSV(rsvp.full_name || ''),
        escapeCSV(rsvp.email || ''),
        escapeCSV(rsvp.phone || ''),
        escapeCSV(rsvp.attendance || ''),
        rsvp.guests_count || 1,
        escapeCSV(rsvp.note || ''),
        escapeCSV(Array.isArray(rsvp.selected_events) ? rsvp.selected_events.join('; ') : ''),
        escapeCSV(new Date(rsvp.created_at).toLocaleString('tr-TR')),
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    // Add BOM for Excel UTF-8 support
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    // Generate filename
    const filename = `rsvps-${slug}-${new Date().toISOString().split('T')[0]}.csv`;

    // Return CSV file
    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error exporting RSVPs:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSV(field: string): string {
  if (field === null || field === undefined) return '';
  
  const stringField = String(field);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  
  return stringField;
}
