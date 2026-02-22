'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

interface InvitationData {
  coupleName: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

interface InvitationHeroProps {
  invitationData: InvitationData;
}

export function InvitationHero({ invitationData }: InvitationHeroProps) {
  const { t, lang } = useI18n();
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <section 
      className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--bg-primary), var(--bg-secondary))',
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-10"
          style={{ background: invitationData.theme.primaryColor }}
        />
        <div
          className="absolute bottom-20 right-10 w-40 h-40 rounded-full opacity-10"
          style={{ background: invitationData.theme.secondaryColor }}
        />
      </div>

      <motion.div
        className="max-w-4xl mx-auto text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Kicker */}
        <motion.p
          className="mb-4 text-lg md:text-xl"
          variants={itemVariants}
          style={{ 
            color: tokens.colors.text.secondary,
            fontFamily: tokens.typography.fontFamily.serif.join(', '),
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: '0.9rem',
          }}
        >
          {t('invitation_cordially_invited')}
        </motion.p>

        {/* Couple Names */}
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          variants={itemVariants}
          style={{
            fontFamily: tokens.typography.fontFamily.serif.join(', '),
            color: tokens.colors.text.primary,
            background: `linear-gradient(135deg, ${invitationData.theme.primaryColor}, ${invitationData.theme.secondaryColor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {invitationData.brideName}
          <br />
          <span className="text-4xl md:text-6xl lg:text-7xl">&</span>
          <br />
          {invitationData.groomName}
        </motion.h1>

        {/* Divider */}
        <motion.div
          className="flex items-center justify-center gap-4 my-8"
          variants={itemVariants}
        >
          <div 
            className="h-px flex-1 max-w-20"
            style={{ background: invitationData.theme.primaryColor }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: invitationData.theme.primaryColor }}
          />
          <div 
            className="h-px flex-1 max-w-20"
            style={{ background: invitationData.theme.primaryColor }}
          />
        </motion.div>

        {/* Date */}
        <motion.div
          className="mb-4"
          variants={itemVariants}
        >
          <p
            className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-2"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
            }}
          >
            {formatDate(invitationData.weddingDate)}
          </p>
          <p
            className="text-xl md:text-2xl"
            style={{
              color: tokens.colors.text.secondary,
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
            }}
          >
            {invitationData.weddingTime}
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16"
          variants={itemVariants}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm" style={{ color: tokens.colors.text.muted }}>
              {t('invitation_scroll_details')}
            </p>
            <div
              className="w-px h-8"
              style={{ background: invitationData.theme.primaryColor }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

