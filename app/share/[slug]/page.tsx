'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';
import { BackButton } from '@/components/ui/BackButton';
import { showToast } from '@/components/ui/Toast';

interface InvitationPreview {
  slug: string;
  coupleName: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  templateId?: string;
}

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { t, lang } = useI18n();
  const [invitationData, setInvitationData] = useState<InvitationPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setInvitationData({
            slug: data.slug,
            coupleName: data.coupleName || `${data.brideName} & ${data.groomName}`,
            brideName: data.brideName,
            groomName: data.groomName,
            weddingDate: data.weddingDate,
            theme: data.theme,
            templateId: data.templateId,
          });
        }
      } catch (error) {
        console.error('Error fetching invitation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchInvitation();
    }
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleViewInvitation = () => {
    router.push(`/invitation/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--crimson-base)' }}></div>
      </div>
    );
  }

  if (!invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{lang === 'tr' ? 'Davetiye Bulunamadı' : 'Invitation Not Found'}</h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `linear-gradient(135deg, ${invitationData.theme.primaryColor}15, ${invitationData.theme.secondaryColor}15)`,
      }}
    >
      <BackButton href="/" themeColor={invitationData.theme.primaryColor} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        {/* Preview Card */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backgroundColor: 'var(--bg-panel-strong)',
            border: `3px solid ${invitationData.theme.primaryColor}`,
          }}
        >
          {/* Header with gradient */}
          <div
            className="p-12 text-center"
            style={{
              background: `linear-gradient(135deg, ${invitationData.theme.primaryColor}, ${invitationData.theme.secondaryColor})`,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-6xl mb-4">💍</div>
              <h1
                className="text-4xl md:text-5xl font-bold mb-4 text-white"
                style={{
                  fontFamily: tokens.typography.fontFamily.serif.join(', '),
                }}
              >
                {invitationData.coupleName}
              </h1>
              <p
                className="text-xl text-white opacity-90"
                style={{
                  fontFamily: tokens.typography.fontFamily.serif.join(', '),
                }}
              >
                {formatDate(invitationData.weddingDate)}
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-8"
            >
              <p className="text-lg mb-6" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr'
                  ? 'Sizleri özel günümüzde aramızda görmekten mutluluk duyarız'
                  : 'We would be delighted to have you join us on our special day'}
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={handleViewInvitation}
              className="w-full px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-lg"
              style={{
                backgroundColor: invitationData.theme.primaryColor,
                color: 'white',
              }}
            >
              {lang === 'tr' ? 'Davetiyeyi Görüntüle' : 'View Invitation'}
            </motion.button>

            {/* Share Buttons */}
            <div className="mt-6 flex gap-4 justify-center">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={() => {
                  const url = `${window.location.origin}/invitation/${slug}`;
                  if (navigator.share) {
                    navigator.share({
                      title: `${invitationData.coupleName} - ${lang === 'tr' ? 'Düğün Davetiyesi' : 'Wedding Invitation'}`,
                      text: `${lang === 'tr' ? 'Düğün davetiyemizi görüntüleyin' : 'View our wedding invitation'}`,
                      url: url,
                    });
                  } else {
                    navigator.clipboard.writeText(url);
                    showToast(lang === 'tr' ? 'Link kopyalandı!' : 'Link copied!', 'success');
                  }
                }}
                className="px-4 py-2 rounded-full border transition-all"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: 'var(--border-base)',
                  color: tokens.colors.text.primary,
                }}
              >
                {lang === 'tr' ? '📤 Paylaş' : '📤 Share'}
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={() => {
                  const url = `${window.location.origin}/invitation/${slug}`;
                  navigator.clipboard.writeText(url);
                  showToast(lang === 'tr' ? 'Link kopyalandı!' : 'Link copied!', 'success');
                }}
                className="px-4 py-2 rounded-full border transition-all"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: 'var(--border-base)',
                  color: tokens.colors.text.primary,
                }}
              >
                {lang === 'tr' ? '🔗 Linki Kopyala' : '🔗 Copy Link'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6 text-sm"
          style={{
            color: tokens.colors.text.muted,
            fontFamily: tokens.typography.fontFamily.brand.join(', '),
          }}
        >
          Powered by Ameliea
        </motion.p>
      </motion.div>
    </div>
  );
}

