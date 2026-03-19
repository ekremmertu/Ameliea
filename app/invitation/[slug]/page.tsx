'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InvitationHero } from '@/components/invitation/InvitationHero';
import { InvitationDetails } from '@/components/invitation/InvitationDetails';
import { InvitationRSVP } from '@/components/invitation/InvitationRSVP';
import { InvitationFooter } from '@/components/invitation/InvitationFooter';
import { InvitationVideo } from '@/components/invitation/InvitationVideo';
import { InvitationContact } from '@/components/invitation/InvitationContact';
import { InvitationTestimonials } from '@/components/invitation/InvitationTestimonials';
import { CountdownTimer } from '@/components/invitation/CountdownTimer';
import { EventCards } from '@/components/invitation/EventCards';
import { ScheduleTimeline } from '@/components/invitation/ScheduleTimeline';
import { useI18n } from '@/components/providers/I18nProvider';
import { MusicPlayer } from '@/components/ui/MusicPlayer';
import { BackButton } from '@/components/ui/BackButton';
import { GuestOpeningFlow } from '@/components/invitation/GuestOpeningFlow';
import { ThemeId } from '@/lib/themes';

interface InvitationData {
  id: string;
  slug: string;
  coupleName: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  venueMapUrl?: string;
  personalMessage?: string;
  rsvpDeadline?: string;
  musicUrl?: string;
  videoUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsApp?: string;
  dressCode?: string;
  scheduleItems?: Array<{ time: string; event: string; description: string; icon?: string }>;
  features?: {
    enableVideo?: boolean;
    enableMusic?: boolean;
    enableTestimonials?: boolean;
    enableContact?: boolean;
    enableSchedule?: boolean;
    enableCountdown?: boolean;
    enableEventCards?: boolean;
    enableDressCode?: boolean;
    enableFoodPreference?: boolean;
    enableAdditionalServices?: boolean;
  };
  themeId?: ThemeId;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  isOwner?: boolean;
}

