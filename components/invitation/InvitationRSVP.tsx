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
    email: '',
    phone: '',
    attending: true,
    guests: 1,
    dietaryRestrictions: '',
    message: '',
    loveNote: '', // Message to the couple (bride and groom)
    selectedEvents: [] as string[], // Array of event names user wants to attend
    guestAnswers: {} as Record<string, string>, // question_id -> answer
  });
  const [guestQuestions, setGuestQuestions] = useState<GuestQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch guest questions
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

    try {
      // Submit RSVP first
      const rsvpResponse = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: invitationData.slug,
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          attendance: formData.attending ? 'yes' : 'no',
          guests_count: formData.guests,
          note: formData.message || formData.dietaryRestrictions ? `${formData.dietaryRestrictions ? `Diyet: ${formData.dietaryRestrictions}\n` : ''}${formData.message || ''}`.trim() : undefined,
          selected_events: formData.selectedEvents.length > 0 ? formData.selectedEvents : undefined,
        }),
      });

      if (!rsvpResponse.ok) throw new Error('Failed to submit RSVP');

      const rsvpData = await rsvpResponse.json();
      const rsvpId = rsvpData.rsvp?.id;

      // Submit guest answers if there are questions and answers
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

      // Submit love note if provided
      if (rsvpId && formData.loveNote && formData.loveNote.trim()) {
        await fetch(`/api/invitations/${invitationData.slug}/love-notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rsvp_id: rsvpId,
            guest_name: formData.name,
            guest_email: formData.email || undefined,
            message: formData.loveNote.trim(),
          }),
        });
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        attending: true,
        guests: 1,
        dietaryRestrictions: '',
        message: '',
        loveNote: '',
        selectedEvents: [],
        guestAnswers: {},
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
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                color: tokens.colors.text.primary,
              }}
            >
              {lang === 'tr' ? 'Katılım' : 'RSVP'}
            </h2>
            {invitationData.rsvpDeadline && (
              <p
                className="text-lg"
                style={{
                  color: tokens.colors.text.secondary,
                }}
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
                borderColor: 'var(--border-base)',
                minHeight: '44px',
                fontSize: '16px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = invitationData.theme.primaryColor; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="rsvp-email" className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
              {t('invitation_rsvp_email')}
            </label>
            <input
              id="rsvp-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                borderColor: 'var(--border-base)',
                minHeight: '44px',
                fontSize: '16px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = invitationData.theme.primaryColor; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
            />
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
                borderColor: 'var(--border-base)',
                minHeight: '44px',
                fontSize: '16px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = invitationData.theme.primaryColor; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
              placeholder={lang === 'tr' ? '+90 555 123 4567' : '+1 555 123 4567'}
            />
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

          {/* Guests */}
          {formData.attending && (
            <div>
              <label htmlFor="rsvp-guests" className="block mb-2 text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                {t('invitation_rsvp_guests')} *
              </label>
              <input
                id="rsvp-guests"
                type="number"
                inputMode="numeric"
                min="1"
                max="10"
                required={formData.attending}
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                style={{
                  backgroundColor: 'var(--bg-panel-strong)',
                  borderColor: 'var(--border-base)',
                  minHeight: '44px',
                  fontSize: '16px',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = invitationData.theme.primaryColor; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
              />
            </div>
          )}

          {/* Event Selection - Only show if scheduleItems exist and user is attending */}
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

          {/* Guest Questions */}
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
              {guestQuestions.map((question, index) => (
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

          {/* Love Note - Message to the Couple */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-base)' }}>
            <h3
              className="text-xl font-semibold mb-4"
              style={{
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                color: tokens.colors.text.primary,
              }}
            >
              {lang === 'tr' ? '💕 Gelin ve Damat\'a Mesaj' : '💕 Message to the Couple'}
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: tokens.colors.text.secondary }}
            >
              {lang === 'tr' 
                ? 'Gelin ve damat için özel bir mesaj yazabilirsiniz. Bu mesaj düğün sahipleri tarafından görülebilir.'
                : 'You can write a special message for the bride and groom. This message will be visible to the wedding hosts.'}
            </p>
            <textarea
              id="love-note"
              rows={5}
              value={formData.loveNote}
              onChange={(e) => setFormData({ ...formData, loveNote: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors resize-none text-base"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                borderColor: 'var(--border-base)',
                minHeight: '120px',
                fontSize: '16px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = invitationData.theme.primaryColor; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-base)'; }}
              placeholder={lang === 'tr' 
                ? 'Gelin ve damat için özel mesajınızı buraya yazın...'
                : 'Write your special message for the bride and groom here...'}
            />
          </div>

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

