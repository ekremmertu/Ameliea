'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { tokens } from '@/lib/design-tokens';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-md w-full text-center">
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'var(--rose-light)',
            color: 'var(--crimson-base)',
          }}
        >
          <span className="text-4xl" aria-hidden>!</span>
        </div>
        <h1
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: tokens.typography.fontFamily.serif.join(', '), color: tokens.colors.text.primary }}
        >
          Bir şeyler yanlış gitti
        </h1>
        <p className="text-base mb-8" style={{ color: tokens.colors.text.secondary }}>
          Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={reset}>
            Tekrar dene
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/'}
          >
            Ana sayfaya dön
          </Button>
        </div>
      </div>
    </div>
  );
}
