/**
 * Invitation Dashboard Page
 * Protected route - requires authentication + ownership check
 * RLS policies ensure only owner can access
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';
import { BackButton } from '@/components/ui/BackButton';
import { showToast } from '@/components/ui/Toast';

interface GuestAnswer {
  question_id: string;
  question: string;
  answer: string;
}

interface RSVPResponse {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  attending: boolean;
  pending?: boolean; // For 'maybe' responses
  guests: number;
  message?: string;
  selectedEvents?: string[];
  guestAnswers?: GuestAnswer[];
  submittedAt: string;
}

interface InvitationData {
  id: string;
  slug: string;
  title: string;
  host_names?: string;
}

export default function InvitationDashboard() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { lang } = useI18n();
  const supabase = createSupabaseBrowserClient();
  
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [rsvpResponses, setRsvpResponses] = useState<RSVPResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loveNotes, setLoveNotes] = useState<Array<{
    id: string;
    guest_name: string;
    guest_email?: string;
    message: string;
    created_at: string;
  }>>([]);

  useEffect(() => {
    // Check authentication
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        // Middleware should redirect, but just in case
        router.push(`/login?redirect=/invitation/${slug}/dashboard`);
        return;
      }
      setUser(user as any);
      fetchData();
    });
  }, [slug, router, supabase]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch invitation data (RLS ensures only owner can access)
      const { data: invitation, error: invError } = await supabase
        .from('invitations')
        .select('id,slug,title,host_names')
        .eq('slug', slug)
        .maybeSingle();

      if (invError) {
        setError(lang === 'tr' ? 'Davetiye yüklenemedi' : 'Failed to load invitation');
        return;
      }

      if (!invitation) {
        setError(lang === 'tr' ? 'Davetiye bulunamadı' : 'Invitation not found');
        return;
      }

      setInvitationData(invitation);

      // Fetch RSVP responses (RLS ensures only owner can access)
      const { data: rsvps, error: rsvpError } = await supabase
        .from('rsvps')
        .select('*')
        .eq('invitation_id', invitation.id)
        .order('created_at', { ascending: false });

      if (rsvpError) {
        setError(lang === 'tr' ? 'RSVP verileri yüklenemedi' : 'Failed to load RSVP data');
        return;
      }

      // Fetch guest questions for this invitation
      const { data: questions } = await supabase
        .from('guest_questions')
        .select('id, question')
        .eq('invitation_id', invitation.id)
        .order('order_index', { ascending: true });

      const questionMap = new Map((questions || []).map((q: any) => [q.id, q.question]));

      // Fetch guest answers
      const { data: answers } = await supabase
        .from('guest_answers')
        .select('rsvp_id, question_id, answer')
        .eq('invitation_id', invitation.id);

      // Group answers by rsvp_id
      const answersByRsvp = new Map<string, GuestAnswer[]>();
      (answers || []).forEach((answer: any) => {
        if (!answersByRsvp.has(answer.rsvp_id)) {
          answersByRsvp.set(answer.rsvp_id, []);
        }
        answersByRsvp.get(answer.rsvp_id)!.push({
          question_id: answer.question_id,
          question: questionMap.get(answer.question_id) || 'Unknown question',
          answer: answer.answer,
        });
      });

      setRsvpResponses((rsvps || []).map((rsvp: any) => ({
        id: rsvp.id,
        name: rsvp.full_name,
        email: rsvp.email,
        phone: rsvp.phone,
        attending: rsvp.attendance === 'yes',
        pending: rsvp.attendance === 'maybe', // Support 'maybe' status
        guests: rsvp.guests_count,
        message: rsvp.note,
        selectedEvents: rsvp.selected_events || [],
        guestAnswers: answersByRsvp.get(rsvp.id) || [],
        submittedAt: rsvp.created_at,
      })));

      // Fetch love notes
      const { data: notes, error: notesError } = await supabase
        .from('love_notes')
        .select('id, guest_name, guest_email, message, created_at')
        .eq('invitation_id', invitation.id)
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching love notes:', notesError);
      } else {
        setLoveNotes(notes || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(lang === 'tr' ? 'Bir hata oluştu' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--crimson-base)' }}></div>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-8 rounded-xl text-center"
          style={{ backgroundColor: 'var(--bg-panel-strong)' }}
        >
          <h1 className="text-3xl font-bold mb-6" style={{ color: tokens.colors.text.primary }}>
            {lang === 'tr' ? 'Hata' : 'Error'}
          </h1>
          <p className="mb-6" style={{ color: tokens.colors.text.secondary }}>
            {error}
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 rounded-full font-semibold transition-all min-h-[44px]"
            style={{
              backgroundColor: 'var(--crimson-base)',
              color: 'white',
            }}
          >
            {lang === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}
          </button>
        </motion.div>
      </div>
    );
  }

  // Calculate statistics
  const totalResponses = rsvpResponses.length;
  const confirmedCount = rsvpResponses.filter(r => r.attending).length;
  const declinedCount = rsvpResponses.filter(r => !r.attending && !r.pending).length;
  const pendingCount = rsvpResponses.filter(r => r.pending).length;
  const totalGuests = rsvpResponses
    .filter(r => r.attending)
    .reduce((sum, r) => sum + (r.guests || 1), 0);

  // Parse dietary restrictions from note field
  const parseDietaryRestrictions = (note?: string): string[] => {
    if (!note) return [];
    const dietaryKeywords = [
      'vegetarian', 'vegan', 'gluten-free', 'gluten free', 'lactose-free', 'lactose free',
      'dairy-free', 'dairy free', 'nut-free', 'nut free', 'halal', 'kosher',
      'vejetaryen', 'vegan', 'glutensiz', 'laktozsuz', 'laktoz içermez', 'fındık alerjisi'
    ];
    const found: string[] = [];
    const lowerNote = note.toLowerCase();
    
    dietaryKeywords.forEach(keyword => {
      if (lowerNote.includes(keyword)) {
        // Map to display names
        const displayName = keyword.includes('vegetarian') || keyword.includes('vejetaryen') 
          ? (lang === 'tr' ? 'Vejetaryen' : 'Vegetarian')
          : keyword.includes('gluten') 
          ? (lang === 'tr' ? 'Glutensiz' : 'Gluten-free')
          : keyword.includes('lactose') || keyword.includes('laktoz')
          ? (lang === 'tr' ? 'Laktozsuz' : 'Lactose-free')
          : keyword.includes('vegan')
          ? 'Vegan'
          : keyword;
        if (!found.includes(displayName)) {
          found.push(displayName);
        }
      }
    });
    
    return found;
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <BackButton href={`/invitation/${slug}`} />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
              {lang === 'tr' ? 'Davetiye Yönetimi' : 'Invitation Dashboard'}
            </h1>
            <p className="text-lg" style={{ color: tokens.colors.text.secondary }}>
              {invitationData?.title || invitationData?.host_names}
            </p>
            {user?.email && (
              <p className="text-sm mt-1" style={{ color: tokens.colors.text.muted }}>
                {lang === 'tr' ? 'Giriş yapan:' : 'Signed in as:'} {user.email}
              </p>
            )}
          </div>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => router.push(`/invitation/${slug}`)}
              className="px-4 py-2 rounded-full border transition-all"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            >
              {lang === 'tr' ? 'Davetiye Görüntüle' : 'View Invitation'}
            </button>
            <button
              onClick={() => router.push(`/customize/template-1?revise=${slug}`)}
              className="px-4 py-2 rounded-full border transition-all font-semibold"
              style={{
                backgroundColor: 'var(--crimson-base)',
                borderColor: 'var(--crimson-base)',
                color: 'white',
              }}
            >
              {lang === 'tr' ? '✏️ Revize Et' : '✏️ Revise'}
            </button>
          </div>
        </div>

        {/* Share invitation — davetiyeyi arkadaşlara gönder */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl border-2"
          style={{
            backgroundColor: 'var(--bg-panel-strong)',
            borderColor: 'var(--gold-base)',
          }}
        >
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2" style={{ color: tokens.colors.text.primary }}>
            📤 {lang === 'tr' ? 'Davetiyeyi Paylaş' : 'Share your invitation'}
          </h2>
          <p className="text-sm mb-4" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr'
              ? 'Bu linki davetlilerinize WhatsApp, SMS veya e-posta ile gönderin. Davetliler linke tıklayarak davetiyenizi görüntüleyebilir ve RSVP yapabilir.'
              : 'Send this link to your guests via WhatsApp, SMS or email. Guests can open the link to view your invitation and submit RSVP.'}
          </p>
          <p className="text-xs mb-4 rounded-lg p-2" style={{ color: tokens.colors.text.muted, backgroundColor: 'var(--bg-panel)' }}>
            {lang === 'tr'
              ? 'Davetlinin gördüğü ekran, "Davetiye Görüntüle" ile açtığınız ekranla birebir aynıdır. Davetliler düzenleme veya davetli ekleyemez; sadece görüntüleyip RSVP yapabilir.'
              : 'The guest view is identical to what you see when you click "View Invitation". Guests cannot edit or add guests; they can only view and submit RSVP.'}
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/invitation/${slug}` : ''}
              className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border text-sm"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
              id="invitation-link-input"
            />
            <button
              onClick={async () => {
                const url = typeof window !== 'undefined' ? `${window.location.origin}/invitation/${slug}` : '';
                try {
                  await navigator.clipboard.writeText(url);
                  showToast(lang === 'tr' ? 'Link kopyalandı!' : 'Link copied!', 'success');
                } catch {
                  const input = document.getElementById('invitation-link-input') as HTMLInputElement;
                  if (input) {
                    input.select();
                    document.execCommand('copy');
                    showToast(lang === 'tr' ? 'Link kopyalandı!' : 'Link copied!', 'success');
                  }
                }
              }}
              className="px-4 py-3 rounded-xl font-semibold transition-all"
              style={{
                backgroundColor: 'var(--crimson-base)',
                color: 'white',
              }}
            >
              {lang === 'tr' ? '🔗 Linki Kopyala' : '🔗 Copy link'}
            </button>
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={async () => {
                  const url = typeof window !== 'undefined' ? `${window.location.origin}/invitation/${slug}` : '';
                  try {
                    await navigator.share({
                      title: invitationData?.title || invitationData?.host_names || (lang === 'tr' ? 'Düğün Davetiyesi' : 'Wedding Invitation'),
                      text: lang === 'tr' ? 'Düğün davetiyemizi görüntüleyin' : 'View our wedding invitation',
                      url,
                    });
                    showToast(lang === 'tr' ? 'Paylaşıldı!' : 'Shared!', 'success');
                  } catch (err) {
                    if ((err as Error).name !== 'AbortError') {
                      showToast(lang === 'tr' ? 'Paylaşım iptal edildi veya hata.' : 'Share cancelled or failed.', 'error');
                    }
                  }
                }}
                className="px-4 py-3 rounded-xl border font-semibold transition-all"
                style={{
                  borderColor: 'var(--gold-base)',
                  color: 'var(--gold-base)',
                }}
              >
                {lang === 'tr' ? '📱 Paylaş' : '📱 Share'}
              </button>
            )}
            <a
              href={typeof window !== 'undefined' ? `${window.location.origin}/share/${slug}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl border text-sm font-medium transition-all"
              style={{
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.secondary,
              }}
            >
              {lang === 'tr' ? 'Davetli görünümü →' : 'Guest view →'}
            </a>
          </div>
        </motion.div>

        {/* Statistics - 3 Cards like in the image */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Confirmed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl"
            style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.1)', // Light green background
            }}
          >
            <div className="text-4xl font-bold mb-2" style={{ color: '#22c55e' }}>
              {confirmedCount}
            </div>
            <div className="text-sm font-medium" style={{ color: '#22c55e' }}>
              {lang === 'tr' ? 'Onaylandı' : 'Confirmed'}
            </div>
          </motion.div>

          {/* Pending - For now, we'll show 0 or maybe responses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl"
            style={{ 
              backgroundColor: 'rgba(251, 191, 36, 0.1)', // Light yellow/orange background
            }}
          >
            <div className="text-4xl font-bold mb-2" style={{ color: '#d97706' }}>
              {pendingCount}
            </div>
            <div className="text-sm font-medium" style={{ color: '#d97706' }}>
              {lang === 'tr' ? 'Beklemede' : 'Pending'}
            </div>
          </motion.div>

          {/* Declined */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl"
            style={{ 
              backgroundColor: 'rgba(244, 63, 94, 0.1)', // Light pink/red background
            }}
          >
            <div className="text-4xl font-bold mb-2" style={{ color: '#f43f5e' }}>
              {declinedCount}
            </div>
            <div className="text-sm font-medium" style={{ color: '#f43f5e' }}>
              {lang === 'tr' ? 'Reddedildi' : 'Declined'}
            </div>
          </motion.div>
        </div>

        {/* Guest List */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
          <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-base)' }}>
            <h2 className="text-2xl font-bold" style={{ color: tokens.colors.text.primary }}>
              {lang === 'tr' ? 'Misafir Listesi' : 'Guest List'}
            </h2>
            <span className="text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
              {totalResponses} {lang === 'tr' ? 'toplam' : 'total'}
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-base)' }}>
            {rsvpResponses.length === 0 ? (
              <div className="p-8 text-center" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Henüz yanıt yok' : 'No responses yet'}
              </div>
            ) : (
              rsvpResponses.map((response, index) => {
                const dietaryRestrictions = parseDietaryRestrictions(response.message);
                
                // Determine status
                let statusColor: string;
                let statusBgColor: string;
                let statusIcon: string;
                
                if (response.attending) {
                  statusColor = '#22c55e'; // Green for confirmed
                  statusBgColor = 'rgba(34, 197, 94, 0.1)';
                  statusIcon = '✓';
                } else if (response.pending) {
                  statusColor = '#d97706'; // Orange for pending
                  statusBgColor = 'rgba(251, 191, 36, 0.1)';
                  statusIcon = '!';
                } else {
                  statusColor = '#f43f5e'; // Red for declined
                  statusBgColor = 'rgba(244, 63, 94, 0.1)';
                  statusIcon = '✗';
                }
                
                return (
                <motion.div
                  key={response.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-opacity-50 transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <div className="flex items-center gap-4">
                    {/* Status Indicator - Colored circle with icon */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: statusBgColor }}
                    >
                      <span className="text-2xl font-bold" style={{ color: statusColor }}>
                        {statusIcon}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold" style={{ color: tokens.colors.text.primary }}>
                          {response.name}
                        </h3>
                        {/* Dietary Restrictions Tags */}
                        {dietaryRestrictions.map((diet, dietIdx) => (
                          <span
                            key={dietIdx}
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: 'rgba(139, 69, 19, 0.15)', // Light brown
                              color: '#8b4513', // Brown text
                            }}
                          >
                            {diet}
                          </span>
                        ))}
                      </div>
                      {response.email && (
                        <p className="text-sm mb-1" style={{ color: tokens.colors.text.secondary }}>
                          {response.email}
                        </p>
                      )}
                      {response.attending && response.guests > 1 && (
                        <p className="text-sm mb-1" style={{ color: tokens.colors.text.muted }}>
                          {lang === 'tr' ? `${response.guests} misafir` : `${response.guests} guests`}
                        </p>
                      )}
                      {response.attending && response.selectedEvents && response.selectedEvents.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-2">
                            {response.selectedEvents.map((event: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-full text-xs"
                                style={{
                                  backgroundColor: 'rgba(200, 162, 74, 0.15)',
                                  color: tokens.colors.text.primary,
                                }}
                              >
                                {event}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Show message only if it's not just dietary info (already shown as tags) */}
                      {response.message && dietaryRestrictions.length === 0 && (
                        <p className="text-sm mt-2 italic" style={{ color: tokens.colors.text.muted }}>
                          &quot;{response.message}&quot;
                        </p>
                      )}
                      {response.guestAnswers && response.guestAnswers.length > 0 && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-base)' }}>
                          <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: tokens.colors.text.secondary }}>
                            {lang === 'tr' ? 'Sorular ve Cevaplar' : 'Questions & Answers'}
                          </p>
                          <div className="space-y-3">
                            {response.guestAnswers.map((qa, qaIdx) => (
                              <div key={qaIdx} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-panel)' }}>
                                <p className="text-sm font-medium mb-1" style={{ color: tokens.colors.text.primary }}>
                                  {qa.question}
                                </p>
                                <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                                  {qa.answer}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )})
            )}
          </div>
        </div>

        {/* Love Notes Section */}
        {loveNotes.length > 0 && (
          <div className="mt-12 rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-base)' }}>
              <h2 className="text-2xl font-bold" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? '💕 Gelin ve Damat\'a Mesajlar' : '💕 Messages to the Couple'}
              </h2>
              <span className="text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                {loveNotes.length} {lang === 'tr' ? 'mesaj' : 'messages'}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-base)' }}>
              {loveNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-opacity-50 transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-2xl"
                      style={{ 
                        backgroundColor: 'rgba(200, 162, 74, 0.15)',
                        color: 'var(--gold-base)',
                      }}
                    >
                      💕
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold" style={{ color: tokens.colors.text.primary }}>
                          {note.guest_name}
                        </h3>
                        {note.guest_email && (
                          <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                            {note.guest_email}
                          </p>
                        )}
                        <span className="text-xs" style={{ color: tokens.colors.text.muted }}>
                          {new Date(note.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-base leading-relaxed italic" style={{ color: tokens.colors.text.secondary }}>
                        &quot;{note.message}&quot;
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
