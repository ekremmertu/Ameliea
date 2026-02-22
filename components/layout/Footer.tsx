'use client';

import { useI18n } from '@/components/providers/I18nProvider';

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-8" style={{ borderColor: 'var(--border-base)' }}>
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ameliea), "Bad Script", cursive', fontSize: 'calc(1em + 4pt)' }}>
          © {year} {t('brand_name')}
        </span>
        <a
          href="#hero"
          className="text-sm transition-colors"
          style={{ color: 'inherit' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--crimson-base)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'inherit'; }}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {t('back_to_top')}
        </a>
      </div>
    </footer>
  );
}

