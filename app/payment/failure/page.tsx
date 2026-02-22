'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useI18n();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-8">
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl mb-6"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            >
              ✕
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                color: tokens.colors.text.primary,
              }}
            >
              {lang === 'tr' ? 'Ödeme Başarısız' : 'Payment Failed'}
            </h1>
            <p className="text-xl mb-4" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr'
                ? 'Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.'
                : 'Payment could not be completed. Please try again.'}
            </p>
            {error && (
              <p className="text-sm mb-8 p-4 rounded-lg" style={{ 
                backgroundColor: 'var(--bg-panel-strong)',
                color: tokens.colors.text.secondary,
              }}>
                {error}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Button
              variant="primary"
              onClick={() => router.push('/checkout')}
              className="w-full text-lg px-8 py-4"
            >
              {lang === 'tr' ? 'Tekrar Dene' : 'Try Again'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/')}
              className="w-full"
            >
              {lang === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}
            </Button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--crimson-base)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}

