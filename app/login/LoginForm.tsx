'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { isAdminEmail } from '@/lib/admin';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

export function LoginForm() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useSearchParams();
  const router = useRouter();
  const { lang } = useI18n();

  const redirect = params.get('redirect') || '/';

  async function handleLogin() {
    if (!email || !email.includes('@')) {
      setError(lang === 'tr' ? 'Geçerli bir email adresi girin' : 'Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setError(lang === 'tr' ? 'Şifre gereklidir' : 'Password is required');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      // Check if user is admin and redirect accordingly
      if (isAdminEmail(email)) {
        window.location.href = '/admin'; // Force full page redirect
      } else if (redirect && redirect !== '/') {
        router.push(redirect);
      } else {
        // Check if user has purchase before redirecting to dashboard
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check purchase status
          const { data: purchase } = await supabase
            .from('purchases')
            .select('id, status, expires_at')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('purchased_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          const hasActivePurchase = purchase && (!purchase.expires_at || new Date(purchase.expires_at) > new Date());
          
          if (hasActivePurchase) {
            router.push('/dashboard');
          } else {
            // No purchase, go to home page
            router.push('/');
          }
        } else {
          router.push('/');
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full p-8 rounded-xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
          {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
        </h1>
        <p className="mb-6 text-sm" style={{ color: tokens.colors.text.secondary }}>
          {lang === 'tr' 
            ? 'Email ve şifrenizle giriş yapın.' 
            : 'Sign in with your email and password.'}
        </p>

        <div className="space-y-4">
          <div>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: error ? 'var(--crimson-base)' : 'var(--border-base)',
                minHeight: '44px',
                fontSize: '16px',
              }}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder={lang === 'tr' ? 'email@ornek.com' : 'email@example.com'}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </div>

          <div>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: error ? 'var(--crimson-base)' : 'var(--border-base)',
                minHeight: '44px',
                fontSize: '16px',
              }}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder={lang === 'tr' ? 'Şifre' : 'Password'}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--crimson-base)' }}>
              {error}
            </p>
          )}

          <button
            className="w-full px-6 py-3 rounded-full font-semibold transition-all min-h-[44px] disabled:opacity-50"
            style={{
              backgroundColor: 'var(--crimson-base)',
              color: 'white',
            }}
            onClick={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading 
              ? (lang === 'tr' ? 'Giriş yapılıyor...' : 'Signing in...')
              : (lang === 'tr' ? 'Giriş Yap' : 'Sign In')}
          </button>

          <div className="text-center">
            <button
              className="text-sm underline"
              style={{ color: tokens.colors.text.secondary }}
              onClick={() => router.push('/register')}
            >
              {lang === 'tr' ? 'Hesabınız yok mu? Kayıt olun' : 'Don\'t have an account? Sign up'}
            </button>
          </div>
        </div>

        <button
          className="mt-6 text-sm underline"
          style={{ color: tokens.colors.text.secondary }}
          onClick={() => router.push('/')}
        >
          {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
        </button>
      </div>
    </div>
  );
}

