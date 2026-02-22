'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

interface BackButtonProps {
  href?: string;
  themeColor?: string;
  position?: 'fixed' | 'relative';
}

export function BackButton({ href, themeColor, position = 'fixed' }: BackButtonProps) {
  const router = useRouter();
  const { lang } = useI18n();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (href) {
      // Use window.location for absolute navigation to avoid middleware redirects
      if (href.startsWith('/')) {
        window.location.href = href;
      } else {
        router.push(href);
      }
    } else {
      router.back();
    }
  };

  const positionClass = position === 'fixed' 
    ? 'fixed top-6 left-6 z-50' 
    : 'relative';

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={handleClick}
      type="button"
      className={`${positionClass} inline-flex items-center px-4 py-2 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-105 cursor-pointer`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: `2px solid ${themeColor || tokens.colors.crimson.base}`,
        color: themeColor || tokens.colors.crimson.base,
        zIndex: position === 'relative' ? 10 : 50,
      }}
      aria-label={lang === 'tr' ? 'Geri' : 'Back'}
    >
      ← {lang === 'tr' ? 'Geri' : 'Back'}
    </motion.button>
  );
}

