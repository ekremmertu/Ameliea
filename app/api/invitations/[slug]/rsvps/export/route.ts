/**
 * RSVP Export API Route
 * GET /api/invitations/[slug]/rsvps/export - Export all data as CSV (owner only)
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('id, owner_id, title, host_names')
      .eq('slug', slug)
      .maybeSingle();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'INVITATION_NOT_FOUND', message: 'Invitation not found' },
        { status: 404 }
      );
    }

    if (invitation.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'Only the invitation owner can export' },
        { status: 403 }
      );
    }

    const [rsvpsResult, questionsResult, answersResult, loveNotesResult] = await Promise.all([
      supabase
        .from('rsvps')
        .select('*')
        .eq('invitation_id', invitation.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('guest_questions')
        .select('id, question')
        .eq('invitation_id', invitation.id)
        .order('order_index', { ascending: true }),
      supabase
        .from('guest_answers')
        .select('rsvp_id, question_id, answer')
        .eq('invitation_id', invitation.id),
      supabase
        .from('love_notes')
        .select('guest_name, message, created_at')
        .eq('invitation_id', invitation.id)
        .order('created_at', { ascending: false }),
    ]);

    const rsvps = rsvpsResult.data || [];
    const questions = questionsResult.data || [];
    const answers = answersResult.data || [];
    const loveNotes = loveNotesResult.data || [];

    const answersByRsvp = new Map<string, Map<string, string>>();
    for (const ans of answers) {
      if (!answersByRsvp.has(ans.rsvp_id)) {
        answersByRsvp.set(ans.rsvp_id, new Map());
      }
      answersByRsvp.get(ans.rsvp_id)!.set(ans.question_id, ans.answer);
    }

    const csvRows: string[] = [];
    
    const headers = [
      'Ad Soyad',
      'E-posta',
      'Telefon',
      'Katılım',
      'Misafir Sayısı',
      'Not',
      'Seçilen Etkinlikler',
      ...questions.map(q => q.question),
      'Mesaj (Gelin & Damata)',
      'Tarih',
    ];
    csvRows.push(headers.map(escapeCSV).join(','));

    for (const rsvp of rsvps) {
      const rsvpAnswers = answersByRsvp.get(rsvp.id);
      const loveNote = loveNotes.find(
        (n: { guest_name: string }) => n.guest_name === rsvp.full_name
      );
      
      const attendanceLabel = rsvp.attendance === 'yes' ? 'Evet' : rsvp.attendance === 'no' ? 'Hayır' : 'Belki';

      const row = [
        escapeCSV(rsvp.full_name || ''),
        escapeCSV(rsvp.email || ''),
        escapeCSV(rsvp.phone || ''),
        escapeCSV(attendanceLabel),
        String(rsvp.guests_count || 1),
        escapeCSV(rsvp.note || ''),
        escapeCSV(Array.isArray(rsvp.selected_events) ? rsvp.selected_events.join('; ') : ''),
        ...questions.map(q => escapeCSV(rsvpAnswers?.get(q.id) || '')),
        escapeCSV(loveNote?.message || ''),
        escapeCSV(new Date(rsvp.created_at).toLocaleString('tr-TR')),
      ];
      csvRows.push(row.join(','));
    }

    if (loveNotes.length > 0) {
      csvRows.push('');
      csvRows.push('');
      csvRows.push([escapeCSV('--- Gelin & Damata Mesajlar ---')].join(','));
      csvRows.push(['Ad Soyad', 'Mesaj', 'Tarih'].map(escapeCSV).join(','));
      for (const note of loveNotes) {
        csvRows.push([
          escapeCSV(note.guest_name),
          escapeCSV(note.message),
          escapeCSV(new Date(note.created_at).toLocaleString('tr-TR')),
        ].join(','));
      }
    }

    const csvContent = csvRows.join('\n');
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    const filename = `davetiye-${slug}-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function escapeCSV(field: string): string {
  if (field === null || field === undefined) return '';
  const stringField = String(field);
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}
