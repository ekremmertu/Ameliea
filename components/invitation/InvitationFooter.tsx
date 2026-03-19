'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

interface InvitationData {
  coupleName: string;
  groomName?: string;
  brideName?: string;
  weddingDate: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

interface InvitationFooterProps {
  invitationData: InvitationData;
}

function formatFooterDate(lang: string, dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function InvitationFooter({ invitationData }: InvitationFooterProps) {
  const { t, lang } = useI18n();

  const displayName = invitationData.brideName && invitationData.groomName
    ? `${invitationData.brideName} & ${invitationData.groomName}`
    : invitationData.coupleName;

  return (
    <footer
      className="relative overflow-hidden"
      style={{ backgroundColor: invitationData.theme.primaryColor }}
    >
      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z"
            fill={invitationData.theme.primaryColor}
          />
        </svg>
      </div>

      <div className="relative z-10 py-16 md:py-20 px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-white/50" />
            <div className="h-px w-12 bg-white/30" />
          </div>

          {/* Couple names */}
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{
              fontFamily: tokens.typography.fontFamily.brand.join(', '),
              color: 'rgba(255,255,255,0.95)',
              lineHeight: 1.2,
            }}
          >
            {displayName}
          </h2>

          {/* Date */}
          <p
            className="text-lg md:text-xl mb-8"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: 'rgba(255,255,255,0.8)',
              letterSpacing: '0.05em',
            }}
          >
            {formatFooterDate(lang, invitationData.weddingDate)}
          </p>

          {/* Love message */}
          <p
            className="text-base md:text-lg mb-10"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: 'rgba(255,255,255,0.7)',
              fontStyle: 'italic',
            }}
          >
            {t('invitation_footer_with_love')}
          </p>

          {/* Divider */}
          <div className="h-px w-20 mx-auto mb-6 bg-white/20" />

          {/* Powered by */}
          <p
            className="text-xs"
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontFamily: tokens.typography.fontFamily.brand.join(', '),
            }}
          >
            {t('invitation_footer_powered')} Ameliea
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
