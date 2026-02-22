'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { isAdminEmail } from '@/lib/admin';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';
import { Header } from '@/components/layout/Header';

interface Invitation {
  id: string;
  slug: string;
  title: string;
  host_names?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { lang } = useI18n();
  const supabase = createSupabaseBrowserClient();
  
  const [user, setUser] = useState<any>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    // Check authentication and admin status FIRST
    const checkAuth = async () => {
      try {
        setCheckingAdmin(true);
        setLoading(true);
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/login?redirect=/dashboard');
          return;
        }
        
        setUser(user);
        
        // If admin, redirect to admin dashboard immediately (before loading anything)
        if (isAdminEmail(user.email)) {
          window.location.href = '/admin'; // Force full page redirect
          return;
        }
        
        // Not admin, fetch invitations
        setCheckingAdmin(false);
        await fetchInvitations();
      } catch (error) {
        console.error('Error in checkAuth:', error);
        setError(lang === 'tr' ? 'Bir hata oluştu' : 'An error occurred');
        setCheckingAdmin(false);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router, supabase, lang]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        setError(lang === 'tr' ? 'Kullanıcı bilgisi alınamadı' : 'Failed to get user info');
        setLoading(false);
        return;
      }

      const { data: userInvitations, error: invError } = await supabase
        .from('invitations')
        .select('*')
        .eq('owner_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (invError) {
        console.error('Error fetching invitations:', invError);
        setError(
          lang === 'tr' 
            ? `Davetiyeler yüklenemedi: ${invError.message}` 
            : `Failed to load invitations: ${invError.message}`
        );
        setLoading(false);
        return;
      }

      setInvitations(userInvitations || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setError(lang === 'tr' ? 'Bir hata oluştu' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Show loading while checking admin status or loading data
  if (checkingAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--crimson-base)' }}></div>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
              {lang === 'tr' ? 'Dashboard' : 'Dashboard'}
            </h1>
            {user?.email && (
              <p className="text-lg" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Hoş geldiniz,' : 'Welcome,'} {user.email}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-full border transition-all"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            >
              {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
            </button>
            <button
              onClick={() => router.push('/customize/template-1')}
              className="px-6 py-2 rounded-full font-semibold transition-all"
              style={{
                backgroundColor: 'var(--crimson-base)',
                color: 'white',
              }}
            >
              {lang === 'tr' ? '+ Yeni Davetiye' : '+ New Invitation'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full border transition-all"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            >
              {lang === 'tr' ? 'Çıkış' : 'Logout'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
            <p className="text-sm" style={{ color: 'var(--crimson-base)' }}>
              {error}
            </p>
          </div>
        )}

        {/* Invitations List */}
        {invitations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4 rounded-xl"
            style={{ backgroundColor: 'var(--bg-panel-strong)' }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: tokens.colors.text.primary }}>
              {lang === 'tr' ? 'Henüz davetiye yok' : 'No invitations yet'}
            </h2>
            <p className="mb-6" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' 
                ? 'İlk davetiyenizi oluşturmak için "Yeni Davetiye" butonuna tıklayın.'
                : 'Click "New Invitation" to create your first invitation.'}
            </p>
            <button
              onClick={() => router.push('/customize/template-1')}
              className="px-6 py-3 rounded-full font-semibold transition-all"
              style={{
                backgroundColor: 'var(--crimson-base)',
                color: 'white',
              }}
            >
              {lang === 'tr' ? '+ Yeni Davetiye Oluştur' : '+ Create New Invitation'}
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map((invitation, index) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl cursor-pointer transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--bg-panel-strong)' }}
                onClick={() => router.push(`/invitation/${invitation.slug}/dashboard`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
                      {invitation.title}
                    </h3>
                    {invitation.host_names && (
                      <p className="text-sm mb-2" style={{ color: tokens.colors.text.secondary }}>
                        {invitation.host_names}
                      </p>
                    )}
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: invitation.is_published
                        ? 'var(--crimson-base)'
                        : 'var(--ink-base)',
                      color: 'white',
                    }}
                  >
                    {invitation.is_published
                      ? (lang === 'tr' ? 'Yayında' : 'Published')
                      : (lang === 'tr' ? 'Taslak' : 'Draft')}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/invitation/${invitation.slug}`);
                    }}
                    className="flex-1 px-4 py-2 rounded-full text-sm transition-all"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      color: tokens.colors.text.primary,
                    }}
                  >
                    {lang === 'tr' ? 'Görüntüle' : 'View'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/invitation/${invitation.slug}/dashboard`);
                    }}
                    className="flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: 'var(--crimson-base)',
                      color: 'white',
                    }}
                  >
                    {lang === 'tr' ? 'Yönet' : 'Manage'}
                  </button>
                </div>

                <p className="text-xs mt-4" style={{ color: tokens.colors.text.muted }}>
                  {new Date(invitation.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

