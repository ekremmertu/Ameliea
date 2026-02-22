/**
 * Admin Dashboard Page
 * Protected route - only accessible by admin users
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { isAdminEmail } from '@/lib/admin';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';
import { BackButton } from '@/components/ui/BackButton';

interface UserStats {
  id: string;
  email: string;
  created_at: string;
  invitations_count: number;
  rsvps_count: number;
  token_metrics?: {
    totalSent: number;
    totalOpened: number;
    totalResponded: number;
  };
}

interface InvitationStats {
  id: string;
  slug: string;
  title: string;
  owner_email: string;
  created_at: string;
  is_published: boolean;
  rsvps_count: number;
}

interface PlatformStats {
  totalUsers: number;
  totalInvitations: number;
  totalRSVPs: number;
  publishedInvitations: number;
  activeUsers: number;
  newUsersLast30Days: number;
  newInvitationsLast30Days: number;
  totalTokensSent: number;
  totalTokensOpened: number;
  totalTokensResponded: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { lang } = useI18n();
  const supabase = createSupabaseBrowserClient();
  
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [invitationStats, setInvitationStats] = useState<InvitationStats[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          router.push('/login?redirect=/admin');
          return;
        }

        setUser(currentUser);

        // Check if user is admin
        if (!isAdminEmail(currentUser.email)) {
          router.push('/dashboard');
          return;
        }

        setIsAdmin(true);
        await fetchAdminData();
      } catch (error) {
        console.error('Error checking admin:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router, supabase]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }

      const data = await response.json();
      setPlatformStats(data.platformStats);
      setUserStats(data.userStats);
      setInvitationStats(data.invitationStats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
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

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Back Button - positioned relative to container */}
        <div className="mb-6">
          <BackButton href="/" position="relative" />
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
            {lang === 'tr' ? 'Admin Paneli' : 'Admin Dashboard'}
          </h1>
          <p className="text-lg" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' ? 'Platform İstatistikleri ve Yönetim' : 'Platform Statistics & Management'}
          </p>
          {user?.email && (
            <p className="text-sm mt-1" style={{ color: tokens.colors.text.muted }}>
              {lang === 'tr' ? 'Giriş yapan:' : 'Signed in as:'} {user.email}
            </p>
          )}
        </div>

        {/* Platform Statistics - Overview */}
        {platformStats && (
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-panel-strong)' }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
                {platformStats.totalUsers}
              </div>
              <div className="text-sm mb-1" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Toplam Kullanıcı' : 'Total Users'}
              </div>
              <div className="text-xs" style={{ color: 'var(--gold-base)' }}>
                +{platformStats.newUsersLast30Days} {lang === 'tr' ? 'son 30 gün' : 'last 30 days'}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-panel-strong)' }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--crimson-base)' }}>
                {platformStats.totalInvitations}
              </div>
              <div className="text-sm mb-1" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Toplam Davetiye' : 'Total Invitations'}
              </div>
              <div className="text-xs" style={{ color: 'var(--gold-base)' }}>
                +{platformStats.newInvitationsLast30Days} {lang === 'tr' ? 'son 30 gün' : 'last 30 days'}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-panel-strong)' }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--gold-base)' }}>
                {platformStats.publishedInvitations}
              </div>
              <div className="text-sm mb-1" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Yayınlanan' : 'Published'}
              </div>
              <div className="text-xs" style={{ color: tokens.colors.text.secondary }}>
                {platformStats.totalInvitations > 0 
                  ? Math.round((platformStats.publishedInvitations / platformStats.totalInvitations) * 100) 
                  : 0}% {lang === 'tr' ? 'yayın oranı' : 'publish rate'}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-panel-strong)' }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
                {platformStats.totalRSVPs}
              </div>
              <div className="text-sm mb-1" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Toplam RSVP' : 'Total RSVPs'}
              </div>
              <div className="text-xs" style={{ color: tokens.colors.text.secondary }}>
                {platformStats.publishedInvitations > 0 
                  ? Math.round((platformStats.totalRSVPs / platformStats.publishedInvitations) * 10) / 10 
                  : 0} {lang === 'tr' ? 'RSVP/davetiye' : 'RSVPs/invitation'}
              </div>
            </motion.div>
          </div>
        )}

        {/* Growth & Engagement Metrics */}
        {platformStats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-panel-strong)' }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--crimson-base)' }}>
                {platformStats.activeUsers}
              </div>
              <div className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Aktif Kullanıcı (30 gün)' : 'Active Users (30 days)'}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-panel-strong)' }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--gold-base)' }}>
                {platformStats.totalTokensSent}
              </div>
              <div className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Gönderilen Token' : 'Tokens Sent'}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-panel-strong)' }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--crimson-base)' }}>
                {platformStats.totalTokensOpened}
              </div>
              <div className="text-sm mb-1" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Açılan Link' : 'Links Opened'}
              </div>
              <div className="text-xs" style={{ color: tokens.colors.text.secondary }}>
                {platformStats.totalTokensSent > 0 
                  ? Math.round((platformStats.totalTokensOpened / platformStats.totalTokensSent) * 100) 
                  : 0}% {lang === 'tr' ? 'açılma oranı' : 'open rate'}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-panel-strong)' }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
                {platformStats.totalTokensResponded}
              </div>
              <div className="text-sm mb-1" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Yanıt Verilen' : 'Responded'}
              </div>
              <div className="text-xs" style={{ color: tokens.colors.text.secondary }}>
                {platformStats.totalTokensOpened > 0 
                  ? Math.round((platformStats.totalTokensResponded / platformStats.totalTokensOpened) * 100) 
                  : 0}% {lang === 'tr' ? 'yanıt oranı' : 'response rate'}
              </div>
            </motion.div>
          </div>
        )}

        {/* User Statistics */}
        <div className="rounded-xl overflow-hidden mb-8" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
          <div className="p-6 border-b" style={{ borderColor: 'var(--border-base)' }}>
            <h2 className="text-2xl font-bold" style={{ color: tokens.colors.text.primary }}>
              {lang === 'tr' ? 'Kullanıcı İstatistikleri' : 'User Statistics'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-base)' }}>
                  <th className="p-4 text-left text-sm font-semibold" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Email' : 'Email'}
                  </th>
                  <th className="p-4 text-left text-sm font-semibold" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Davetiye Sayısı' : 'Invitations'}
                  </th>
                  <th className="p-4 text-left text-sm font-semibold" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'RSVP Sayısı' : 'RSVPs'}
                  </th>
                  <th className="p-4 text-left text-sm font-semibold" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Token Metrikleri' : 'Token Metrics'}
                  </th>
                  <th className="p-4 text-left text-sm font-semibold" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Kayıt Tarihi' : 'Created At'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {userStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center" style={{ color: tokens.colors.text.secondary }}>
                      {lang === 'tr' ? 'Kullanıcı bulunamadı' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  userStats.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-opacity-50 transition-colors"
                      style={{ borderColor: 'var(--border-base)' }}
                    >
                      <td className="p-4" style={{ color: tokens.colors.text.primary }}>
                        {user.email}
                      </td>
                      <td className="p-4" style={{ color: tokens.colors.text.primary }}>
                        {user.invitations_count}
                      </td>
                      <td className="p-4" style={{ color: tokens.colors.text.primary }}>
                        {user.rsvps_count}
                      </td>
                      <td className="p-4 text-xs" style={{ color: tokens.colors.text.secondary }}>
                        {user.token_metrics ? (
                          <div className="space-y-1">
                            <div>{lang === 'tr' ? 'Gönderilen:' : 'Sent:'} {user.token_metrics.totalSent}</div>
                            <div>{lang === 'tr' ? 'Açılan:' : 'Opened:'} {user.token_metrics.totalOpened}</div>
                            <div>{lang === 'tr' ? 'Yanıtlanan:' : 'Responded:'} {user.token_metrics.totalResponded}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-4 text-sm" style={{ color: tokens.colors.text.secondary }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invitation Statistics */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
          <div className="p-6 border-b" style={{ borderColor: 'var(--border-base)' }}>
            <h2 className="text-2xl font-bold" style={{ color: tokens.colors.text.primary }}>
              {lang === 'tr' ? 'Davetiye İstatistikleri' : 'Invitation Statistics'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-base)' }}>
                  <th className="p-4 text-left text-sm font-semibold" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Başlık' : 'Title'}
                  </th>
                  <th className="p-4 text-left text-sm font-semibold" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Sahibi' : 'Owner'}
                  </th>
                  <th className="p-4 text-left text-sm font-semibold" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'RSVP Sayısı' : 'RSVPs'}
                  </th>
                  <th className="p-4 text-left text-sm font-semibold" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Durum' : 'Status'}
                  </th>
                  <th className="p-4 text-left text-sm font-semibold" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Oluşturulma' : 'Created'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {invitationStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center" style={{ color: tokens.colors.text.secondary }}>
                      {lang === 'tr' ? 'Davetiye bulunamadı' : 'No invitations found'}
                    </td>
                  </tr>
                ) : (
                  invitationStats.map((inv, index) => (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-opacity-50 transition-colors"
                      style={{ borderColor: 'var(--border-base)' }}
                    >
                      <td className="p-4" style={{ color: tokens.colors.text.primary }}>
                        <a
                          href={`/invitation/${inv.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                          style={{ color: 'var(--crimson-base)' }}
                        >
                          {inv.title}
                        </a>
                      </td>
                      <td className="p-4" style={{ color: tokens.colors.text.primary }}>
                        {inv.owner_email}
                      </td>
                      <td className="p-4" style={{ color: tokens.colors.text.primary }}>
                        {inv.rsvps_count}
                      </td>
                      <td className="p-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: inv.is_published ? 'var(--crimson-base)' : 'var(--ink-base)',
                            color: 'white',
                          }}
                        >
                          {inv.is_published
                            ? (lang === 'tr' ? 'Yayında' : 'Published')
                            : (lang === 'tr' ? 'Taslak' : 'Draft')}
                        </span>
                      </td>
                      <td className="p-4 text-sm" style={{ color: tokens.colors.text.secondary }}>
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

