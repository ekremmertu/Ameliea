'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';
import { I18nKey } from '@/lib/i18n';
import { ImageSlider } from '@/components/ui/ImageSlider';
import { env } from '@/lib/env';

interface ScheduleItem {
  time: string;
  event: string;
  description: string;
}

interface InvitationData {
  venueName: string;
  venueAddress: string;
  venueMapUrl?: string;
  venuePhotos?: string[];
  weddingDate: string;
  weddingTime: string;
  scheduleItems?: ScheduleItem[];
  features?: {
    enableSchedule?: boolean;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

interface InvitationDetailsProps {
  invitationData: InvitationData;
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

            {/* Venue Photos Slider */}
            {invitationData.venuePhotos && invitationData.venuePhotos.length > 0 && (
              <div className="mt-8">
                <ImageSlider images={invitationData.venuePhotos} themeColor={invitationData.theme.primaryColor} />
              </div>
            )}

            {/* Map */}
            {invitationData.venueAddress && (
              <div className="mt-8">
                <motion.a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitationData.venueAddress)}`}
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
                <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden border-2" style={{ borderColor: invitationData.theme.primaryColor }}>
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(invitationData.venueAddress)}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={invitationData.venueName}
                    onError={(e) => {
                      // Silently handle missing API key or 403 errors
                      const iframe = e.currentTarget;
                      iframe.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Timeline Section */}
          {(!invitationData.features || invitationData.features.enableSchedule !== false) && (
            <motion.div
              className="mb-16"
              variants={itemVariants}
            >
              <h2
                className="text-4xl md:text-5xl font-bold mb-8 text-center"
                style={{
                  fontFamily: tokens.typography.fontFamily.serif.join(', '),
                  color: tokens.colors.text.primary,
                }}
              >
                {t('invitation_schedule')}
              </h2>
              <div className="space-y-6">
                {(invitationData.scheduleItems && invitationData.scheduleItems.length > 0
                  ? invitationData.scheduleItems
                  : [
                      { time: '16:00', event: 'Ceremony', description: 'Wedding ceremony begins' },
                      { time: '17:00', event: 'Cocktail Hour', description: 'Drinks and appetizers' },
                      { time: '18:30', event: 'Reception', description: 'Dinner and celebration' },
                      { time: '23:00', event: 'Dancing', description: 'Party continues' },
                    ]
                ).map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-6 p-6 rounded-xl"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="flex-shrink-0 w-20 text-center"
                      style={{
                        color: invitationData.theme.primaryColor,
                        fontFamily: tokens.typography.fontFamily.serif.join(', '),
                        fontSize: '1.5rem',
                        fontWeight: 600,
                      }}
                    >
                      {item.time}
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-xl font-semibold mb-1"
                        style={{
                          fontFamily: tokens.typography.fontFamily.serif.join(', '),
                          color: tokens.colors.text.primary,
                        }}
                      >
                        {'eventKey' in item ? t(item.eventKey as I18nKey) : item.event}
                      </h3>
                      <p
                        className="text-base"
                        style={{
                          color: tokens.colors.text.secondary,
                          fontFamily: tokens.typography.fontFamily.sans.join(', '),
                        }}
                      >
                        {'descKey' in item ? t(item.descKey as I18nKey) : item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Dress Code */}
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
              {t('invitation_formal_attire')}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

