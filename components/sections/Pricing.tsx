'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function Pricing() {
  const { lang } = useI18n();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [selectedPlan, setSelectedPlan] = useState<'light' | 'premium'>('premium');
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setCheckingUser(false);
    });
  }, [supabase]);

  const handlePayment = async (plan: 'light' | 'premium') => {
    if (checkingUser) {
      return; // Wait for user check
    }

    if (!user) {
      // User not logged in - redirect to register with return URL
      router.push(`/register?redirect=/checkout?plan=${plan}`);
      return;
    }

    // User is logged in - go directly to checkout
    router.push(`/checkout?plan=${plan}`);
  };

  const plans = {
    light: {
      price: '₺1,999',
      features: [
        lang === 'tr' ? 'Profesyonel şablon davetiye' : 'Professional template invitation',
        lang === 'tr' ? 'Temel RSVP yönetimi' : 'Basic RSVP management',
        lang === 'tr' ? 'Sınırlı düzenleme (3 kez)' : 'Limited edits (3 times)',
        lang === 'tr' ? '1 ay erişim' : '1 month access',
        lang === 'tr' ? 'E-posta desteği' : 'Email support',
      ],
      premiumFeatures: [],
    },
    premium: {
      price: '₺3,999',
      features: [
        lang === 'tr' ? 'Profesyonel şablon davetiye' : 'Professional template invitation',
        lang === 'tr' ? 'Premium RSVP yönetim paneli' : 'Premium RSVP management dashboard',
        lang === 'tr' ? 'Sınırsız düzenleme' : 'Unlimited edits',
        lang === 'tr' ? 'Video & Müzik entegrasyonu' : 'Video & Music integration',
        lang === 'tr' ? 'Misafirlerimizden Mesajlar' : 'Messages from Our Guests',
        lang === 'tr' ? 'Gelişmiş analitik' : 'Advanced analytics',
        lang === 'tr' ? 'Öncelikli destek' : 'Priority support',
        lang === 'tr' ? 'Tema özelleştirme' : 'Theme customization',
      ],
      premiumFeatures: [
        lang === 'tr' ? 'Video & Müzik entegrasyonu' : 'Video & Music integration',
        lang === 'tr' ? 'Gelişmiş analitik' : 'Advanced analytics',
        lang === 'tr' ? 'Öncelikli destek' : 'Priority support',
        lang === 'tr' ? 'Tema özelleştirme' : 'Theme customization',
      ],
    },
  };

  return (
    <section id="pricing" className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, var(--bg-primary), var(--bg-secondary))' }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-5" style={{ background: 'var(--gold-base)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-5" style={{ background: 'var(--crimson-base)', filter: 'blur(100px)' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
              letterSpacing: '-0.02em',
            }}
          >
            {lang === 'tr' ? 'Fiyatlandırma' : 'Pricing'}
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' 
              ? 'İhtiyacınıza uygun planı seçin. Tek seferlik ödeme.'
              : 'Choose the plan that fits your needs. One-time payment.'}
          </p>
        </motion.div>

        {/* Plan Selector */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="inline-flex p-1 rounded-2xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
            <button
              onClick={() => setSelectedPlan('light')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedPlan === 'light' ? '' : 'opacity-60'
              }`}
              style={{
                backgroundColor: selectedPlan === 'light' ? 'var(--bg-panel)' : 'transparent',
                color: tokens.colors.text.primary,
              }}
            >
              {lang === 'tr' ? 'Light' : 'Light'}
            </button>
            <button
              onClick={() => setSelectedPlan('premium')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all relative ${
                selectedPlan === 'premium' ? '' : 'opacity-60'
              }`}
              style={{
                backgroundColor: selectedPlan === 'premium' ? 'var(--bg-panel)' : 'transparent',
                color: tokens.colors.text.primary,
              }}
            >
              {lang === 'tr' ? 'Premium' : 'Premium'}
              {selectedPlan === 'premium' && (
                <span className="absolute -top-1 -right-1 text-xs px-2 py-0.5 rounded-full" style={{ 
                  backgroundColor: 'var(--gold-base)',
                  color: 'white',
                }}>
                  ⭐
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Light Plan */}
          <motion.div
            className={`relative rounded-3xl overflow-hidden border-2 transition-all ${
              selectedPlan === 'light' ? 'scale-105' : 'scale-100 opacity-60'
            }`}
            style={{
              backgroundColor: 'var(--bg-panel-strong)',
              borderColor: selectedPlan === 'light' ? 'var(--gold-base)' : 'var(--border-base)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: selectedPlan === 'light' ? 1 : 0.6, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => setSelectedPlan('light')}
          >
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? 'Light' : 'Light'}
                </h3>
                <div className="text-5xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
                  {plans.light.price}
                </div>
                <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                  {lang === 'tr' ? 'Tek seferlik ödeme' : 'One-time payment'}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plans.light.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">✓</span>
                    <span style={{ color: tokens.colors.text.secondary }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayment('light');
                }}
                className="w-full px-6 py-3 rounded-full font-semibold transition-all min-h-[44px]"
                style={{
                  backgroundColor: selectedPlan === 'light' ? 'var(--crimson-base)' : 'var(--bg-panel)',
                  color: selectedPlan === 'light' ? 'white' : tokens.colors.text.primary,
                  border: selectedPlan === 'light' ? 'none' : `1px solid var(--border-base)`,
                }}
              >
                {lang === 'tr' ? 'Planı Seç' : 'Choose Plan'}
              </button>
            </div>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            className={`relative rounded-3xl overflow-hidden border-2 transition-all ${
              selectedPlan === 'premium' ? 'scale-105' : 'scale-100 opacity-60'
            }`}
            style={{
              backgroundColor: 'var(--bg-panel-strong)',
              borderColor: selectedPlan === 'premium' ? 'var(--crimson-base)' : 'var(--border-base)',
              boxShadow: selectedPlan === 'premium' ? '0 30px 80px rgba(161, 43, 58, 0.2)' : 'none',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: selectedPlan === 'premium' ? 1 : 0.6, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onClick={() => setSelectedPlan('premium')}
          >
            {/* Premium Badge */}
            <div 
              className="absolute top-6 right-6 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: 'var(--gold-base)',
                color: 'white',
              }}
            >
              {lang === 'tr' ? '⭐ Premium' : '⭐ Premium'}
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? 'Premium' : 'Premium'}
                </h3>
                <div className="text-5xl font-bold mb-2" style={{ color: 'var(--crimson-base)' }}>
                  {plans.premium.price}
                </div>
                <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                  {lang === 'tr' ? 'Tek seferlik ödeme' : 'One-time payment'}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plans.premium.features.map((feature, idx) => {
                  const isPremium = plans.premium.premiumFeatures.includes(feature);
                  return (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-lg mt-0.5" style={{ color: isPremium ? 'var(--gold-base)' : 'inherit' }}>
                        {isPremium ? '⭐' : '✓'}
                      </span>
                      <span style={{ 
                        color: tokens.colors.text.secondary,
                        fontWeight: isPremium ? 600 : 400,
                      }}>
                        {feature}
                        {isPremium && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ 
                            backgroundColor: 'rgba(200, 162, 74, 0.1)',
                            color: 'var(--gold-base)',
                          }}>
                            {lang === 'tr' ? 'Premium' : 'Premium'}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayment('premium');
                }}
                className="w-full px-6 py-3 rounded-full font-semibold transition-all min-h-[44px]"
                style={{
                  backgroundColor: 'var(--crimson-base)',
                  color: 'white',
                }}
              >
                {lang === 'tr' ? 'Planı Seç' : 'Choose Plan'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

