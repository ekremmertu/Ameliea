'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/I18nProvider';
import { tokens } from '@/lib/design-tokens';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { isAdminEmail } from '@/lib/admin';
import { hasActivePurchase } from '@/lib/purchase';

export function Header() {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [hasPurchase, setHasPurchase] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Check auth status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Check if user has active purchase
        hasActivePurchase(user.id).then(setHasPurchase);
      } else {
        setHasPurchase(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Check if user has active purchase
        const hasActive = await hasActivePurchase(session.user.id);
        setHasPurchase(hasActive);
      } else {
        setHasPurchase(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const scrollTo = (id: string) => {
    // If not on home page, navigate to home first, then scroll
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      router.push(`/#${id}`);
      setMobileMenuOpen(false);
      return;
    }
    // If on home page, just scroll
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/') {
        // Already on home page, scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Navigate to home page
        router.push('/');
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link 
          href="/" 
          onClick={handleLogoClick}
          className="flex items-center gap-2 cursor-pointer" 
          aria-label="Go to home"
        >
          <span className="text-2xl">◎</span>
          <span className="font-semibold text-lg" style={{ fontFamily: tokens.typography.fontFamily.brand.join(', '), fontSize: '33px' }}>
            {t('brand_name')}
          </span>
        </Link>

        <nav className="hidden md:flex gap-2">
          <button 
            onClick={() => scrollTo('journey')} 
            className="px-3 py-2 rounded-full transition-colors hover:text-white"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--crimson-base)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {t('nav_journey')}
          </button>
          <button 
            onClick={() => scrollTo('themes')} 
            className="px-3 py-2 rounded-full transition-colors hover:text-white"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--crimson-base)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {t('nav_themes')}
          </button>
          <button 
            onClick={() => scrollTo('love-notes')} 
            className="px-3 py-2 rounded-full transition-colors hover:text-white"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--crimson-base)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {t('nav_love_notes')}
          </button>
          <button 
            onClick={() => scrollTo('pricing')} 
            className="px-3 py-2 rounded-full transition-colors hover:text-white"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--crimson-base)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {t('nav_contact')}
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {/* Show Dashboard button only if user has purchase or is admin */}
              {(hasPurchase || isAdminEmail(user.email)) && (
                <button
                  onClick={() => router.push(isAdminEmail(user.email) ? '/admin' : '/dashboard')}
                  className="px-4 py-2 rounded-full font-semibold transition-all touch-manipulation"
                  style={{
                    backgroundColor: 'var(--crimson-base)',
                    color: 'white',
                    minWidth: '44px',
                    minHeight: '44px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  {isAdminEmail(user.email) 
                    ? (lang === 'tr' ? 'Admin' : 'Admin')
                    : (lang === 'tr' ? 'Dashboard' : 'Dashboard')}
                </button>
              )}
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="px-4 py-2 rounded-full font-semibold transition-all touch-manipulation"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'var(--border-base)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  color: tokens.colors.text.primary,
                  minWidth: '44px',
                  minHeight: '44px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-panel)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {lang === 'tr' ? 'Çıkış' : 'Logout'}
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => router.push('/register')}
                className="px-4 py-2 rounded-full font-semibold transition-all touch-manipulation"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'var(--border-base)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  color: tokens.colors.text.primary,
                  minWidth: '44px',
                  minHeight: '44px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-panel)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {lang === 'tr' ? 'Kayıt Ol' : 'Sign Up'}
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 rounded-full font-semibold transition-all touch-manipulation"
                style={{
                  backgroundColor: 'var(--crimson-base)',
                  color: 'white',
                  minWidth: '44px',
                  minHeight: '44px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
              </button>
            </div>
          )}
          <div className="flex border rounded-full overflow-hidden">
            <button
              onClick={() => setLang('tr')}
              className="px-3 py-2 text-sm transition-colors touch-manipulation"
              style={{ 
                backgroundColor: lang === 'tr' ? 'var(--gold-base)' : 'transparent',
                color: lang === 'tr' ? 'white' : 'inherit',
                minWidth: '44px',
                minHeight: '44px'
              }}
            >
              TR
            </button>
            <button
              onClick={() => setLang('en')}
              className="px-3 py-2 text-sm transition-colors touch-manipulation"
              style={{ 
                backgroundColor: lang === 'en' ? 'var(--gold-base)' : 'transparent',
                color: lang === 'en' ? 'white' : 'inherit',
                minWidth: '44px',
                minHeight: '44px'
              }}
            >
              EN
            </button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-11 h-11 rounded-xl border flex items-center justify-center touch-manipulation"
            aria-label="Toggle menu"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            {mobileMenuOpen ? '×' : '☰'}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t px-4 py-4 space-y-2"
        >
          <button 
            onClick={() => scrollTo('journey')} 
            className="block w-full text-left px-3 py-2 rounded-xl transition-colors hover:text-white"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--crimson-base)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {t('nav_journey')}
          </button>
          <button 
            onClick={() => scrollTo('themes')} 
            className="block w-full text-left px-3 py-2 rounded-xl transition-colors hover:text-white"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--crimson-base)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {t('nav_themes')}
          </button>
          <button 
            onClick={() => scrollTo('love-notes')} 
            className="block w-full text-left px-3 py-2 rounded-xl transition-colors hover:text-white"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--crimson-base)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {t('nav_love_notes')}
          </button>
          <button 
            onClick={() => scrollTo('pricing')} 
            className="block w-full text-left px-3 py-2 rounded-xl transition-colors hover:text-white"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--crimson-base)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {t('nav_contact')}
          </button>
          {user ? (
            <>
              {/* Show Dashboard button only if user has purchase or is admin */}
              {(hasPurchase || isAdminEmail(user.email)) && (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(isAdminEmail(user.email) ? '/admin' : '/dashboard');
                  }}
                  className="block w-full text-left px-3 py-2 rounded-xl transition-colors font-semibold"
                  style={{ 
                    backgroundColor: 'var(--crimson-base)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  {isAdminEmail(user.email) 
                    ? (lang === 'tr' ? 'Admin' : 'Admin')
                    : (lang === 'tr' ? 'Dashboard' : 'Dashboard')}
                </button>
              )}
              <button 
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="block w-full text-left px-3 py-2 rounded-xl transition-colors font-semibold border"
                style={{ 
                  backgroundColor: 'transparent',
                  borderColor: 'var(--border-base)',
                  color: tokens.colors.text.primary
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-panel)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {lang === 'tr' ? 'Çıkış' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/register');
                }}
                className="block w-full text-left px-3 py-2 rounded-xl transition-colors font-semibold border"
                style={{ 
                  backgroundColor: 'transparent',
                  borderColor: 'var(--border-base)',
                  color: tokens.colors.text.primary
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-panel)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {lang === 'tr' ? 'Kayıt Ol' : 'Sign Up'}
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/login');
                }}
                className="block w-full text-left px-3 py-2 rounded-xl transition-colors font-semibold"
                style={{ 
                  backgroundColor: 'var(--crimson-base)',
                  color: 'white'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
              </button>
            </>
          )}
        </motion.div>
      )}
    </header>
  );
}

