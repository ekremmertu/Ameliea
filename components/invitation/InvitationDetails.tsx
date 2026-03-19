'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

interface InvitationData {
  venueName: string;
  venueAddress: string;
  venueMapUrl?: string;
  weddingDate: string;
  weddingTime: string;
  dressCode?: string;
  features?: Record<string, boolean | undefined>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

interface InvitationDetailsProps {
  invitationData: InvitationData;
}

function buildMapEmbedUrl(venueMapUrl?: string, venueAddress?: string): string | null {
  if (venueMapUrl) {
    const coordMatch = venueMapUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    }
    const placeMatch = venueMapUrl.match(/place\/([^/@]+)/);
    if (placeMatch) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeMatch[1].replace(/\+/g, ' '))}&z=15&output=embed`;
    }
  }

  if (venueAddress) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(venueAddress)}&z=15&output=embed`;
  }

  return null;
}

function buildMapLinkUrl(venueMapUrl?: string, venueAddress?: string): string {
  if (venueMapUrl) return venueMapUrl;
  if (venueAddress) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`;
  return '#';
}

export function InvitationDetails({ invitationData }: InvitationDetailsProps) {
  const { t } = useI18n();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  const mapEmbedUrl = buildMapEmbedUrl(invitationData.venueMapUrl, invitationData.venueAddress);
  const mapLinkUrl = buildMapLinkUrl(invitationData.venueMapUrl, invitationData.venueAddress);

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Venue Section */}
          <motion.div
            className="text-center mb-16"
            variants={itemVariants}
          >
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                color: tokens.colors.text.primary,
              }}
            >
              {t('invitation_venue')}
            </h2>
            <div
              className="inline-block px-6 py-4 rounded-xl mb-6"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                border: `2px solid ${invitationData.theme.primaryColor}`,
              }}
            >
              <p
                className="text-2xl md:text-3xl font-semibold mb-2"
                style={{
                  fontFamily: tokens.typography.fontFamily.serif.join(', '),
                  color: tokens.colors.text.primary,
                }}
              >
                {invitationData.venueName}
              </p>
              <p
                className="text-lg md:text-xl"
                style={{
                  color: tokens.colors.text.secondary,
                  fontFamily: tokens.typography.fontFamily.sans.join(', '),
                }}
              >
                {invitationData.venueAddress}
              </p>
            </div>

            {/* Map */}
            {(invitationData.venueAddress || invitationData.venueMapUrl) && (
              <div className="mt-8">
                <motion.a
                  href={mapLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mb-4 px-6 py-3 rounded-full transition-all"
                  style={{
                    backgroundColor: invitationData.theme.primaryColor,
                    color: 'white',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('invitation_view_map')}
                </motion.a>
                {mapEmbedUrl && (
                  <div
                    className="w-full h-64 md:h-96 rounded-xl overflow-hidden border-2"
                    style={{ borderColor: invitationData.theme.primaryColor }}
                  >
                    <iframe
                      src={mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={invitationData.venueName}
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Dress Code - only show if explicitly enabled or dressCode text provided */}
          {(invitationData.features?.enableDressCode || invitationData.dressCode) && (
            <motion.div
              className="text-center"
              variants={itemVariants}
            >
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{
                  fontFamily: tokens.typography.fontFamily.serif.join(', '),
                  color: tokens.colors.text.primary,
                }}
              >
                {t('invitation_dress_code')}
              </h2>
              <p
                className="text-xl md:text-2xl"
                style={{
                  color: tokens.colors.text.secondary,
                  fontFamily: tokens.typography.fontFamily.serif.join(', '),
                  fontStyle: 'italic',
                }}
              >
                {invitationData.dressCode || t('invitation_formal_attire')}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
