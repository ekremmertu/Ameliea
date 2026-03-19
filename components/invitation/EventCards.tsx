'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';
import { downloadICS, buildEventDate } from '@/lib/calendar';

interface ScheduleItem {
  time: string;
  event: string;
  description: string;
  icon?: string;
}

interface EventCardsProps {
  scheduleItems: ScheduleItem[];
  weddingDate: string;
  venueName?: string;
  venueAddress?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

function getEventIcon(eventName: string): string {
  const name = eventName.toLowerCase();
  if (name.includes('ceremony') || name.includes('tören') || name.includes('nikah')) return '💍';
  if (name.includes('cocktail') || name.includes('kokteyl')) return '🥂';
  if (name.includes('dinner') || name.includes('yemek') || name.includes('banquet')) return '🍽️';
  if (name.includes('party') || name.includes('dans') || name.includes('eğlence')) return '💃';
  if (name.includes('welcome') || name.includes('karşılama') || name.includes('hoş geldin')) return '🌟';
  if (name.includes('brunch') || name.includes('kahvaltı')) return '☕';
  if (name.includes('reception') || name.includes('resepsiyon')) return '🎊';
  return '✨';
}

function formatEventDate(lang: string, dateStr: string): string {
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

export function EventCards({ scheduleItems, weddingDate, venueName, venueAddress, theme }: EventCardsProps) {
  const { t, lang } = useI18n();

  if (!scheduleItems || scheduleItems.length === 0) return null;

  const handleAddToCalendar = (item: ScheduleItem) => {
    const startDate = buildEventDate(weddingDate, item.time);
    downloadICS({
      title: item.event,
      description: item.description,
      location: venueAddress || venueName,
      startDate,
    });
  };

  const handleViewOnMap = () => {
    const query = encodeURIComponent(venueAddress || venueName || '');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-6"
            style={{
              backgroundColor: `${theme.primaryColor}15`,
              color: theme.primaryColor,
              border: `1px solid ${theme.primaryColor}30`,
            }}
          >
            {t('invitation_celebrations')}
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
            }}
          >
            {t('invitation_schedule')}
          </h2>
          <p
            className="text-lg"
            style={{
              color: tokens.colors.text.secondary,
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              fontStyle: 'italic',
            }}
          >
            {t('invitation_celebrations_subtitle')}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {scheduleItems.map((item, index) => (
            <motion.div
              key={`${item.time}-${item.event}-${index}`}
              variants={cardVariants}
              className="relative rounded-2xl overflow-hidden group"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                border: '1px solid var(--border-base)',
                boxShadow: tokens.shadows.sm,
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: theme.primaryColor }}
              />

              <div className="p-6 md:p-8">
                {/* Date & icon header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{
                        backgroundColor: `${theme.primaryColor}15`,
                        border: `1.5px solid ${theme.primaryColor}40`,
                      }}
                    >
                      📅
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: theme.primaryColor }}
                    >
                      {formatEventDate(lang, weddingDate)}
                    </span>
                  </div>
                  <span className="text-2xl">{item.icon || getEventIcon(item.event)}</span>
                </div>

                {/* Event title */}
                <h3
                  className="text-xl md:text-2xl font-bold mb-3"
                  style={{
                    fontFamily: tokens.typography.fontFamily.serif.join(', '),
                    color: tokens.colors.text.primary,
                  }}
                >
                  {item.event}
                </h3>

                {/* Description */}
                {item.description && (
                  <p
                    className="text-sm md:text-base leading-relaxed mb-5"
                    style={{
                      color: tokens.colors.text.secondary,
                      fontFamily: tokens.typography.fontFamily.sans.join(', '),
                    }}
                  >
                    {item.description}
                  </p>
                )}

                {/* Time */}
                <div
                  className="flex items-center gap-2 mb-6 text-sm font-medium"
                  style={{ color: tokens.colors.text.primary }}
                >
                  <span style={{ color: tokens.colors.text.muted }}>{t('invitation_event_from')}</span>
                  <span className="font-semibold" style={{ color: theme.primaryColor }}>
                    {item.time}
                  </span>
                  <span style={{ color: tokens.colors.text.muted }}>{t('invitation_event_onwards')}</span>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {(venueAddress || venueName) && (
                    <button
                      type="button"
                      onClick={handleViewOnMap}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        backgroundColor: `${theme.primaryColor}10`,
                        color: theme.primaryColor,
                        border: `1.5px solid ${theme.primaryColor}30`,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {t('invitation_view_on_map')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleAddToCalendar(item)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: theme.primaryColor,
                      color: 'white',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <line x1="12" y1="14" x2="12" y2="18" />
                      <line x1="10" y1="16" x2="14" y2="16" />
                    </svg>
                    {t('invitation_add_to_calendar')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
