'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';
import type { Language } from '@/lib/i18n';
import { CountdownTimer } from '@/components/invitation/CountdownTimer';
import { ScheduleTimeline } from '@/components/invitation/ScheduleTimeline';
import { FAQ } from '@/components/invitation/FAQ';
import { EmojiPicker } from '@/components/ui/EmojiPicker';
import { BackButton } from '@/components/ui/BackButton';
import { ThemeId, THEMES } from '@/lib/themes';
import { getThemeIdFromTemplateId } from '@/lib/theme-assets';
import { getUserPlanType, type PlanType } from '@/lib/purchase';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { showToast } from '@/components/ui/Toast';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

function useGooglePlacesAutocomplete(
  inputRef: React.RefObject<HTMLInputElement | null>,
  onPlaceSelect: (place: { name: string; address: string }) => void
) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !inputRef.current) return;

    const scriptId = 'google-maps-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=tr`;
      script.async = true;
      script.defer = true;
      script.onload = () => initAutocomplete();
      document.head.appendChild(script);
    } else if (window.google?.maps?.places) {
      initAutocomplete();
    }

    function initAutocomplete() {
      if (!inputRef.current || !window.google?.maps?.places) return;
      if (autocompleteRef.current) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'tr' },
        fields: ['name', 'formatted_address'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place) {
          onPlaceSelect({
            name: place.name || '',
            address: place.formatted_address || '',
          });
        }
      });
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [inputRef, onPlaceSelect]);
}

interface ScheduleItem {
  time: string;
  event: string;
  description: string;
  icon?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface GuestQuestionItem {
  question: string;
}

interface FeatureSelection {
  enableVideo: boolean;
  enableMusic: boolean;
  enableTestimonials: boolean;
  enableContact: boolean;
  enableSchedule: boolean;
}

interface CustomizationData {
  templateId: string;
  coupleName: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;
  venuePhotos: string[]; // Max 3 images
  personalMessage: string;
  musicUrl: string;
  videoUrl: string;
  contactPhone: string;
  contactEmail: string;
  contactWhatsApp: string;
  scheduleItems: ScheduleItem[];
  features: FeatureSelection;
  themeId: ThemeId;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: 'serif' | 'sans';
  };
  faqs: FAQItem[];
  enableFAQs: boolean;
  guestQuestions: GuestQuestionItem[];
  enableGuestQuestions: boolean;
}

