'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';
import { showToast } from '@/components/ui/Toast';
import { logger } from '@/lib/logger';

interface InvitationData {
  id: string;
  slug: string;
  rsvpDeadline?: string;
  scheduleItems?: Array<{ time: string; event: string; description: string; icon?: string }>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

interface InvitationRSVPProps {
  invitationData: InvitationData;
}

interface GuestQuestion {
  id: string;
  question: string;
  order_index: number;
}

export function InvitationRSVP({ invitationData }: InvitationRSVPProps) {
  const { t, lang } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    attending: true,
    guests: 1,
    foodPreference: '' as string,
    dietaryRestrictions: '',
    message: '',
    selectedEvents: [] as string[],
    guestAnswers: {} as Record<string, string>,
    needsTransportation: false,
    needsAccommodation: false,
  });
  const [guestQuestions, setGuestQuestions] = useState<GuestQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/invitations/${invitationData.slug}/guest-questions`);
        if (response.ok) {
          const data = await response.json();
          setGuestQuestions(data.questions || []);
        }
      } catch (error) {
        console.error('Error fetching guest questions:', error);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [invitationData.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    try {
      const rsvpResponse = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: invitationData.slug,
          full_name: formData.name,
          phone: formData.phone,
          attendance: formData.attending ? 'yes' : 'no',
          guests_count: formData.guests,
          note: [
            formData.foodPreference ? `${lang === 'tr' ? 'Yemek' : 'Food'}: ${formData.foodPreference}` : '',
            formData.dietaryRestrictions ? `${lang === 'tr' ? 'Diyet' : 'Dietary'}: ${formData.dietaryRestrictions}` : '',
            formData.needsTransportation ? (lang === 'tr' ? 'Ulaşım gerekiyor' : 'Transportation needed') : '',
            formData.needsAccommodation ? (lang === 'tr' ? 'Konaklama gerekiyor' : 'Accommodation needed') : '',
            formData.message || '',
          ].filter(Boolean).join('\n').trim() || undefined,
          selected_events: formData.selectedEvents.length > 0 ? formData.selectedEvents : undefined,
        }),
      });

      if (!rsvpResponse.ok) {
        const data = await rsvpResponse.json().catch(() => ({}));
        if (data.error === 'VALIDATION_ERROR' && data.details?.fieldErrors && typeof data.details.fieldErrors === 'object') {
          setFieldErrors(data.details.fieldErrors as Record<string, string[]>);
          showToast(
            lang === 'tr' ? 'Lütfen formdaki hataları düzeltin.' : 'Please fix the errors in the form.',
            'error'
          );
          return;
        }
        const msg = data.message || data.error || (lang === 'tr' ? 'RSVP gönderilemedi.' : 'Failed to submit RSVP.');
        showToast(msg, 'error');
        return;
      }

      const rsvpData = await rsvpResponse.json();
      const rsvpId = rsvpData.rsvp?.id;

      if (rsvpId && guestQuestions.length > 0 && Object.keys(formData.guestAnswers).length > 0) {
        const answers = guestQuestions
          .filter(q => formData.guestAnswers[q.id]?.trim())
          .map(q => ({
            question_id: q.id,
            answer: formData.guestAnswers[q.id].trim(),
          }));

        if (answers.length > 0) {
          await fetch(`/api/invitations/${invitationData.slug}/guest-answers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rsvp_id: rsvpId,
              answers,
            }),
          });
        }
      }

      setSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        attending: true,
        guests: 1,
        foodPreference: '',
        dietaryRestrictions: '',
        message: '',
        selectedEvents: [],
        guestAnswers: {},
        needsTransportation: false,
        needsAccommodation: false,
      });
    } catch (error) {
      logger.error('Error submitting RSVP:', error);
      showToast(
        lang === 'tr' ? 'RSVP gönderilirken hata oluştu. Lütfen tekrar deneyin.' : 'Error submitting RSVP. Please try again.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: invitationData.theme.primaryColor,
                color: 'white',
                fontSize: '2.5rem',
              }}
            >
              ✓
            </div>
            <h2
              className="text-4xl font-bold mb-4"
              style={{
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                color: tokens.colors.text.primary,
              }}
            >
              {t('invitation_rsvp_thanks')}
            </h2>
            <p
              className="text-xl mb-6"
              style={{
                color: tokens.colors.text.secondary,
              }}
            >
              {t('invitation_rsvp_received')}
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 rounded-full transition-all"
              style={{
                backgroundColor: invitationData.theme.primaryColor,
                color: 'white',
              }}
            >
              {t('invitation_rsvp_another')}
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="rsvp" 
      className="py-20 px-4"
      style={{
        background: 'linear-gradient(180deg, var(--bg-secondary), var(--bg-primary))',
      }}
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-6"
              style={{
                backgroundColor: `${invitationData.theme.primaryColor}15`,
                color: invitationData.theme.primaryColor,
                border: `1px solid ${invitationData.theme.primaryColor}30`,
              }}
            >
              RSVP
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold mb-3"
              style={{
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                color: tokens.colors.text.primary,
              }}
            >
              {lang === 'tr' ? 'Katılım' : 'RSVP'}
            </h2>
            <p
              className="text-lg mb-2"
              style={{
                color: tokens.colors.text.secondary,
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                fontStyle: 'italic',
              }}
            >
              {t('invitation_rsvp_we_hope')}
            </p>
            {invitationData.rsvpDeadline && (
              <p
                className="text-sm"
                style={{ color: tokens.colors.text.muted }}
              >
                {t('invitation_rsvp_deadline')} {new Date(invitationData.rsvpDeadline).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}
              </p>
            )}
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Name */}
          <div>
            <label htmlFor="rsvp-name" className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
              {t('invitation_rsvp_name')} *
            </label>
            <input
              id="rsvp-name"
              type="text"
              inputMode="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                borderColor: fieldErrors.full_name ? 'var(--crimson-base)' : 'var(--border-base)',
                minHeight: '44px',
                fontSize: '16px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = invitationData.theme.primaryColor; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = fieldErrors.full_name ? 'var(--crimson-base)' : 'var(--border-base)'; }}
              aria-invalid={!!fieldErrors.full_name}
              aria-describedby={fieldErrors.full_name ? 'rsvp-name-error' : undefined}
            />
            {fieldErrors.full_name?.length ? (
              <p id="rsvp-name-error" className="mt-1 text-sm" style={{ color: 'var(--crimson-base)' }} role="alert">
                {fieldErrors.full_name[0]}
              </p>
            ) : null}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="rsvp-phone" className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Telefon' : 'Phone'}
            </label>
            <input
              id="rsvp-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                borderColor: fieldErrors.phone ? 'var(--crimson-base)' : 'var(--border-base)',
                minHeight: '44px',
                fontSize: '16px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = invitationData.theme.primaryColor; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = fieldErrors.phone ? 'var(--crimson-base)' : 'var(--border-base)'; }}
              placeholder={lang === 'tr' ? '+90 555 123 4567' : '+1 555 123 4567'}
              aria-invalid={!!fieldErrors.phone}
              aria-describedby={fieldErrors.phone ? 'rsvp-phone-error' : undefined}
            />
            {fieldErrors.phone?.length ? (
              <p id="rsvp-phone-error" className="mt-1 text-sm" style={{ color: 'var(--crimson-base)' }} role="alert">
                {fieldErrors.phone[0]}
              </p>
            ) : null}
          </div>

          {/* Attending */}
          <div>
            <label className="block mb-3 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
              {t('invitation_rsvp_attending')} *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attending: true })}
                className="flex-1 px-4 py-3 rounded-xl border transition-all text-base min-h-[44px]"
                style={{
                  backgroundColor: formData.attending ? invitationData.theme.primaryColor : 'var(--bg-panel-strong)',
                  borderColor: formData.attending ? invitationData.theme.primaryColor : 'var(--border-base)',
                  color: formData.attending ? 'white' : tokens.colors.text.primary,
                }}
              >
                {t('invitation_rsvp_yes')}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attending: false })}
                className="flex-1 px-4 py-3 rounded-xl border transition-all text-base min-h-[44px]"
                style={{
                  backgroundColor: !formData.attending ? invitationData.theme.secondaryColor : 'var(--bg-panel-strong)',
                  borderColor: !formData.attending ? invitationData.theme.secondaryColor : 'var(--border-base)',
                  color: !formData.attending ? 'white' : tokens.colors.text.primary,
                }}
              >
                {t('invitation_rsvp_no')}
              </button>
            </div>
          </div>

          {/* Guests - +/- counter */}
          {formData.attending && (
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                {t('invitation_rsvp_guests')} *
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg-panel-strong)',
                    border: `2px solid ${invitationData.theme.primaryColor}40`,
                    color: invitationData.theme.primaryColor,
                  }}
                  aria-label={lang === 'tr' ? 'Misafir azalt' : 'Decrease guests'}
                >
                  −
                </button>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                  style={{
                    backgroundColor: `${invitationData.theme.primaryColor}10`,
                    border: `2px solid ${invitationData.theme.primaryColor}30`,
                    color: tokens.colors.text.primary,
                    fontFamily: tokens.typography.fontFamily.serif.join(', '),
                  }}
                >
                  {formData.guests}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, guests: Math.min(10, formData.guests + 1) })}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: invitationData.theme.primaryColor,
                    color: 'white',
                  }}
                  aria-label={lang === 'tr' ? 'Misafir arttır' : 'Increase guests'}
                >
                  +
                </button>
              </div>
              {fieldErrors.guests_count?.length ? (
                <p className="mt-2 text-sm text-center" style={{ color: 'var(--crimson-base)' }} role="alert">
                  {fieldErrors.guests_count[0]}
                </p>
              ) : null}
            </div>
          )}

          {/* Food Preference */}
          {formData.attending && (
            <div>
              <label className="block mb-3 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                {t('invitation_rsvp_food_preference')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'vegetarian', label: t('invitation_rsvp_food_veg') },
                  { value: 'non-vegetarian', label: t('invitation_rsvp_food_nonveg') },
                  { value: 'vegan', label: t('invitation_rsvp_food_vegan') },
                  { value: '', label: t('invitation_rsvp_food_none') },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, foodPreference: option.value })}
                    className="px-4 py-3 rounded-xl border text-sm font-medium transition-all min-h-[44px]"
                    style={{
                      backgroundColor: formData.foodPreference === option.value
                        ? `${invitationData.theme.primaryColor}15`
                        : 'var(--bg-panel-strong)',
                      borderColor: formData.foodPreference === option.value
                        ? invitationData.theme.primaryColor
                        : 'var(--border-base)',
                      color: formData.foodPreference === option.value
                        ? invitationData.theme.primaryColor
                        : tokens.colors.text.primary,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Event Selection */}
          {formData.attending && invitationData.scheduleItems && invitationData.scheduleItems.length > 0 && (
            <div>
              <label className="block mb-3 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Hangi etkinliklere katılacaksınız?' : 'Which events will you attend?'}
              </label>
              <div className="space-y-2">
                {invitationData.scheduleItems.map((item, index) => (
                  <label
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                    style={{
                      backgroundColor: formData.selectedEvents.includes(item.event) 
                        ? `${invitationData.theme.primaryColor}15` 
                        : 'var(--bg-panel-strong)',
                      borderColor: formData.selectedEvents.includes(item.event)
                        ? invitationData.theme.primaryColor
                        : 'var(--border-base)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedEvents.includes(item.event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            selectedEvents: [...formData.selectedEvents, item.event],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            selectedEvents: formData.selectedEvents.filter(ev => ev !== item.event),
                          });
                        }
                      }}
                      className="mt-1 w-5 h-5 rounded border-2"
                      style={{
                        accentColor: invitationData.theme.primaryColor,
                        borderColor: formData.selectedEvents.includes(item.event)
                          ? invitationData.theme.primaryColor
                          : 'var(--border-base)',
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {item.icon && <span className="text-lg">{item.icon}</span>}
                        <span className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>
                          {item.time} - {item.event}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs" style={{ color: tokens.colors.text.secondary }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Restrictions */}
          {formData.attending && (
            <div>
              <label htmlFor="rsvp-dietary" className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                {t('invitation_rsvp_dietary')}
              </label>
              <textarea
                id="rsvp-dietary"
                inputMode="text"
                rows={3}
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors resize-none text-base"
                style={{
                  backgroundColor: 'var(--bg-panel-strong)',
                  borderColor: 'var(--border-base)',
                  minHeight: '80px',
                  fontSize: '16px',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = invitationData.theme.primaryColor; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                placeholder={lang === 'tr' ? 'Lütfen diyet kısıtlamaları veya alerjiler hakkında bilgi verin' : 'Please let us know about any dietary restrictions or allergies'}
              />
            </div>
          )}

          {/* Additional Services */}
          {formData.attending && (
            <div>
              <label className="block mb-3 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                {t('invitation_rsvp_additional_services')}
              </label>
              <div className="space-y-3">
                <label
                  className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                  style={{
                    backgroundColor: formData.needsTransportation
                      ? `${invitationData.theme.primaryColor}10`
                      : 'var(--bg-panel-strong)',
                    borderColor: formData.needsTransportation
                      ? invitationData.theme.primaryColor
                      : 'var(--border-base)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.needsTransportation}
                    onChange={(e) => setFormData({ ...formData, needsTransportation: e.target.checked })}
                    className="w-5 h-5 rounded"
                    style={{ accentColor: invitationData.theme.primaryColor }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚗</span>
                    <span className="text-sm font-medium" style={{ color: tokens.colors.text.primary }}>
                      {t('invitation_rsvp_transportation')}
                    </span>
                  </div>
                </label>
                <label
                  className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                  style={{
                    backgroundColor: formData.needsAccommodation
                      ? `${invitationData.theme.primaryColor}10`
                      : 'var(--bg-panel-strong)',
                    borderColor: formData.needsAccommodation
                      ? invitationData.theme.primaryColor
                      : 'var(--border-base)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.needsAccommodation}
                    onChange={(e) => setFormData({ ...formData, needsAccommodation: e.target.checked })}
                    className="w-5 h-5 rounded"
                    style={{ accentColor: invitationData.theme.primaryColor }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏨</span>
                    <span className="text-sm font-medium" style={{ color: tokens.colors.text.primary }}>
                      {t('invitation_rsvp_accommodation')}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label htmlFor="rsvp-message" className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
              {t('invitation_rsvp_message')}
            </label>
            <textarea
              id="rsvp-message"
              inputMode="text"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors resize-none text-base"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                borderColor: 'var(--border-base)',
                minHeight: '100px',
                fontSize: '16px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = invitationData.theme.primaryColor; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
              placeholder={lang === 'tr' ? 'Sizden haber almak isteriz' : 'We would love to hear from you'}
            />
          </div>

          {/* Guest Questions — only shown if wedding owner added questions */}
          {!loadingQuestions && guestQuestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border-base)' }}>
              <h3
                className="text-xl font-semibold mb-4"
                style={{
                  fontFamily: tokens.typography.fontFamily.serif.join(', '),
                  color: tokens.colors.text.primary,
                }}
              >
                {lang === 'tr' ? 'Sorular' : 'Questions'}
              </h3>
              {guestQuestions.map((question) => (
                <div key={question.id}>
                  <label
                    htmlFor={`guest-question-${question.id}`}
                    className="block mb-2 text-sm font-medium"
                    style={{ color: tokens.colors.text.secondary }}
                  >
                    {question.question} *
                  </label>
                  <textarea
                    id={`guest-question-${question.id}`}
                    required
                    rows={3}
                    value={formData.guestAnswers[question.id] || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        guestAnswers: {
                          ...formData.guestAnswers,
                          [question.id]: e.target.value,
                        },
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors resize-none text-base"
                    style={{
                      backgroundColor: 'var(--bg-panel-strong)',
                      borderColor: 'var(--border-base)',
                      minHeight: '80px',
                      fontSize: '16px',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = invitationData.theme.primaryColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
                    placeholder={lang === 'tr' ? 'Cevabınızı buraya yazın...' : 'Type your answer here...'}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-4 rounded-full font-semibold text-lg transition-all min-h-[44px]"
            style={{
              backgroundColor: submitting ? 'var(--text-muted)' : invitationData.theme.primaryColor,
              color: 'white',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? t('invitation_rsvp_submitting') : t('invitation_rsvp_submit')}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
