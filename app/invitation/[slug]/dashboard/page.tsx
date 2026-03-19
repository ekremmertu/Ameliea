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
  pending?: boolean;
  guests: number;
  message?: string;
  selectedEvents?: string[];
  guestAnswers?: GuestAnswer[];
  submittedAt: string;
}

interface Testimonial {
  id: string;
  name: string;
  message: string;
  approved: boolean;
  created_at: string;
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
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loveNotes, setLoveNotes] = useState<Array<{
    id: string;
    guest_name: string;
    guest_email?: string;
    message: string;
    created_at: string;
  }>>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeTab, setActiveTab] = useState<'rsvp' | 'messages' | 'testimonials'>('rsvp');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push(`/login?redirect=/invitation/${slug}/dashboard`);
        return;
      }
      setUser(user ? { email: user.email } : null);
      fetchData();
    });
  }, [slug, router, supabase]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

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

      const { data: rsvps, error: rsvpError } = await supabase
        .from('rsvps')
        .select('*')
        .eq('invitation_id', invitation.id)
        .order('created_at', { ascending: false });

      if (rsvpError) {
        setError(lang === 'tr' ? 'RSVP verileri yüklenemedi' : 'Failed to load RSVP data');
        return;
      }

      const { data: questions } = await supabase
        .from('guest_questions')
        .select('id, question')
        .eq('invitation_id', invitation.id)
        .order('order_index', { ascending: true });

      const questionMap = new Map((questions || []).map((q: { id: string; question: string }) => [q.id, q.question]));

      const { data: answers } = await supabase
        .from('guest_answers')
        .select('rsvp_id, question_id, answer')
        .eq('invitation_id', invitation.id);

      const answersByRsvp = new Map<string, GuestAnswer[]>();
      (answers || []).forEach((answer: { rsvp_id: string; question_id: string; answer: string }) => {
        if (!answersByRsvp.has(answer.rsvp_id)) {
          answersByRsvp.set(answer.rsvp_id, []);
        }
        answersByRsvp.get(answer.rsvp_id)!.push({
          question_id: answer.question_id,
          question: questionMap.get(answer.question_id) || 'Unknown question',
          answer: answer.answer,
        });
      });

      interface RsvpRow { id: string; full_name: string; email?: string; phone?: string; attendance: string; guests_count: number; note?: string; selected_events?: string[]; created_at: string }
      setRsvpResponses((rsvps || []).map((rsvp: RsvpRow) => ({
        id: rsvp.id,
        name: rsvp.full_name,
        email: rsvp.email,
        phone: rsvp.phone,
        attending: rsvp.attendance === 'yes',
        pending: rsvp.attendance === 'maybe',
        guests: rsvp.guests_count,
        message: rsvp.note,
        selectedEvents: rsvp.selected_events || [],
        guestAnswers: answersByRsvp.get(rsvp.id) || [],
        submittedAt: rsvp.created_at,
      })));

      const { data: notes } = await supabase
        .from('love_notes')
        .select('id, guest_name, guest_email, message, created_at')
        .eq('invitation_id', invitation.id)
        .order('created_at', { ascending: false });

      setLoveNotes(notes || []);

      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('id, name, message, approved, created_at')
        .eq('invitation_id', invitation.id)
        .order('created_at', { ascending: false });

      setTestimonials(testimonialsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(lang === 'tr' ? 'Bir hata oluştu' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTestimonialApproval = async (id: string, currentApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ approved: !currentApproved })
        .eq('id', id);

      if (error) throw error;

      setTestimonials(prev =>
        prev.map(t => t.id === id ? { ...t, approved: !currentApproved } : t)
      );
      showToast(
        lang === 'tr'
          ? (!currentApproved ? 'Mesaj onaylandı' : 'Mesaj gizlendi')
          : (!currentApproved ? 'Message approved' : 'Message hidden'),
        'success'
      );
    } catch {
      showToast(lang === 'tr' ? 'İşlem başarısız' : 'Operation failed', 'error');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTestimonials(prev => prev.filter(t => t.id !== id));
      showToast(lang === 'tr' ? 'Mesaj silindi' : 'Message deleted', 'success');
    } catch {
      showToast(lang === 'tr' ? 'Silme başarısız' : 'Delete failed', 'error');
    }
  };

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

  const totalResponses = rsvpResponses.length;
  const confirmedCount = rsvpResponses.filter(r => r.attending).length;
  const declinedCount = rsvpResponses.filter(r => !r.attending && !r.pending).length;
  const pendingCount = rsvpResponses.filter(r => r.pending).length;
  const totalGuests = rsvpResponses
    .filter(r => r.attending)
    .reduce((sum, r) => sum + (r.guests || 1), 0);

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

  const tabs = [
    { id: 'rsvp' as const, label: lang === 'tr' ? 'Katılım Yanıtları' : 'RSVP Responses', count: totalResponses },
    { id: 'messages' as const, label: lang === 'tr' ? 'Gelin & Damat Mesajları' : 'Love Notes', count: loveNotes.length },
    { id: 'testimonials' as const, label: lang === 'tr' ? 'Misafir Mesajları' : 'Guest Messages', count: testimonials.length },
  ];

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

        {/* Share invitation */}
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
              ? 'Bu linki davetlilerinize WhatsApp, SMS veya e-posta ile gönderin.'
              : 'Send this link to your guests via WhatsApp, SMS or email.'}
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
            <button
              onClick={async () => {
                const url = typeof window !== 'undefined' ? `${window.location.origin}/invitation/${slug}` : '';
                if (typeof navigator !== 'undefined' && navigator.share) {
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
                } else {
                  try {
                    await navigator.clipboard.writeText(url);
                    showToast(lang === 'tr' ? 'Link kopyalandı! Paylaşmak için yapıştırın.' : 'Link copied! Paste to share.', 'success');
                  } catch {
                    showToast(lang === 'tr' ? 'Paylaşım desteklenmiyor.' : 'Sharing not supported.', 'error');
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
          </div>
        </motion.div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
          >
            <div className="text-3xl font-bold mb-1" style={{ color: '#22c55e' }}>{confirmedCount}</div>
            <div className="text-sm font-medium" style={{ color: '#22c55e' }}>
              {lang === 'tr' ? 'Onaylandı' : 'Confirmed'}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 rounded-xl"
            style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}
          >
            <div className="text-3xl font-bold mb-1" style={{ color: '#d97706' }}>{pendingCount}</div>
            <div className="text-sm font-medium" style={{ color: '#d97706' }}>
              {lang === 'tr' ? 'Beklemede' : 'Pending'}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-xl"
            style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)' }}
          >
            <div className="text-3xl font-bold mb-1" style={{ color: '#f43f5e' }}>{declinedCount}</div>
            <div className="text-sm font-medium" style={{ color: '#f43f5e' }}>
              {lang === 'tr' ? 'Reddedildi' : 'Declined'}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 rounded-xl"
            style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
          >
            <div className="text-3xl font-bold mb-1" style={{ color: '#6366f1' }}>{totalGuests}</div>
            <div className="text-sm font-medium" style={{ color: '#6366f1' }}>
              {lang === 'tr' ? 'Toplam Misafir' : 'Total Guests'}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--crimson-base)' : 'var(--bg-panel-strong)',
                color: activeTab === tab.id ? 'white' : tokens.colors.text.secondary,
                border: activeTab === tab.id ? 'none' : '1px solid var(--border-base)',
              }}
            >
              {tab.label}
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-panel)',
                  color: activeTab === tab.id ? 'white' : tokens.colors.text.muted,
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* RSVP Tab */}
        {activeTab === 'rsvp' && (
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
                  
                  let statusColor: string;
                  let statusBgColor: string;
                  let statusIcon: string;
                  
                  if (response.attending) {
                    statusColor = '#22c55e';
                    statusBgColor = 'rgba(34, 197, 94, 0.1)';
                    statusIcon = '✓';
                  } else if (response.pending) {
                    statusColor = '#d97706';
                    statusBgColor = 'rgba(251, 191, 36, 0.1)';
                    statusIcon = '!';
                  } else {
                    statusColor = '#f43f5e';
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
                            {dietaryRestrictions.map((diet, dietIdx) => (
                              <span
                                key={dietIdx}
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: 'rgba(139, 69, 19, 0.15)',
                                  color: '#8b4513',
                                }}
                              >
                                {diet}
                              </span>
                            ))}
                          </div>
                          {response.phone && (
                            <p className="text-sm mb-1" style={{ color: tokens.colors.text.secondary }}>
                              📞 {response.phone}
                            </p>
                          )}
                          {response.email && (
                            <p className="text-sm mb-1" style={{ color: tokens.colors.text.secondary }}>
                              ✉️ {response.email}
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
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Love Notes Tab */}
        {activeTab === 'messages' && (
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-base)' }}>
              <h2 className="text-2xl font-bold" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? '💕 Gelin ve Damat\'a Mesajlar' : '💕 Messages to the Couple'}
              </h2>
              <span className="text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                {loveNotes.length} {lang === 'tr' ? 'mesaj' : 'messages'}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-base)' }}>
              {loveNotes.length === 0 ? (
                <div className="p-8 text-center" style={{ color: tokens.colors.text.secondary }}>
                  {lang === 'tr' ? 'Henüz mesaj yok' : 'No messages yet'}
                </div>
              ) : (
                loveNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6"
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
                ))
              )}
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-base)' }}>
              <h2 className="text-2xl font-bold" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? '💬 Misafir Mesajları' : '💬 Guest Messages'}
              </h2>
              <span className="text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                {testimonials.length} {lang === 'tr' ? 'mesaj' : 'messages'}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-base)' }}>
              {testimonials.length === 0 ? (
                <div className="p-8 text-center" style={{ color: tokens.colors.text.secondary }}>
                  {lang === 'tr' ? 'Henüz misafir mesajı yok' : 'No guest messages yet'}
                </div>
              ) : (
                testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-2xl"
                        style={{ 
                          backgroundColor: testimonial.approved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                        }}
                      >
                        💬
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold" style={{ color: tokens.colors.text.primary }}>
                            {testimonial.name}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: testimonial.approved ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                              color: testimonial.approved ? '#22c55e' : '#d97706',
                            }}
                          >
                            {testimonial.approved
                              ? (lang === 'tr' ? 'Onaylı' : 'Approved')
                              : (lang === 'tr' ? 'Onay Bekliyor' : 'Pending')}
                          </span>
                          <span className="text-xs" style={{ color: tokens.colors.text.muted }}>
                            {new Date(testimonial.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-base leading-relaxed italic mb-3" style={{ color: tokens.colors.text.secondary }}>
                          &quot;{testimonial.message}&quot;
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleTestimonialApproval(testimonial.id, testimonial.approved)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              backgroundColor: testimonial.approved ? 'rgba(251, 191, 36, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                              color: testimonial.approved ? '#d97706' : '#22c55e',
                            }}
                          >
                            {testimonial.approved
                              ? (lang === 'tr' ? 'Gizle' : 'Hide')
                              : (lang === 'tr' ? 'Onayla' : 'Approve')}
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(testimonial.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              backgroundColor: 'rgba(244, 63, 94, 0.1)',
                              color: '#f43f5e',
                            }}
                          >
                            {lang === 'tr' ? 'Sil' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