// Parse time string (HH:MM) to minutes for sorting
function parseTimeToMinutes(time: string): number {
  const parts = time.split(':');
  if (parts.length !== 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

// Sort schedule items by time
function sortScheduleItemsByTime(items: ScheduleItem[]): ScheduleItem[] {
  return [...items].sort((a, b) => {
    const timeA = parseTimeToMinutes(a.time);
    const timeB = parseTimeToMinutes(b.time);
    return timeA - timeB;
  });
}

export default function CustomizePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params?.templateId as string;
  const { lang } = useI18n();
  const [isRevising, setIsRevising] = useState(false);
  const [reviseSlug, setReviseSlug] = useState<string | null>(null);
  const [existingInvitationId, setExistingInvitationId] = useState<string | null>(null);
  const [showOpeningMessage, setShowOpeningMessage] = useState(true);
  const [userPlanType, setUserPlanType] = useState<PlanType>(null);
  const supabase = createSupabaseBrowserClient();

  const getEventIcon = (eventName: string): string => {
    const name = eventName.toLowerCase();
    if (name.includes('ceremony') || name.includes('tören') || name.includes('ceremonia')) {
      return '⛪';
    } else if (name.includes('cocktail') || name.includes('kokteyl') || name.includes('cóctel')) {
      return '🍷';
    } else if (name.includes('dinner') || name.includes('banquet') || name.includes('yemek') || name.includes('banquete')) {
      return '🍽️';
    } else if (name.includes('party') || name.includes('fiesta') || name.includes('dans') || name.includes('eğlence')) {
      return '🎵';
    } else if (name.includes('arrival') || name.includes('llegada') || name.includes('geliş') || name.includes('karşılama')) {
      return '💝';
    } else if (name.includes('end') || name.includes('fin') || name.includes('bitiş') || name.includes('despedida')) {
      return '🎉';
    } else if (name.includes('reception') || name.includes('resepsiyon')) {
      return '🍾';
    }
    return '⏰'; // Default icon
  };

  const getInitialScheduleItems = (currentLang: Language) => {
    return currentLang === 'tr' 
      ? [
          { time: '16:00', event: 'Tören', description: 'Düğün töreni başlıyor', icon: '⛪' },
          { time: '17:00', event: 'Kokteyl Saati', description: 'İçecekler ve atıştırmalıklar', icon: '🍷' },
          { time: '18:30', event: 'Resepsiyon', description: 'Yemek ve kutlama', icon: '🍽️' },
          { time: '23:00', event: 'Dans', description: 'Eğlence devam ediyor', icon: '🎵' },
        ]
      : [
          { time: '16:00', event: 'Ceremony', description: 'Wedding ceremony begins', icon: '⛪' },
          { time: '17:00', event: 'Cocktail Hour', description: 'Drinks and appetizers', icon: '🍷' },
          { time: '18:30', event: 'Reception', description: 'Dinner and celebration', icon: '🍽️' },
          { time: '23:00', event: 'Dancing', description: 'Party continues', icon: '🎵' },
        ];
  };

  const [formData, setFormData] = useState<CustomizationData>({
    templateId: templateId || 'template-1',
    coupleName: '',
    groomName: '',
    brideName: '',
    weddingDate: '',
    weddingTime: '16:00',
    venueName: '',
    venueAddress: '',
    venueMapUrl: '',
    venuePhotos: [],
    personalMessage: lang === 'tr' ? 'Bu davetiye sadece senin için' : 'This invitation is exclusive for you',
    musicUrl: '',
    videoUrl: '',
    contactPhone: '',
    contactEmail: '',
    contactWhatsApp: '',
    scheduleItems: getInitialScheduleItems(lang),
    features: {
      enableVideo: false,
      enableMusic: false,
      enableTestimonials: false, // Will be set based on plan type
      enableContact: false,
      enableSchedule: true,
    },
    themeId: getThemeIdFromTemplateId(templateId || 'style_2'),
    theme: (() => {
      const id = getThemeIdFromTemplateId(templateId || 'style_2');
      const th = THEMES[id];
      return {
        primaryColor: th.colors.primary,
        secondaryColor: th.colors.secondary,
        fontFamily: th.fonts.heading as 'serif' | 'sans',
      };
    })(),
    faqs: [],
    enableFAQs: false,
    guestQuestions: [{ question: '' }], // Default 1 soru
    enableGuestQuestions: false,
  });

  // Update form data when language changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      personalMessage: lang === 'tr' ? 'Bu davetiye sadece senin için' : 'This invitation is exclusive for you',
      scheduleItems: getInitialScheduleItems(lang),
    }));
  }, [lang]);

  const [saving, setSaving] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [previewLink, setPreviewLink] = useState<string | null>(null);

  const venueInputRef = useRef<HTMLInputElement>(null);
  const handlePlaceSelect = useCallback((place: { name: string; address: string }) => {
    setFormData(prev => ({
      ...prev,
      venueName: place.name || prev.venueName,
      venueAddress: place.address || prev.venueAddress,
    }));
  }, []);
  useGooglePlacesAutocomplete(venueInputRef, handlePlaceSelect);

  // LocalStorage key for draft
  const DRAFT_STORAGE_KEY = `invitation-draft-${templateId}`;

  // Load draft from localStorage on mount (only if not revising)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const reviseParam = urlParams.get('revise');
      
      // If revising, don't load draft - load from API instead
      if (reviseParam) {
        setIsRevising(true);
        setReviseSlug(reviseParam);
        // Load existing invitation data
        fetch(`/api/invitations/${reviseParam}`)
          .then(res => res.json())
          .then(data => {
            if (data.id) {
              setExistingInvitationId(data.id);
              // Parse date and time
              const dateTime = data.weddingDate ? new Date(data.weddingDate) : null;
              const dateStr = dateTime ? dateTime.toISOString().split('T')[0] : '';
              const timeStr = dateTime ? dateTime.toTimeString().slice(0, 5) : '16:00';
              
              // Parse host names
              const hostNames = data.host_names || data.coupleName || '';
              const [brideName, groomName] = hostNames.includes('&') 
                ? hostNames.split('&').map((n: string) => n.trim())
                : ['', ''];

              setFormData(prev => ({
                ...prev,
                brideName: brideName || prev.brideName,
                groomName: groomName || prev.groomName,
                coupleName: hostNames || prev.coupleName,
                weddingDate: dateStr || prev.weddingDate,
                weddingTime: timeStr || prev.weddingTime,
                venueName: data.venueName || prev.venueName,
                venueAddress: data.venueAddress || prev.venueAddress,
                themeId: (data.theme_id || 'elegant') as ThemeId,
                theme: data.theme ? {
                  primaryColor: data.theme.primaryColor || prev.theme.primaryColor,
                  secondaryColor: data.theme.secondaryColor || prev.theme.secondaryColor,
                  fontFamily: data.theme.fontFamily || prev.theme.fontFamily,
                } : prev.theme,
              }));
            }
          })
          .catch(err => {
            logger.error('Error loading invitation for revision:', err);
            showToast(lang === 'tr' ? 'Davetiye yüklenirken hata oluştu' : 'Error loading invitation', 'error');
          });
        return; // Don't load draft if revising
      }

      // Load draft from localStorage
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft) as CustomizationData;
          // Merge with current formData to preserve defaults
          setFormData(prev => ({
            ...prev,
            ...draftData,
            templateId: templateId || 'template-1',
          }));
        }
        } catch (err) {
          logger.error('Error loading draft:', err);
        }
    }
  }, [templateId, lang, DRAFT_STORAGE_KEY]);

  // Save draft to localStorage whenever formData changes (debounced)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isRevising) {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
        } catch (err) {
          logger.error('Error saving draft:', err);
        }
      }, 500); // Debounce: save 500ms after last change

      return () => clearTimeout(timeoutId);
    }
  }, [formData, DRAFT_STORAGE_KEY, isRevising]);

  // Show opening message for 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOpeningMessage(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Get user's plan type
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        getUserPlanType(user.id).then(setUserPlanType);
      }
    });
  }, [supabase]);

  // Update form data when language changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      personalMessage: lang === 'tr' ? 'Bu davetiye sadece senin için' : 'This invitation is exclusive for you',
      scheduleItems: getInitialScheduleItems(lang),
    }));
  }, [lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let invitationId: string;
      let slug: string;

      if (isRevising && existingInvitationId && reviseSlug) {
        // Update existing invitation
        const updatePayload = {
          title: `${formData.brideName} & ${formData.groomName}`,
          host_names: `${formData.brideName} & ${formData.groomName}`,
          date_iso: formData.weddingDate ? `${formData.weddingDate}T${formData.weddingTime}:00` : null,
          location: formData.venueAddress || formData.venueName,
          language: lang,
          theme_id: formData.themeId,
        };
        const response = await fetch(`/api/invitations/${reviseSlug}/update`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });

        if (!response.ok) throw new Error('Failed to update invitation');

        const data = await response.json();
        invitationId = data.invitation.id;
        slug = reviseSlug;
        setCreatedSlug(slug);
        setPreviewLink(`${typeof window !== 'undefined' ? window.location.origin : ''}/invitation/${slug}`);
      } else {
        // Create new invitation
        const slugBase = `${formData.brideName.toLowerCase()}-${formData.groomName.toLowerCase()}`.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').substring(0, 50);
        const timestamp = Date.now().toString().slice(-6);
        slug = `${slugBase}-${timestamp}`;

        const invitationPayload = {
          slug,
          title: `${formData.brideName} & ${formData.groomName}`,
          host_names: `${formData.brideName} & ${formData.groomName}`,
          date_iso: formData.weddingDate ? `${formData.weddingDate}T${formData.weddingTime}:00` : null,
          location: formData.venueAddress || formData.venueName,
          language: lang,
          template_id: templateId,
          theme_id: formData.themeId,
          is_published: true,
          require_token: false,
          auto_generate_tokens: 0,
          custom_data: {
            venueName: formData.venueName,
            venueAddress: formData.venueAddress,
            venueMapUrl: formData.venueMapUrl,
            venuePhotos: formData.venuePhotos,
            personalMessage: formData.personalMessage,
            musicUrl: formData.musicUrl,
            videoUrl: formData.videoUrl,
            contactPhone: formData.contactPhone,
            contactEmail: formData.contactEmail,
            contactWhatsApp: formData.contactWhatsApp,
            scheduleItems: formData.scheduleItems,
            features: formData.features,
            faqs: formData.faqs,
            enableFAQs: formData.enableFAQs,
            themeColors: {
              primaryColor: formData.theme.primaryColor,
              secondaryColor: formData.theme.secondaryColor,
              fontFamily: formData.theme.fontFamily,
            },
          },
        };
        const response = await fetch('/api/invitations/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invitationPayload),
        });

        if (!response.ok) throw new Error('Failed to create invitation');

        const data = await response.json();
        invitationId = data.invitation.id;
        setCreatedSlug(data.invitation.slug);
        setPreviewLink(`${typeof window !== 'undefined' ? window.location.origin : ''}/invitation/${data.invitation.slug}`);
      }
      
      // Save guest questions if enabled
      if (formData.enableGuestQuestions && formData.guestQuestions && formData.guestQuestions.length > 0) {
        const questionsToSave = formData.guestQuestions
          .filter(q => q.question.trim() !== '')
          .map((q, index) => ({
            invitation_id: invitationId,
            question: q.question.trim(),
            order_index: index,
          }));

        if (questionsToSave.length > 0) {
          const questionsResponse = await fetch('/api/invitations/guest-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invitation_id: invitationId, questions: questionsToSave }),
          });

          if (!questionsResponse.ok) {
            logger.error('Failed to save guest questions');
          }
        }
      }
      
      // Clear draft after successful creation
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      
      // Show success message
      showToast(
        lang === 'tr' ? 'Davetiye oluşturuldu! Ön izleme linki hazır.' : 'Invitation created! Preview link is ready.',
        'success'
      );
    } catch (error) {
      logger.error('Error creating invitation:', error);
      showToast(
        lang === 'tr' ? 'Davetiye oluşturulurken hata oluştu. Lütfen tekrar deneyin.' : 'Error creating invitation. Please try again.',
        'error'
      );
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  // Show opening message overlay
  if (showOpeningMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="text-center px-4"
        >
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
            }}
          >
            {lang === 'tr' 
              ? 'Her detayı sizin hikayenizden ilham aldığını unutma'
              : 'Remember that every detail is inspired by your story'}
          </h1>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4" style={{ background: 'var(--bg-primary)' }}>
      <BackButton href="/" themeColor={formData.theme.primaryColor} />
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold mb-8 text-center"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
            }}
          >
            {lang === 'tr' ? 'Davetiyenizi Özelleştirin' : 'Customize Your Invitation'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Couple Information */}
            <section className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'Çift Bilgileri' : 'Couple Information'}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Gelin Adı *' : 'Bride\'s Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brideName}
                    onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-base)',
                      minHeight: '44px',
                      fontSize: '16px',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Damat Adı *' : 'Groom\'s Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.groomName}
                    onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-base)',
                      minHeight: '44px',
                      fontSize: '16px',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                  />
                </div>
              </div>
            </section>

            {/* Wedding Details */}
            <section className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'Düğün Detayları' : 'Wedding Details'}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Düğün Tarihi *' : 'Wedding Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-base)',
                      minHeight: '44px',
                      fontSize: '16px',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Düğün Saati *' : 'Wedding Time *'}
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.weddingTime}
                    onChange={(e) => setFormData({ ...formData, weddingTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-base)',
                      minHeight: '44px',
                      fontSize: '16px',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                  />
                </div>
              </div>

              {/* Countdown Timer - Premium Only */}
              {userPlanType === 'premium' ? (
                formData.weddingDate && formData.weddingTime && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: tokens.colors.text.primary }}>
                        {lang === 'tr' ? 'Geri Sayım Sayacı' : 'Countdown Timer'}
                      </h3>
                      <span className="text-sm px-2 py-1 rounded-full" style={{ 
                        backgroundColor: 'rgba(200, 162, 74, 0.1)',
                        color: 'var(--gold-base)',
                      }}>
                        ⭐ {lang === 'tr' ? 'Premium' : 'Premium'}
                      </span>
                    </div>
                    <CountdownTimer 
                      key={`${formData.weddingDate}-${formData.weddingTime}`}
                      weddingDate={formData.weddingDate} 
                      weddingTime={formData.weddingTime} 
                      themeColor={formData.theme.primaryColor}
                    />
                  </div>
                )
              ) : userPlanType === 'light' && formData.weddingDate && formData.weddingTime && (
                <div className="mt-6 p-4 rounded-xl opacity-60" style={{ backgroundColor: 'var(--bg-panel)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold" style={{ color: tokens.colors.text.primary }}>
                      {lang === 'tr' ? 'Geri Sayım Sayacı' : 'Countdown Timer'}
                    </h3>
                    <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ 
                      backgroundColor: 'rgba(200, 162, 74, 0.1)',
                      color: 'var(--gold-base)',
                    }}>
                      ⭐ {lang === 'tr' ? 'Premium Özellik' : 'Premium Feature'}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' 
                      ? 'Bu özellik Premium plana özeldir. Yükseltmek için Premium planı seçin.'
                      : 'This feature is exclusive to Premium plan. Upgrade to Premium to unlock.'}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Mekan Adı *' : 'Venue Name *'}
                  </label>
                  <input
                    ref={venueInputRef}
                    type="text"
                    required
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-base)',
                      minHeight: '44px',
                      fontSize: '16px',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                    placeholder={lang === 'tr' ? 'Mekan adını yazın...' : 'Type venue name...'}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Mekan Adresi *' : 'Venue Address *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-base)',
                      minHeight: '44px',
                      fontSize: '16px',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                  />
                </div>
              </div>

              {/* Google Maps Preview */}
              {formData.venueAddress && (
                <div className="mt-6 space-y-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.venueAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: formData.theme.primaryColor,
                      color: 'white',
                    }}
                  >
                    {lang === 'tr' ? '📍 Haritada Aç' : '📍 Open in Maps'}
                  </a>
                  <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden border-2" style={{ borderColor: formData.theme.primaryColor }}>
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.venueAddress)}&z=15&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={formData.venueName || 'Venue Location'}
                    />
                  </div>
                </div>
              )}

            </section>

            {/* Personal Message */}
            <section className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'Kişisel Mesaj' : 'Personal Message'}
              </h2>
              
              <textarea
                rows={3}
                maxLength={300}
                value={formData.personalMessage}
                onChange={(e) => setFormData({ ...formData, personalMessage: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors resize-none text-base"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: 'var(--border-base)',
                  minHeight: '100px',
                  fontSize: '16px',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                placeholder={lang === 'tr' ? 'Bu davetiye sadece senin için' : 'This invitation is exclusive for you'}
              />
              <p className="text-xs text-right mt-1" style={{ color: formData.personalMessage.length >= 280 ? 'var(--crimson-base)' : tokens.colors.text.muted }}>
                {formData.personalMessage.length}/300
              </p>
            </section>


            {/* Contact Information */}
            <section className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'İletişim Bilgileri' : 'Contact Information'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Telefon' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-base)',
                      minHeight: '44px',
                      fontSize: '16px',
                    }}
                    placeholder="+90 555 123 4567"
                    onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-base)',
                      minHeight: '44px',
                      fontSize: '16px',
                    }}
                    placeholder="contact@example.com"
                    onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.contactWhatsApp}
                    onChange={(e) => setFormData({ ...formData, contactWhatsApp: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-base)',
                      minHeight: '44px',
                      fontSize: '16px',
                    }}
                    placeholder="+90 555 123 4567"
                    onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                  />
                </div>
              </div>
            </section>

            {/* Schedule Items */}
            {/* Timeline Preview - Outside section, no background */}
            {formData.scheduleItems.some(item => item.time && item.event) && (
              <div className="mb-8">
                <ScheduleTimeline scheduleItems={formData.scheduleItems} />
              </div>
            )}
            
            {/* Schedule Items Form - Inside section with background */}
            <section className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'Program Detayları' : 'Schedule Details'}
              </h2>
              
              <div className="space-y-4">
                {formData.scheduleItems.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start flex-wrap md:flex-nowrap">
                    <input
                      type="time"
                      value={item.time}
                      onChange={(e) => {
                        const newItems = [...formData.scheduleItems];
                        newItems[index].time = e.target.value;
                        setFormData({ ...formData, scheduleItems: newItems });
                      }}
                      onBlur={() => {
                        const sortedItems = sortScheduleItemsByTime(formData.scheduleItems);
                        setFormData({ ...formData, scheduleItems: sortedItems });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const sortedItems = sortScheduleItemsByTime(formData.scheduleItems);
                          setFormData({ ...formData, scheduleItems: sortedItems });
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      className="px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                      style={{
                        backgroundColor: 'var(--bg-panel)',
                        borderColor: 'var(--border-base)',
                        minHeight: '44px',
                        fontSize: '16px',
                        width: '120px',
                        flexShrink: 0,
                      }}
                    />
                    <EmojiPicker
                      currentEmoji={item.icon || getEventIcon(item.event)}
                      onSelect={(emoji) => {
                        const newItems = [...formData.scheduleItems];
                        newItems[index].icon = emoji;
                        setFormData({ ...formData, scheduleItems: newItems });
                      }}
                      themeColor={formData.theme.primaryColor}
                    />
                    <input
                      type="text"
                      value={item.event}
                      onChange={(e) => {
                        const newItems = [...formData.scheduleItems];
                        newItems[index].event = e.target.value;
                        setFormData({ ...formData, scheduleItems: newItems });
                      }}
                      className="flex-1 px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                      style={{
                        backgroundColor: 'var(--bg-panel)',
                        borderColor: 'var(--border-base)',
                        minHeight: '44px',
                        fontSize: '16px',
                        minWidth: '100px',
                      }}
                      placeholder={lang === 'tr' ? 'Etkinlik adı' : 'Event name'}
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...formData.scheduleItems];
                        newItems[index].description = e.target.value;
                        setFormData({ ...formData, scheduleItems: newItems });
                      }}
                      className="flex-1 px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                      style={{
                        backgroundColor: 'var(--bg-panel)',
                        borderColor: 'var(--border-base)',
                        minHeight: '44px',
                        fontSize: '16px',
                        minWidth: '100px',
                      }}
                      placeholder={lang === 'tr' ? 'Açıklama' : 'Description'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = formData.scheduleItems.filter((_, i) => i !== index);
                        setFormData({ ...formData, scheduleItems: newItems });
                      }}
                      className="px-4 py-3 rounded-xl border transition-all min-h-[44px] flex-shrink-0"
                      style={{
                        backgroundColor: 'var(--bg-panel)',
                        borderColor: 'var(--border-base)',
                        color: tokens.colors.text.secondary,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        scheduleItems: [...formData.scheduleItems, { time: '12:00', event: '', description: '', icon: '⏰' }],
                      });
                    }}
                  className="w-full px-4 py-3 rounded-xl border transition-all min-h-[44px]"
                  style={{
                    backgroundColor: 'var(--bg-panel)',
                    borderColor: 'var(--border-base)',
                    color: tokens.colors.text.primary,
                  }}
                >
                  {lang === 'tr' ? '+ Program Öğesi Ekle' : '+ Add Schedule Item'}
                </button>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2" style={{ color: tokens.colors.text.primary }}>
                    {lang === 'tr' ? 'Sıkça Sorulan Sorular' : 'Frequently Asked Questions'}
                  </h2>
                  <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' 
                      ? 'Davetiyenize FAQ bölümü ekleyin'
                      : 'Add FAQ section to your invitation'}
                  </p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableFAQs}
                    onChange={(e) => {
                      const enabling = e.target.checked;
                      const defaultFAQs = lang === 'tr'
                        ? [
                            { question: 'Hediye yerine ne getirebilirim?', answer: 'Varlığınız bizim için en güzel hediye! Yine de düşünürseniz, küçük bir katkı hesabımıza yapılabilir.' },
                            { question: 'Çocuklar katılabilir mi?', answer: 'Elbette! Çocuklarınızla birlikte gelmenizden mutluluk duyarız.' },
                            { question: 'Otopark var mı?', answer: 'Mekanın geniş bir otoparkı mevcuttur. Ücretsiz olarak kullanabilirsiniz.' },
                          ]
                        : [
                            { question: 'What should I bring instead of a gift?', answer: 'Your presence is the best gift! But if you wish, a small contribution to our account is welcome.' },
                            { question: 'Can children attend?', answer: 'Of course! We would be happy to have you with your children.' },
                            { question: 'Is there parking available?', answer: 'The venue has a large parking area. You can use it free of charge.' },
                          ];
                      setFormData({
                        ...formData,
                        enableFAQs: enabling,
                        faqs: enabling && (!formData.faqs || formData.faqs.length === 0) ? defaultFAQs : formData.faqs,
                      });
                    }}
                    className="w-5 h-5 rounded border-2 transition-all"
                    style={{
                      accentColor: formData.theme.primaryColor,
                      borderColor: formData.enableFAQs ? formData.theme.primaryColor : 'var(--border-base)',
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: tokens.colors.text.primary }}>
                    {lang === 'tr' ? 'FAQ Aktif' : 'Enable FAQ'}
                  </span>
                </label>
              </div>

              {formData.enableFAQs && (
                <>
                  {/* FAQ Preview */}
                  {formData.faqs?.length > 0 && formData.faqs.some(faq => faq.question && faq.answer) && (
                    <div className="mb-6">
                      <FAQ faqs={formData.faqs} />
                    </div>
                  )}

                  {/* FAQ Form */}
                  <div className="space-y-4">
                    {(formData.faqs || []).map((faq, index) => (
                      <div key={index} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-base)', backgroundColor: 'var(--bg-panel)' }}>
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                            {lang === 'tr' ? `Soru ${index + 1}` : `Question ${index + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newFAQs = (formData.faqs || []).filter((_, i) => i !== index);
                              setFormData({ ...formData, faqs: newFAQs });
                            }}
                            className="px-3 py-1 rounded-lg text-sm transition-all"
                            style={{
                              backgroundColor: 'var(--bg-panel-strong)',
                              color: tokens.colors.text.secondary,
                            }}
                          >
                            {lang === 'tr' ? 'Sil' : 'Delete'}
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const newFAQs = [...(formData.faqs || [])];
                              newFAQs[index].question = e.target.value;
                              setFormData({ ...formData, faqs: newFAQs });
                            }}
                            className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                            style={{
                              backgroundColor: 'var(--bg-panel-strong)',
                              borderColor: 'var(--border-base)',
                              minHeight: '44px',
                              fontSize: '16px',
                            }}
                            placeholder={lang === 'tr' ? 'Soru' : 'Question'}
                            onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                          />
                          <textarea
                            rows={2}
                            value={faq.answer}
                            onChange={(e) => {
                              const newFAQs = [...(formData.faqs || [])];
                              newFAQs[index].answer = e.target.value;
                              setFormData({ ...formData, faqs: newFAQs });
                            }}
                            className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors resize-none text-base"
                            style={{
                              backgroundColor: 'var(--bg-panel-strong)',
                              borderColor: 'var(--border-base)',
                              minHeight: '80px',
                              fontSize: '16px',
                            }}
                            placeholder={lang === 'tr' ? 'Cevap' : 'Answer'}
                            onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          faqs: [...(formData.faqs || []), { question: '', answer: '' }],
                        });
                      }}
                      className="w-full px-4 py-3 rounded-xl border transition-all min-h-[44px]"
                      style={{
                        backgroundColor: 'var(--bg-panel)',
                        borderColor: 'var(--border-base)',
                        color: tokens.colors.text.primary,
                      }}
                    >
                      {lang === 'tr' ? '+ Soru Ekle' : '+ Add Question'}
                    </button>
                  </div>
                </>
              )}
            </section>

            {/* Guest Questions Section - Premium Only */}
            {userPlanType === 'premium' ? (
            <section className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2" style={{ color: tokens.colors.text.primary }}>
                    {lang === 'tr' ? 'Misafir Soruları' : 'Guest Questions'}
                    <span className="ml-2 text-sm px-2 py-1 rounded-full" style={{ 
                      backgroundColor: 'rgba(200, 162, 74, 0.1)',
                      color: 'var(--gold-base)',
                    }}>
                      ⭐ {lang === 'tr' ? 'Premium' : 'Premium'}
                    </span>
                  </h2>
                  <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' 
                      ? 'Misafirlerinize soru sorun ve cevaplarını alın'
                      : 'Ask questions to your guests and get their answers'}
                  </p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableGuestQuestions}
                    onChange={(e) => setFormData({ ...formData, enableGuestQuestions: e.target.checked })}
                    className="w-5 h-5 rounded border-2 transition-all"
                    style={{
                      accentColor: formData.theme.primaryColor,
                      borderColor: formData.enableGuestQuestions ? formData.theme.primaryColor : 'var(--border-base)',
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: tokens.colors.text.primary }}>
                    {lang === 'tr' ? 'Aktif' : 'Enable'}
                  </span>
                </label>
              </div>

              {formData.enableGuestQuestions && (
                <div className="space-y-4">
                  {(formData.guestQuestions || []).map((guestQuestion, index) => (
                    <div key={index} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-base)', backgroundColor: 'var(--bg-panel)' }}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                          {lang === 'tr' ? `Soru ${index + 1}` : `Question ${index + 1}`}
                        </span>
                        {formData.guestQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newQuestions = (formData.guestQuestions || []).filter((_, i) => i !== index);
                              setFormData({ ...formData, guestQuestions: newQuestions });
                            }}
                            className="px-3 py-1 rounded-lg text-sm transition-all"
                            style={{
                              backgroundColor: 'var(--bg-panel-strong)',
                              color: tokens.colors.text.secondary,
                            }}
                          >
                            {lang === 'tr' ? 'Sil' : 'Delete'}
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={guestQuestion.question}
                        onChange={(e) => {
                          const newQuestions = [...(formData.guestQuestions || [])];
                          newQuestions[index].question = e.target.value;
                          setFormData({ ...formData, guestQuestions: newQuestions });
                        }}
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                        style={{
                          backgroundColor: 'var(--bg-panel-strong)',
                          borderColor: 'var(--border-base)',
                          minHeight: '44px',
                          fontSize: '16px',
                        }}
                        placeholder={lang === 'tr' ? 'Misafirlerinize soracağınız soru' : 'Question for your guests'}
                        onFocus={(e) => { e.currentTarget.style.borderColor = formData.theme.primaryColor; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                      />
                    </div>
                  ))}
                  {formData.guestQuestions.length < 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.guestQuestions.length < 3) {
                          setFormData({
                            ...formData,
                            guestQuestions: [...(formData.guestQuestions || []), { question: '' }],
                          });
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl border transition-all min-h-[44px]"
                      style={{
                        backgroundColor: 'var(--bg-panel)',
                        borderColor: 'var(--border-base)',
                        color: tokens.colors.text.primary,
                      }}
                    >
                      {lang === 'tr' ? '+ Soru Ekle' : '+ Add Question'}
                    </button>
                  )}
                  {formData.guestQuestions.length >= 3 && (
                    <p className="text-sm text-center" style={{ color: tokens.colors.text.secondary }}>
                      {lang === 'tr' 
                        ? 'Maksimum 3 soru ekleyebilirsiniz'
                        : 'Maximum 3 questions allowed'}
                    </p>
                  )}
                </div>
              )}
            </section>
            ) : userPlanType === 'light' && (
            <section className="p-6 rounded-xl opacity-60" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2" style={{ color: tokens.colors.text.primary }}>
                    {lang === 'tr' ? 'Misafir Soruları' : 'Guest Questions'}
                  </h2>
                  <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Premium özellik' : 'Premium feature'}
                  </p>
                </div>
              </div>
            </section>
            )}

            {userPlanType === 'light' && (
            <section className="p-6 rounded-xl opacity-60" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2" style={{ color: tokens.colors.text.primary }}>
                    {lang === 'tr' ? 'Misafir Soruları' : 'Guest Questions'}
                  </h2>
                  <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' 
                      ? 'Misafirlerinize soru sorun ve cevaplarını alın'
                      : 'Ask questions to your guests and get their answers'}
                  </p>
                </div>
                <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ 
                  backgroundColor: 'rgba(200, 162, 74, 0.1)',
                  color: 'var(--gold-base)',
                }}>
                  ⭐ {lang === 'tr' ? 'Premium Özellik' : 'Premium Feature'}
                </span>
              </div>
              <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' 
                  ? 'Bu özellik Premium plana özeldir. Yükseltmek için Premium planı seçin.'
                  : 'This feature is exclusive to Premium plan. Upgrade to Premium to unlock.'}
              </p>
            </section>
            )}

            {/* Preview Link Section - Show after creation */}
            {previewLink && (
              <section className="p-6 rounded-xl border-2" style={{ backgroundColor: 'var(--bg-panel-strong)', borderColor: formData.theme.primaryColor }}>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? '🎉 Davetiye Ön İzleme Linki' : '🎉 Invitation Preview Link'}
                </h2>
                <p className="text-sm mb-4" style={{ color: tokens.colors.text.secondary }}>
                  {lang === 'tr' 
                    ? 'Bu linki davetlilerinizle paylaşabilirsiniz. Davetliler bu linke tıklayarak davetiyenizi görüntüleyebilir ve RSVP yapabilirler.'
                    : 'You can share this link with your guests. Guests can click this link to view your invitation and submit RSVP.'}
                </p>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    readOnly
                    value={previewLink}
                    className="flex-1 px-4 py-3 rounded-xl border text-sm"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-base)',
                      color: tokens.colors.text.primary,
                    }}
                    id="preview-link-input"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!previewLink) return;
                      try {
                        await navigator.clipboard.writeText(previewLink);
                        showToast(lang === 'tr' ? 'Link kopyalandı!' : 'Link copied!', 'success');
                      } catch {
                        const input = document.getElementById('preview-link-input') as HTMLInputElement;
                        if (input) {
                          input.select();
                          document.execCommand('copy');
                          showToast(lang === 'tr' ? 'Link kopyalandı!' : 'Link copied!', 'success');
                        }
                      }
                    }}
                    className="px-4 py-3 rounded-full transition-all"
                    style={{
                      backgroundColor: formData.theme.primaryColor,
                      color: 'white',
                    }}
                  >
                    {lang === 'tr' ? '🔗 Linki Kopyala' : '🔗 Copy link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(previewLink, '_blank')}
                    className="px-4 py-3 rounded-full border transition-all"
                    style={{
                      backgroundColor: 'var(--bg-panel-strong)',
                      borderColor: formData.theme.primaryColor,
                      color: formData.theme.primaryColor,
                    }}
                  >
                    {lang === 'tr' ? 'Ön İzle' : 'Preview'}
                  </button>
                </div>
                <p className="text-xs mb-4" style={{ color: tokens.colors.text.muted }}>
                  {lang === 'tr'
                    ? 'Linki kopyalayıp WhatsApp, SMS veya e-posta ile gönderebilirsiniz. Yönetim panelinden de paylaşım yapabilirsiniz.'
                    : 'Copy the link and send via WhatsApp, SMS or email. You can also share from the dashboard.'}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => router.push(`/invitation/${createdSlug}`)}
                    className="flex-1 px-4 py-3 rounded-full font-semibold transition-all"
                    style={{
                      backgroundColor: formData.theme.primaryColor,
                      color: 'white',
                    }}
                  >
                    {lang === 'tr' ? 'Davetiye Sayfasına Git' : 'Go to Invitation Page'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/invitation/${createdSlug}/dashboard`)}
                    className="flex-1 px-4 py-3 rounded-full border font-semibold transition-all"
                    style={{
                      backgroundColor: 'var(--bg-panel-strong)',
                      borderColor: formData.theme.primaryColor,
                      color: formData.theme.primaryColor,
                    }}
                  >
                    {lang === 'tr' ? '📤 Yönetim Paneli (Paylaş)' : '📤 Dashboard (Share)'}
                  </button>
                </div>
              </section>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  // Draft is already saved automatically via useEffect
                  router.back();
                }}
                className="flex-1 px-6 py-4 rounded-full border transition-all min-h-[44px]"
                style={{
                  backgroundColor: 'var(--bg-panel-strong)',
                  borderColor: 'var(--border-base)',
                  color: tokens.colors.text.primary,
                }}
              >
                {lang === 'tr' ? 'Geri (Taslak Kaydedildi)' : 'Back (Draft Saved)'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-4 rounded-full font-semibold text-lg transition-all min-h-[44px]"
                style={{
                  backgroundColor: saving ? 'var(--text-muted)' : formData.theme.primaryColor,
                  color: 'white',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving 
                  ? (lang === 'tr' ? 'Oluşturuluyor...' : 'Creating...')
                  : (lang === 'tr' ? '💳 Satın Al ve Oluştur' : '💳 Purchase & Create')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