export default function InvitationPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { lang } = useI18n();
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${slug}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Invitation not found');
        }
        const rawDate = data.weddingDate || data.date_iso || '';
        const coupleName = data.coupleName || data.host_names || data.title || '';
        const nameParts = coupleName.split(/\s*[&]\s*/);

        let weddingTime = data.weddingTime || '';
        if (!weddingTime && rawDate && rawDate.includes('T')) {
          try {
            const d = new Date(rawDate);
            weddingTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          } catch { /* keep empty */ }
        }

        setInvitationData({
          id: data.id,
          slug: data.slug,
          coupleName,
          groomName: data.groomName || (nameParts.length === 2 ? nameParts[1].trim() : ''),
          brideName: data.brideName || (nameParts.length === 2 ? nameParts[0].trim() : ''),
          weddingDate: rawDate,
          weddingTime,
          venueName: data.venueName || data.location,
          venueAddress: data.venueAddress || data.location,
          venueMapUrl: data.venueMapUrl,
          personalMessage: data.personalMessage,
          rsvpDeadline: data.rsvpDeadline,
          musicUrl: data.musicUrl,
          videoUrl: data.videoUrl,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          contactWhatsApp: data.contactWhatsApp,
          dressCode: data.dressCode,
          scheduleItems: (data.scheduleItems && data.scheduleItems.length > 0) ? data.scheduleItems : undefined,
          features: data.features || {},
          themeId: data.theme_id || 'elegant',
          theme: data.theme || {
            primaryColor: '#c8a24a',
            secondaryColor: '#a12b3a',
            fontFamily: 'serif',
          },
          isOwner: !!data.isOwner,
        });
      } catch (error) {
        console.error('Error fetching invitation:', error);
        setInvitationData(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchInvitation();
    } else {
      setLoading(false);
      setInvitationData(null);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--crimson-base)' }}></div>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {lang === 'tr' ? 'Davetiye yükleniyor...' : 'Loading invitation...'}
          </p>
        </div>
      </div>
    );
  }

  if (!invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">{lang === 'tr' ? 'Davetiye Bulunamadı' : 'Invitation Not Found'}</h1>
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
            {lang === 'tr' ? 'Bu davetiye bulunamadı.' : 'This invitation could not be found.'}
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            {lang === 'tr' ? 'Test için:' : 'For testing:'}
          </p>
          <Link
            href="/invitation/test-guest"
            className="inline-block px-6 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--crimson-base)' }}
          >
            /invitation/test-guest
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      '--invitation-primary': invitationData.theme.primaryColor,
      '--invitation-secondary': invitationData.theme.secondaryColor,
    } as React.CSSProperties}>
      <main className="min-h-screen">
        <BackButton href="/" themeColor={invitationData.theme.primaryColor} />

        {/* 1. Video + Info — Kaydırılabilir tek bölüm */}
        <GuestOpeningFlow
          data={{
            coupleName: invitationData.coupleName,
            groomName: invitationData.groomName,
            brideName: invitationData.brideName,
            weddingDate: invitationData.weddingDate,
            weddingTime: invitationData.weddingTime,
            venueName: invitationData.venueName,
            venueAddress: invitationData.venueAddress,
            personalMessage: invitationData.personalMessage,
            themeId: invitationData.themeId,
            theme: invitationData.theme,
          }}
        />

        {/* 2. Hero — Çift isimleri, tarih, saat */}
        <InvitationHero invitationData={invitationData} />

        {/* 3. Countdown */}
        {invitationData.features?.enableCountdown !== false && invitationData.weddingDate && (
          <section className="py-12 px-4">
            <div className="max-w-3xl mx-auto">
              <CountdownTimer
                weddingDate={invitationData.weddingDate.includes('T') ? invitationData.weddingDate.split('T')[0] : invitationData.weddingDate}
                weddingTime={invitationData.weddingTime || '14:00'}
                themeColor={invitationData.theme.primaryColor}
              />
            </div>
          </section>
        )}

        {/* 4. Program Timeline (çizgi akış) + Event Cards (kutular) */}
        {invitationData.features?.enableEventCards !== false && invitationData.scheduleItems && invitationData.scheduleItems.length > 0 && (
          <>
            <section className="py-12 px-4">
              <div className="max-w-4xl mx-auto">
                <ScheduleTimeline scheduleItems={invitationData.scheduleItems} />
              </div>
            </section>
            <EventCards
              scheduleItems={invitationData.scheduleItems}
              weddingDate={invitationData.weddingDate}
              venueName={invitationData.venueName}
              venueAddress={invitationData.venueAddress}
              theme={invitationData.theme}
            />
          </>
        )}

        {/* 5. Details — Mekan, harita, fotoğraflar, dress code */}
        <InvitationDetails invitationData={invitationData} />

        {/* 6. Video */}
        {invitationData.features?.enableVideo !== false && invitationData.videoUrl && (
          <InvitationVideo videoUrl={invitationData.videoUrl} themeColor={invitationData.theme.primaryColor} />
        )}

        {/* 7. RSVP */}
        <InvitationRSVP
          invitationData={{
            ...invitationData,
            scheduleItems: invitationData.scheduleItems,
          }}
        />

        {/* 8. Testimonials — Ayrı bölüm olarak (RSVP formunun içinde değil) */}
        {invitationData.features?.enableTestimonials !== false && (
          <InvitationTestimonials 
            invitationSlug={invitationData.slug} 
            themeColor={invitationData.theme.primaryColor}
          />
        )}

        {/* 9. Contact */}
        {invitationData.features?.enableContact !== false && (invitationData.contactPhone || invitationData.contactEmail || invitationData.contactWhatsApp) && (
          <InvitationContact
            contactPhone={invitationData.contactPhone}
            contactEmail={invitationData.contactEmail}
            contactWhatsApp={invitationData.contactWhatsApp}
            themeColor={invitationData.theme.primaryColor}
          />
        )}

        {/* 10. Footer */}
        <InvitationFooter invitationData={invitationData} />

        {/* Dashboard link for owner */}
        {invitationData.isOwner && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
          >
            <a
              href={`/invitation/${invitationData.slug}/dashboard`}
              className="px-4 py-2 rounded-full font-medium text-sm shadow-lg transition-all hover:scale-105 flex items-center gap-2 border-2"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                color: invitationData.theme.primaryColor,
                borderColor: invitationData.theme.primaryColor,
              }}
            >
              <span>📊</span>
              <span>{lang === 'tr' ? 'Yönetim paneline git' : 'Go to dashboard'}</span>
            </a>
          </motion.div>
        )}

        {/* Music Player */}
        {invitationData.features?.enableMusic !== false && invitationData.musicUrl && (
          <MusicPlayer 
            musicUrl={invitationData.musicUrl}
            autoPlay={true}
            themeColor={invitationData.theme.primaryColor}
          />
        )}
      </main>
    </div>
  );
}
