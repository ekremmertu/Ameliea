'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { Journey } from '@/components/sections/Journey';
import { LoveNotes } from '@/components/sections/LoveNotes';
import { FAQ } from '@/components/sections/FAQ';
import { IntroAnimation } from '@/components/sections/IntroAnimation';
import { MusicPlayer } from '@/components/ui/MusicPlayer';
import { DashboardPreview } from '@/components/sections/DashboardPreview';
import { Pricing } from '@/components/sections/Pricing';
import { ForPlanners } from '@/components/sections/ForPlanners';
import { ContactInfo } from '@/components/sections/ContactInfo';
import { Features } from '@/components/sections/Features';
import { VideoShowcase } from '@/components/sections/VideoShowcase';
import { Themes } from '@/components/sections/Themes';
import { tokens } from '@/lib/design-tokens';
import { getThemeAssetsByStyleKey } from '@/lib/theme-assets';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button } from '@/components/ui/Button';

const INTRO_SEEN_KEY = 'ameliea-intro-seen';

/** Query parametresine göre "plan gerekli" mesajını gösterir; useSearchParams Suspense içinde kullanılmalı. */
function PurchaseMessageBanner() {
  const searchParams = useSearchParams();
  const { lang } = useI18n();
  const show = searchParams?.get('message') === 'purchase_required';
  if (!show) return null;
  return (
    <div
      className="px-4 py-3 text-center text-sm font-medium"
      style={{ backgroundColor: 'rgba(200, 162, 74, 0.15)', color: 'var(--ink-base)' }}
    >
      {lang === 'tr'
        ? 'Yönetim paneline erişmek için önce bir plan seçmeniz gerekiyor.'
        : 'You need to choose a plan first to access the dashboard.'}
      {' '}
      <button
        type="button"
        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
        className="underline font-semibold"
      >
        {lang === 'tr' ? 'Fiyatlandırmaya git' : 'Go to pricing'}
      </button>
    </div>
  );
}

export default function Home() {
  const [showIntro, setShowIntro] = useState(false); // Start with false, check in useEffect
  const router = useRouter();
  const { lang } = useI18n();

  useEffect(() => {
    // Landing animasyonu şimdilik devre dışı
    setShowIntro(false);
    sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
  }, []);

  // Handle hash navigation (scroll to section when hash is present in URL)
  useEffect(() => {
    if (!showIntro && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        // Remove # from hash
        const sectionId = hash.substring(1);
        // Wait a bit for page to render
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    }
  }, [showIntro]);

  const handleIntroComplete = () => {
    setShowIntro(false);
    // Mark intro as seen for this session (only for normal navigation, not hard refresh)
    sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
  };

  return (
    <>
      {showIntro && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}
      {!showIntro && (
        <>
          <Header />
          <Suspense fallback={null}>
            <PurchaseMessageBanner />
          </Suspense>
          <main>
            <div id="hero">
              <Hero />
            </div>
            <Journey />
            <Themes />
            <VideoShowcase videoUrl={getThemeAssetsByStyleKey('style_2')?.videoUrl} />
            <Features />
            <DashboardPreview />
            <Pricing />
            <LoveNotes />
            <ForPlanners />
            <FAQ />
            {/* Final CTA Section */}
            <section className="py-20 px-4" style={{ background: 'var(--bg-secondary)' }}>
              <div className="max-w-4xl mx-auto text-center">
                <motion.h2
                  className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8"
                  style={{
                    fontFamily: tokens.typography.fontFamily.serif.join(', '),
                    color: tokens.colors.text.primary,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {lang === 'tr' 
                    ? 'Düğününüzün ilk izlenimini oluşturmaya hazır mısınız?'
                    : 'Ready to create your wedding\'s first impression?'}
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex gap-4 justify-center"
                >
                  <Button
                    variant="primary"
                    onClick={() => router.push('/checkout')}
                    className="text-xl px-10 py-5"
                  >
                    {lang === 'tr' ? 'Satın Al' : 'Buy Now'}
                  </Button>
                </motion.div>
              </div>
            </section>
          </main>
          <ContactInfo />
          <Footer />
        </>
      )}
      {/* Background Music Player */}
      <MusicPlayer 
        musicUrl="/music/background-romantic.mp3"
        autoPlay={true}
        themeColor="var(--crimson-base)"
      />
    </>
  );
}
