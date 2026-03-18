'use client';

import { useEffect } from 'react';

/**
 * Catches errors in the root layout (e.g. layout.tsx throw).
 * Must define its own <html> and <body>; does not inherit root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="tr">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fbf7ef', color: '#1b1620', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Uygulama hatası</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>Kritik bir hata oluştu. Sayfayı yenileyerek tekrar deneyin.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              borderRadius: 9999,
              border: 'none',
              background: '#a12b3a',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Yenile
          </button>
        </div>
      </body>
    </html>
  );
}
