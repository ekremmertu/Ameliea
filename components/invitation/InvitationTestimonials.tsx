'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

interface Testimonial {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

interface InvitationTestimonialsProps {
  invitationSlug: string;
  themeColor: string;
  canDelete?: boolean; // Only invitation owner can delete
}

export function InvitationTestimonials({ invitationSlug, themeColor, canDelete = false }: InvitationTestimonialsProps) {
  const { t, lang } = useI18n();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, [invitationSlug]);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`/api/invitations/${invitationSlug}/testimonials`);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/invitations/${invitationSlug}/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', message: '' });
        setShowForm(false);
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) return;

    try {
      const response = await fetch(`/api/invitations/${invitationSlug}/testimonials/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
            }}
          >
            {lang === 'tr' ? 'Misafirlerimizden' : 'From Our Guests'}
          </h2>
          <p className="text-lg mb-6" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' ? 'Sizden gelen mesajlar' : 'Messages from you'}
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-full transition-all"
              style={{
                backgroundColor: themeColor,
                color: 'white',
              }}
            >
              {lang === 'tr' ? '+ Not Yaz' : '+ Write Note'}
            </button>
          )}
        </motion.div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="mb-12 p-6 rounded-xl"
            style={{ backgroundColor: 'var(--bg-panel-strong)' }}
          >
            <div className="space-y-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={lang === 'tr' ? 'Adınız' : 'Your Name'}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: 'var(--border-base)',
                  minHeight: '44px',
                  fontSize: '16px',
                }}
                required
              />
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={lang === 'tr' ? 'Mesajınız...' : 'Your message...'}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors resize-none text-base"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: 'var(--border-base)',
                  minHeight: '100px',
                  fontSize: '16px',
                }}
                required
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 rounded-full transition-all min-h-[44px]"
                  style={{
                    backgroundColor: submitting ? 'var(--text-muted)' : themeColor,
                    color: 'white',
                  }}
                >
                  {submitting ? (lang === 'tr' ? 'Gönderiliyor...' : 'Submitting...') : (lang === 'tr' ? 'Gönder' : 'Submit')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', message: '' });
                  }}
                  className="px-6 py-3 rounded-full border transition-all min-h-[44px]"
                  style={{
                    backgroundColor: 'var(--bg-panel)',
                    borderColor: 'var(--border-base)',
                    color: tokens.colors.text.primary,
                  }}
                >
                  {lang === 'tr' ? 'İptal' : 'Cancel'}
                </button>
              </div>
            </div>
          </motion.form>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: themeColor }}></div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12" style={{ color: tokens.colors.text.muted }}>
            {lang === 'tr' ? 'Henüz mesaj yok' : 'No messages yet'}
          </div>
        ) : (
          <div className="space-y-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl relative"
                style={{ backgroundColor: 'var(--bg-panel-strong)' }}
              >
                {canDelete && (
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      backgroundColor: 'rgba(161, 43, 58, 0.1)',
                      color: 'var(--crimson-base)',
                    }}
                  >
                    ×
                  </button>
                )}
                <p className="text-lg mb-4" style={{ color: tokens.colors.text.primary }}>
                  &quot;{testimonial.message}&quot;
                </p>
                <div className="flex justify-between items-center">
                  <p className="font-semibold" style={{ color: tokens.colors.text.secondary }}>
                    — {testimonial.name}
                  </p>
                  <p className="text-sm" style={{ color: tokens.colors.text.muted }}>
                    {new Date(testimonial.createdAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

