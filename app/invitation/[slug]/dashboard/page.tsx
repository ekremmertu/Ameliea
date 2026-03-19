/**
 * Invitation Dashboard Page — Premium
 * Protected route - requires authentication + ownership check
 * RLS policies ensure only owner can access
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
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

interface LoveNote {
  id: string;
  guest_name: string;
  guest_email?: string;
  message: string;
  created_at: string;
}

interface InvitationData {
  id: string;
  slug: string;
  title: string;
  host_names?: string;
  date_iso?: string;
  location?: string;
  created_at?: string;
}

type TabId = 'overview' | 'rsvp' | 'messages' | 'testimonials';
type RSVPFilter = 'all' | 'confirmed' | 'declined' | 'pending';

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
  const [loveNotes, setLoveNotes] = useState<LoveNote[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [rsvpFilter, setRsvpFilter] = useState<RSVPFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRsvpId, setExpandedRsvpId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

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
        .select('id,slug,title,host_names,date_iso,location,created_at')
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

    } catch {
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
    if (!confirm(lang === 'tr' ? 'Bu mesajı silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this message?')) return;
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

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/invitations/${slug}/rsvps/export`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `davetiye-${slug}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(lang === 'tr' ? 'Excel dosyası indiriliyor!' : 'Downloading Excel file!', 'success');
    } catch {
      showToast(lang === 'tr' ? 'İndirme başarısız' : 'Download failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const totalResponses = rsvpResponses.length;
  const confirmedCount = rsvpResponses.filter(r => r.attending).length;
  const declinedCount = rsvpResponses.filter(r => !r.attending && !r.pending).length;
  const pendingCount = rsvpResponses.filter(r => r.pending).length;
  const totalGuests = rsvpResponses
    .filter(r => r.attending)
    .reduce((sum, r) => sum + (r.guests || 1), 0);

  const filteredRsvps = useMemo(() => {
    let filtered = rsvpResponses;
    
    if (rsvpFilter === 'confirmed') filtered = filtered.filter(r => r.attending);
    else if (rsvpFilter === 'declined') filtered = filtered.filter(r => !r.attending && !r.pending);
    else if (rsvpFilter === 'pending') filtered = filtered.filter(r => r.pending);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [rsvpResponses, rsvpFilter, searchQuery]);

  const confirmationRate = totalResponses > 0 ? Math.round((confirmedCount / totalResponses) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: 'var(--crimson-base)', borderRightColor: 'var(--gold-base)' }} />
          </div>
          <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
            {lang === 'tr' ? 'Veriler yükleniyor...' : 'Loading data...'}
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
          className="max-w-md w-full p-8 rounded-2xl text-center"
          style={{ backgroundColor: 'var(--bg-panel-strong)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)' }}>
            ⚠️
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: tokens.colors.text.primary }}>{error}</h1>
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 rounded-full font-semibold transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--crimson-base)', color: 'white' }}
          >
            {lang === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}
          </button>
        </motion.div>
      </div>
    );
  }

  const weddingDate = invitationData?.date_iso ? new Date(invitationData.date_iso) : null;
  const daysUntilWedding = weddingDate ? Math.ceil((weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const tabs: { id: TabId; label: string; icon: string; count?: number }[] = [
    { id: 'overview', label: lang === 'tr' ? 'Genel Bakış' : 'Overview', icon: '📊' },
    { id: 'rsvp', label: lang === 'tr' ? 'Misafir Listesi' : 'Guest List', icon: '👥', count: totalResponses },
    { id: 'messages', label: lang === 'tr' ? 'Mesajlar' : 'Messages', icon: '💌', count: loveNotes.length },
    { id: 'testimonials', label: lang === 'tr' ? 'Misafir Yorumları' : 'Testimonials', icon: '💬', count: testimonials.length },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
      <BackButton href={`/invitation/${slug}`} />

      {/* Premium Header */}
      <header className="pt-12 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: 'rgba(200, 162, 74, 0.15)', color: 'var(--gold-base)' }}>
                  {lang === 'tr' ? 'Yönetim Paneli' : 'Dashboard'}
                </span>
                {daysUntilWedding !== null && daysUntilWedding > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                    {daysUntilWedding} {lang === 'tr' ? 'gün kaldı' : 'days left'}
                  </span>
                )}
              </div>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2"
                style={{ fontFamily: tokens.typography.fontFamily.serif.join(', '), color: tokens.colors.text.primary }}
              >
                {invitationData?.title || invitationData?.host_names}
              </h1>
              {invitationData?.location && (
                <p className="text-sm flex items-center gap-2" style={{ color: tokens.colors.text.muted }}>
                  📍 {invitationData.location}
                  {weddingDate && (
                    <> · 📅 {weddingDate.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</>
                  )}
                </p>
              )}
              {user?.email && (
                <p className="text-xs mt-2" style={{ color: tokens.colors.text.muted }}>
                  {user.email}
                </p>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => router.push(`/invitation/${slug}`)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
                style={{ backgroundColor: 'var(--bg-panel-strong)', border: '1px solid var(--border-base)', color: tokens.colors.text.primary }}
              >
                👁️ {lang === 'tr' ? 'Önizle' : 'Preview'}
              </button>
              <button
                onClick={() => router.push(`/customize/template-1?revise=${slug}`)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] flex items-center gap-2"
                style={{ backgroundColor: 'var(--crimson-base)', color: 'white' }}
              >
                ✏️ {lang === 'tr' ? 'Düzenle' : 'Edit'}
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Share Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-5 rounded-2xl border backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(200, 162, 74, 0.04)', borderColor: 'rgba(200, 162, 74, 0.2)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--gold-base)' }}>
                📤 {lang === 'tr' ? 'Davetiyeyi Paylaş' : 'Share Invitation'}
              </h3>
              <p className="text-xs" style={{ color: tokens.colors.text.muted }}>
                {lang === 'tr' ? 'WhatsApp, SMS veya e-posta ile gönderin' : 'Send via WhatsApp, SMS or email'}
              </p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? `${window.location.origin}/invitation/${slug}` : ''}
                className="px-4 py-2.5 rounded-xl border text-xs min-w-[200px] flex-1"
                style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)', color: tokens.colors.text.primary }}
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
                    if (input) { input.select(); document.execCommand('copy'); showToast(lang === 'tr' ? 'Link kopyalandı!' : 'Link copied!', 'success'); }
                  }
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--crimson-base)', color: 'white' }}
              >
                🔗 {lang === 'tr' ? 'Kopyala' : 'Copy'}
              </button>
              <button
                onClick={async () => {
                  const url = typeof window !== 'undefined' ? `${window.location.origin}/invitation/${slug}` : '';
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: invitationData?.title || '', text: lang === 'tr' ? 'Düğün davetiyemizi görüntüleyin' : 'View our wedding invitation', url });
                    } catch { /* cancelled */ }
                  } else {
                    await navigator.clipboard.writeText(url);
                    showToast(lang === 'tr' ? 'Link kopyalandı!' : 'Link copied!', 'success');
                  }
                }}
                className="px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02]"
                style={{ borderColor: 'var(--gold-base)', color: 'var(--gold-base)' }}
              >
                📱 {lang === 'tr' ? 'Paylaş' : 'Share'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 relative"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--crimson-base)' : 'var(--bg-panel-strong)',
                color: activeTab === tab.id ? 'white' : tokens.colors.text.secondary,
                border: activeTab === tab.id ? 'none' : '1px solid var(--border-base)',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--bg-panel)',
                    color: activeTab === tab.id ? 'white' : tokens.colors.text.muted,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {[
                  { label: lang === 'tr' ? 'Toplam Yanıt' : 'Total Responses', value: totalResponses, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)', icon: '📋' },
                  { label: lang === 'tr' ? 'Onaylı' : 'Confirmed', value: confirmedCount, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)', icon: '✅' },
                  { label: lang === 'tr' ? 'Beklemede' : 'Pending', value: pendingCount, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', icon: '⏳' },
                  { label: lang === 'tr' ? 'Reddedildi' : 'Declined', value: declinedCount, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', icon: '❌' },
                  { label: lang === 'tr' ? 'Toplam Misafir' : 'Total Guests', value: totalGuests, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)', icon: '👥' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 rounded-2xl relative overflow-hidden"
                    style={{ backgroundColor: stat.bg }}
                  >
                    <div className="absolute top-3 right-3 text-2xl opacity-40">{stat.icon}</div>
                    <div className="text-4xl font-black mb-1" style={{ color: stat.color, fontFamily: tokens.typography.fontFamily.serif.join(', ') }}>
                      {stat.value}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: stat.color, opacity: 0.8 }}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Confirmation Rate + Quick Actions */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Confirmation Rate */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl"
                  style={{ backgroundColor: 'var(--bg-panel-strong)' }}
                >
                  <h3 className="text-lg font-bold mb-4" style={{ color: tokens.colors.text.primary }}>
                    {lang === 'tr' ? 'Katılım Oranı' : 'Confirmation Rate'}
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" stroke="var(--border-base)" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          strokeWidth="10" stroke="#22c55e"
                          strokeLinecap="round"
                          strokeDasharray={`${confirmationRate * 2.64} 264`}
                          transform="rotate(-90 50 50)"
                          style={{ transition: 'stroke-dasharray 1s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black" style={{ color: '#22c55e' }}>
                          {confirmationRate}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {[
                        { label: lang === 'tr' ? 'Katılacak' : 'Attending', count: confirmedCount, color: '#22c55e' },
                        { label: lang === 'tr' ? 'Beklemede' : 'Pending', count: pendingCount, color: '#f59e0b' },
                        { label: lang === 'tr' ? 'Katılmayacak' : 'Not Attending', count: declinedCount, color: '#ef4444' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm" style={{ color: tokens.colors.text.secondary }}>{item.label}</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: tokens.colors.text.primary }}>{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 rounded-2xl"
                  style={{ backgroundColor: 'var(--bg-panel-strong)' }}
                >
                  <h3 className="text-lg font-bold mb-4" style={{ color: tokens.colors.text.primary }}>
                    {lang === 'tr' ? 'Hızlı İşlemler' : 'Quick Actions'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleExportExcel}
                      disabled={exporting}
                      className="p-4 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] border"
                      style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                    >
                      <div className="text-2xl mb-2">📥</div>
                      <div className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>
                        {exporting ? (lang === 'tr' ? 'İndiriliyor...' : 'Downloading...') : (lang === 'tr' ? 'Excel İndir' : 'Download Excel')}
                      </div>
                      <div className="text-xs" style={{ color: tokens.colors.text.muted }}>
                        {lang === 'tr' ? 'Tüm RSVP verilerini indir' : 'Download all RSVP data'}
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('rsvp')}
                      className="p-4 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] border"
                      style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                    >
                      <div className="text-2xl mb-2">👥</div>
                      <div className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>
                        {lang === 'tr' ? 'Misafir Listesi' : 'Guest List'}
                      </div>
                      <div className="text-xs" style={{ color: tokens.colors.text.muted }}>
                        {totalResponses} {lang === 'tr' ? 'yanıt' : 'responses'}
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="p-4 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] border"
                      style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                    >
                      <div className="text-2xl mb-2">💌</div>
                      <div className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>
                        {lang === 'tr' ? 'Mesajlar' : 'Messages'}
                      </div>
                      <div className="text-xs" style={{ color: tokens.colors.text.muted }}>
                        {loveNotes.length} {lang === 'tr' ? 'mesaj' : 'messages'}
                      </div>
                    </button>
                    <button
                      onClick={() => router.push(`/customize/template-1?revise=${slug}`)}
                      className="p-4 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] border"
                      style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}
                    >
                      <div className="text-2xl mb-2">✏️</div>
                      <div className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>
                        {lang === 'tr' ? 'Düzenle' : 'Edit'}
                      </div>
                      <div className="text-xs" style={{ color: tokens.colors.text.muted }}>
                        {lang === 'tr' ? 'Davetiyeyi güncelle' : 'Update invitation'}
                      </div>
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl"
                style={{ backgroundColor: 'var(--bg-panel-strong)' }}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? 'Son Aktiviteler' : 'Recent Activity'}
                </h3>
                {rsvpResponses.length === 0 && loveNotes.length === 0 ? (
                  <div className="py-8 text-center" style={{ color: tokens.colors.text.muted }}>
                    {lang === 'tr' ? 'Henüz aktivite yok. Davetiyenizi paylaşarak başlayın!' : 'No activity yet. Start by sharing your invitation!'}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {[
                      ...rsvpResponses.map(r => ({
                        type: 'rsvp' as const,
                        name: r.name,
                        detail: r.attending
                          ? (lang === 'tr' ? `katılacak (${r.guests} kişi)` : `attending (${r.guests} guests)`)
                          : r.pending
                          ? (lang === 'tr' ? 'henüz kararsız' : 'undecided')
                          : (lang === 'tr' ? 'katılamayacak' : 'not attending'),
                        date: r.submittedAt,
                        color: r.attending ? '#22c55e' : r.pending ? '#f59e0b' : '#ef4444',
                        icon: r.attending ? '✅' : r.pending ? '⏳' : '❌',
                      })),
                      ...loveNotes.map(n => ({
                        type: 'message' as const,
                        name: n.guest_name,
                        detail: n.message.length > 60 ? n.message.substring(0, 60) + '...' : n.message,
                        date: n.created_at,
                        color: 'var(--gold-base)',
                        icon: '💌',
                      })),
                    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).map((item, i) => (
                      <div key={`${item.type}-${i}`} className="flex items-start gap-3 p-3 rounded-xl transition-colors" style={{ backgroundColor: 'var(--bg-panel)' }}>
                        <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>{item.name}</span>
                            <span className="text-xs" style={{ color: item.color }}>{item.detail}</span>
                          </div>
                          <span className="text-xs" style={{ color: tokens.colors.text.muted }}>
                            {new Date(item.date).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* RSVP TAB */}
          {activeTab === 'rsvp' && (
            <motion.div key="rsvp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: tokens.colors.text.muted }}>🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'tr' ? 'İsim, telefon veya e-posta ile ara...' : 'Search by name, phone or email...'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors"
                    style={{ backgroundColor: 'var(--bg-panel-strong)', borderColor: 'var(--border-base)', color: tokens.colors.text.primary }}
                  />
                </div>
                
                {/* Filter Pills */}
                <div className="flex gap-2 flex-wrap">
                  {([
                    { id: 'all' as RSVPFilter, label: lang === 'tr' ? 'Tümü' : 'All', count: totalResponses },
                    { id: 'confirmed' as RSVPFilter, label: lang === 'tr' ? 'Onaylı' : 'Confirmed', count: confirmedCount },
                    { id: 'pending' as RSVPFilter, label: lang === 'tr' ? 'Bekleyen' : 'Pending', count: pendingCount },
                    { id: 'declined' as RSVPFilter, label: lang === 'tr' ? 'Reddeden' : 'Declined', count: declinedCount },
                  ]).map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setRsvpFilter(filter.id)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                      style={{
                        backgroundColor: rsvpFilter === filter.id ? 'var(--crimson-base)' : 'var(--bg-panel-strong)',
                        color: rsvpFilter === filter.id ? 'white' : tokens.colors.text.secondary,
                        border: rsvpFilter === filter.id ? 'none' : '1px solid var(--border-base)',
                      }}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>

                {/* Export Button */}
                <button
                  onClick={handleExportExcel}
                  disabled={exporting}
                  className="px-5 py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] flex items-center gap-2 whitespace-nowrap"
                  style={{ backgroundColor: '#16a34a', color: 'white', opacity: exporting ? 0.7 : 1 }}
                >
                  📥 {exporting ? (lang === 'tr' ? 'İndiriliyor...' : 'Downloading...') : (lang === 'tr' ? 'Excel İndir' : 'Export Excel')}
                </button>
              </div>

              {/* Results Count */}
              <p className="text-xs font-medium mb-4" style={{ color: tokens.colors.text.muted }}>
                {filteredRsvps.length} / {totalResponses} {lang === 'tr' ? 'sonuç gösteriliyor' : 'results shown'}
              </p>

              {/* RSVP List */}
              <div className="space-y-3">
                {filteredRsvps.length === 0 ? (
                  <div className="p-12 rounded-2xl text-center" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-lg font-medium mb-2" style={{ color: tokens.colors.text.primary }}>
                      {searchQuery
                        ? (lang === 'tr' ? 'Sonuç bulunamadı' : 'No results found')
                        : (lang === 'tr' ? 'Henüz yanıt yok' : 'No responses yet')}
                    </p>
                    <p className="text-sm" style={{ color: tokens.colors.text.muted }}>
                      {searchQuery
                        ? (lang === 'tr' ? 'Farklı bir arama deneyin' : 'Try a different search')
                        : (lang === 'tr' ? 'Davetiyenizi paylaşarak başlayın' : 'Share your invitation to get started')}
                    </p>
                  </div>
                ) : (
                  filteredRsvps.map((response, index) => {
                    const isExpanded = expandedRsvpId === response.id;
                    const statusConfig = response.attending
                      ? { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)', icon: '✅', label: lang === 'tr' ? 'Katılacak' : 'Attending' }
                      : response.pending
                      ? { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', icon: '⏳', label: lang === 'tr' ? 'Beklemede' : 'Pending' }
                      : { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', icon: '❌', label: lang === 'tr' ? 'Katılmayacak' : 'Not Attending' };

                    return (
                      <motion.div
                        key={response.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="rounded-2xl overflow-hidden transition-all cursor-pointer"
                        style={{ backgroundColor: 'var(--bg-panel-strong)', border: isExpanded ? `2px solid ${statusConfig.color}30` : '1px solid var(--border-base)' }}
                        onClick={() => setExpandedRsvpId(isExpanded ? null : response.id)}
                      >
                        <div className="p-4 sm:p-5 flex items-center gap-4">
                          {/* Avatar */}
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
                            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                          >
                            {response.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold truncate" style={{ color: tokens.colors.text.primary }}>
                                {response.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                                {statusConfig.label}
                              </span>
                              {response.attending && response.guests > 1 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', color: '#6366f1' }}>
                                  {response.guests} {lang === 'tr' ? 'kişi' : 'guests'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              {response.phone && (
                                <span className="text-xs" style={{ color: tokens.colors.text.muted }}>📞 {response.phone}</span>
                              )}
                              {response.email && (
                                <span className="text-xs" style={{ color: tokens.colors.text.muted }}>✉️ {response.email}</span>
                              )}
                            </div>
                          </div>

                          {/* Date + Expand */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-xs hidden sm:block" style={{ color: tokens.colors.text.muted }}>
                              {new Date(response.submittedAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-xs transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', color: tokens.colors.text.muted }}>
                              ▼
                            </span>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 pt-2 border-t space-y-4" style={{ borderColor: 'var(--border-base)' }}>
                                {/* Selected Events */}
                                {response.selectedEvents && response.selectedEvents.length > 0 && (
                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.text.muted }}>
                                      {lang === 'tr' ? 'Etkinlikler' : 'Events'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {response.selectedEvents.map((event, idx) => (
                                        <span key={idx} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(200, 162, 74, 0.1)', color: 'var(--gold-base)' }}>
                                          {event}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Note */}
                                {response.message && (
                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.text.muted }}>
                                      {lang === 'tr' ? 'Not' : 'Note'}
                                    </p>
                                    <p className="text-sm italic p-3 rounded-xl" style={{ color: tokens.colors.text.secondary, backgroundColor: 'var(--bg-panel)' }}>
                                      &quot;{response.message}&quot;
                                    </p>
                                  </div>
                                )}

                                {/* Guest Answers */}
                                {response.guestAnswers && response.guestAnswers.length > 0 && (
                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tokens.colors.text.muted }}>
                                      {lang === 'tr' ? 'Özel Sorular' : 'Custom Questions'}
                                    </p>
                                    <div className="space-y-2">
                                      {response.guestAnswers.map((qa, qaIdx) => (
                                        <div key={qaIdx} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-panel)' }}>
                                          <p className="text-xs font-semibold mb-1" style={{ color: tokens.colors.text.primary }}>{qa.question}</p>
                                          <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>{qa.answer}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <p className="text-xs" style={{ color: tokens.colors.text.muted }}>
                                  {new Date(response.submittedAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: tokens.colors.text.primary }}>
                    💕 {lang === 'tr' ? 'Gelin ve Damata Mesajlar' : 'Messages to the Couple'}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: tokens.colors.text.muted }}>
                    {loveNotes.length} {lang === 'tr' ? 'mesaj alındı' : 'messages received'}
                  </p>
                </div>
              </div>

              {loveNotes.length === 0 ? (
                <div className="p-12 rounded-2xl text-center" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
                  <div className="text-5xl mb-4">💌</div>
                  <p className="text-lg font-medium mb-2" style={{ color: tokens.colors.text.primary }}>
                    {lang === 'tr' ? 'Henüz mesaj yok' : 'No messages yet'}
                  </p>
                  <p className="text-sm" style={{ color: tokens.colors.text.muted }}>
                    {lang === 'tr' ? 'Misafirleriniz RSVP yaparken mesaj bırakabilir' : 'Guests can leave messages when they RSVP'}
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {loveNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 rounded-2xl relative group"
                      style={{ backgroundColor: 'var(--bg-panel-strong)', border: '1px solid var(--border-base)' }}
                    >
                      <div className="absolute -top-3 -left-1 text-3xl opacity-20">❝</div>
                      <p
                        className="text-base leading-relaxed mb-4 relative z-10"
                        style={{ color: tokens.colors.text.primary, fontStyle: 'italic' }}
                      >
                        {note.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'rgba(200, 162, 74, 0.15)', color: 'var(--gold-base)' }}>
                            {note.guest_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>{note.guest_name}</p>
                            {note.guest_email && (
                              <p className="text-xs" style={{ color: tokens.colors.text.muted }}>{note.guest_email}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs" style={{ color: tokens.colors.text.muted }}>
                          {new Date(note.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TESTIMONIALS TAB */}
          {activeTab === 'testimonials' && (
            <motion.div key="testimonials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: tokens.colors.text.primary }}>
                    💬 {lang === 'tr' ? 'Misafir Yorumları' : 'Guest Testimonials'}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: tokens.colors.text.muted }}>
                    {testimonials.filter(t => t.approved).length}/{testimonials.length} {lang === 'tr' ? 'onaylandı' : 'approved'}
                  </p>
                </div>
              </div>

              {testimonials.length === 0 ? (
                <div className="p-12 rounded-2xl text-center" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
                  <div className="text-5xl mb-4">💬</div>
                  <p className="text-lg font-medium mb-2" style={{ color: tokens.colors.text.primary }}>
                    {lang === 'tr' ? 'Henüz yorum yok' : 'No testimonials yet'}
                  </p>
                  <p className="text-sm" style={{ color: tokens.colors.text.muted }}>
                    {lang === 'tr' ? 'Misafirler davetiye sayfasından yorum bırakabilir' : 'Guests can leave testimonials on the invitation page'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-5 rounded-2xl flex items-start gap-4"
                      style={{
                        backgroundColor: 'var(--bg-panel-strong)',
                        border: `1px solid ${testimonial.approved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
                        style={{
                          backgroundColor: testimonial.approved ? 'rgba(34, 197, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                          color: testimonial.approved ? '#22c55e' : '#f59e0b',
                        }}
                      >
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="text-sm font-bold" style={{ color: tokens.colors.text.primary }}>{testimonial.name}</h4>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: testimonial.approved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: testimonial.approved ? '#22c55e' : '#f59e0b',
                            }}
                          >
                            {testimonial.approved ? (lang === 'tr' ? 'Onaylı' : 'Approved') : (lang === 'tr' ? 'Beklemede' : 'Pending')}
                          </span>
                          <span className="text-xs" style={{ color: tokens.colors.text.muted }}>
                            {new Date(testimonial.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm mb-3 italic" style={{ color: tokens.colors.text.secondary }}>
                          &quot;{testimonial.message}&quot;
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleTestimonialApproval(testimonial.id, testimonial.approved)}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02]"
                            style={{
                              backgroundColor: testimonial.approved ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                              color: testimonial.approved ? '#f59e0b' : '#22c55e',
                            }}
                          >
                            {testimonial.approved ? (lang === 'tr' ? '👁️ Gizle' : '👁️ Hide') : (lang === 'tr' ? '✓ Onayla' : '✓ Approve')}
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(testimonial.id)}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02]"
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}
                          >
                            🗑️ {lang === 'tr' ? 'Sil' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
