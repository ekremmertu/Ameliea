'use client';

import { motion } from 'framer-motion';
import { InvitationHero } from '@/components/invitation/InvitationHero';
import { InvitationDetails } from '@/components/invitation/InvitationDetails';
import { InvitationRSVP } from '@/components/invitation/InvitationRSVP';
import { InvitationFooter } from '@/components/invitation/InvitationFooter';
import { InvitationVideo } from '@/components/invitation/InvitationVideo';
import { InvitationContact } from '@/components/invitation/InvitationContact';
import { InvitationTestimonials } from '@/components/invitation/InvitationTestimonials';
import { useI18n } from '@/components/providers/I18nProvider';
import { BackButton } from '@/components/ui/BackButton';
import { GuestOpeningFlow } from '@/components/invitation/GuestOpeningFlow';
import type { ThemeId } from '@/lib/themes';

/** Mock davetiye verisi — sanki davetiye almış bir katılımcının gördüğü sayfa (test için) */
const MOCK_INVITATION = {
  id: 'test-invitation-id',
  slug: 'test-guest',
  coupleName: 'Ayşe & Mehmet',
  groomName: 'Mehmet',
  brideName: 'Ayşe',
  weddingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  weddingTime: '14:00',
  venueName: 'Gül Bahçesi Düğün Salonu',
  venueAddress: 'Örnek Mah. Düğün Sk. No:1, İstanbul',
  venueMapUrl: 'https://maps.google.com',
  venuePhotos: [],
  personalMessage: 'Sizleri aramızda görmek bizi çok mutlu edecek.',
  rsvpDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  musicUrl: undefined,
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  contactPhone: '+90 532 000 00 00',
  contactEmail: 'ornek@davetiye.com',
  contactWhatsApp: '+905320000000',
  scheduleItems: [
    { time: '14:00', event: 'Nikah', description: 'Nikah töreni' },
    { time: '16:00', event: 'Kokteyl', description: 'İkram ve sohbet' },
    { time: '19:00', event: 'Düğün', description: 'Yemek ve dans' },
  ],
  features: {
    enableVideo: true,
    enableMusic: false,
    enableTestimonials: true,
    enableContact: true,
    enableSchedule: true,
  },
  themeId: 'elegant' as ThemeId,
  theme: {
    primaryColor: '#c8a24a',
    secondaryColor: '#a12b3a',
    fontFamily: 'serif',
  },
};

export default function TestGuestPage() {
  const { lang } = useI18n();

  const invitationData = MOCK_INVITATION;

  return (
    <div
      style={{
        '--invitation-primary': invitationData.theme.primaryColor,
        '--invitation-secondary': invitationData.theme.secondaryColor,
      } as React.CSSProperties}
    >
      {/* Test modu etiketi */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-full text-xs font-semibold shadow-lg"
        style={{
          backgroundColor: 'var(--crimson-base)',
          color: 'white',
        }}
      >
        {lang === 'tr' ? '🧪 Test — Katılımcı görünümü' : '🧪 Test — Guest view'}
      </div>

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

      <main className="min-h-screen">
        <BackButton href="/" themeColor={invitationData.theme.primaryColor} />
        <InvitationHero invitationData={invitationData} />
          <InvitationDetails invitationData={invitationData} />
          {invitationData.features?.enableVideo !== false && invitationData.videoUrl && (
            <InvitationVideo
              videoUrl={invitationData.videoUrl}
              themeColor={invitationData.theme.primaryColor}
            />
          )}
          <InvitationRSVP
            invitationData={{
              ...invitationData,
              scheduleItems: invitationData.scheduleItems,
            }}
          />
          {invitationData.features?.enableTestimonials !== false && (
            <InvitationTestimonials
              invitationSlug={invitationData.slug}
              themeColor={invitationData.theme.primaryColor}
            />
          )}
          {invitationData.features?.enableContact !== false &&
            (invitationData.contactPhone ||
              invitationData.contactEmail ||
              invitationData.contactWhatsApp) && (
              <InvitationContact
                contactPhone={invitationData.contactPhone}
                contactEmail={invitationData.contactEmail}
                contactWhatsApp={invitationData.contactWhatsApp}
                themeColor={invitationData.theme.primaryColor}
              />
            )}
          <InvitationFooter invitationData={invitationData} />
        </main>
    </div>
  );
}
