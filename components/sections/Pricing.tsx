'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { PLAN_PRICING, PLAN_TYPES, type PlanType } from '@/lib/constants';

export function Pricing() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('premium');
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setCheckingUser(false);
    });
  }, [supabase]);

  const handlePayment = async (plan: PlanType) => {
    if (checkingUser) return;

    if (!user) {
      router.push(`/register?redirect=/checkout?plan=${plan}`);
      return;
    }

    router.push(`/checkout?plan=${plan}`);
  };

  const lightPlan = PLAN_PRICING[PLAN_TYPES.LIGHT];
  const premiumPlan = PLAN_PRICING[PLAN_TYPES.PREMIUM];

  return (
    <section id="pricing" className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, var(--bg-primary), var(--bg-secondary))' }}>
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
            {t('pricing_title')}
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: tokens.colors.text.secondary }}>
            {t('pricing_subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Light Plan */}
          <motion.div
            className="relative rounded-3xl overflow-hidden border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-panel-strong)',
              borderColor: selectedPlan === 'light' ? 'var(--gold-base)' : 'var(--border-base)',
              opacity: selectedPlan === 'light' ? 1 : 0.75,
              transform: selectedPlan === 'light' ? 'scale(1.02)' : 'scale(1)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => setSelectedPlan('light')}
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-1" style={{ color: tokens.colors.text.primary }}>
                  {lightPlan.name[lang]}
                </h3>
                <p className="text-sm mb-4" style={{ color: tokens.colors.text.secondary }}>
                  {lightPlan.tagline[lang]}
                </p>
                <div className="text-5xl font-bold mb-1" style={{ color: tokens.colors.text.primary }}>
                  {`₺${lightPlan.amount.toLocaleString('tr-TR')}`}
                </div>
                <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                  {t('pricing_one_time')}
                </p>
              </div>

              <p className="text-sm mb-6 text-center leading-relaxed" style={{ color: tokens.colors.text.secondary }}>
                {lightPlan.emotionalHook[lang]}
              </p>

              <ul className="space-y-3 mb-8">
                {lightPlan.features[lang].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-base mt-0.5">✓</span>
                    <span className="text-sm" style={{ color: tokens.colors.text.secondary }}>{feature}</span>
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
                  border: selectedPlan === 'light' ? 'none' : '1px solid var(--border-base)',
                }}
              >
                {t('pricing_light_cta')}
              </button>
            </div>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            className="relative rounded-3xl overflow-hidden border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-panel-strong)',
              borderColor: selectedPlan === 'premium' ? 'var(--crimson-base)' : 'var(--border-base)',
              boxShadow: selectedPlan === 'premium' ? '0 30px 80px rgba(161, 43, 58, 0.2)' : 'none',
              opacity: selectedPlan === 'premium' ? 1 : 0.75,
              transform: selectedPlan === 'premium' ? 'scale(1.02)' : 'scale(1)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onClick={() => setSelectedPlan('premium')}
            whileHover={{ scale: 1.02 }}
          >
            {premiumPlan.badge && (
              <div 
                className="absolute top-6 right-6 px-4 py-2 rounded-full text-sm font-semibold"
                style={{ backgroundColor: 'var(--gold-base)', color: 'white' }}
              >
                {premiumPlan.badge[lang]}
              </div>
            )}

            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-1" style={{ color: tokens.colors.text.primary }}>
                  {premiumPlan.name[lang]}
                </h3>
                <p className="text-sm mb-4" style={{ color: tokens.colors.text.secondary }}>
                  {premiumPlan.tagline[lang]}
                </p>
                <div className="text-5xl font-bold mb-1" style={{ color: 'var(--crimson-base)' }}>
                  {`₺${premiumPlan.amount.toLocaleString('tr-TR')}`}
                </div>
                <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                  {t('pricing_one_time')}
                </p>
              </div>

              <p className="text-sm mb-6 text-center leading-relaxed" style={{ color: tokens.colors.text.secondary }}>
                {premiumPlan.emotionalHook[lang]}
              </p>

              <ul className="space-y-3 mb-8">
                {premiumPlan.features[lang].map((feature, idx) => {
                  const isPremiumOnly = premiumPlan.premiumOnlyFeatures[lang].includes(feature);
                  return (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-base mt-0.5" style={{ color: isPremiumOnly ? 'var(--gold-base)' : 'inherit' }}>
                        {isPremiumOnly ? '★' : '✓'}
                      </span>
                      <span className="text-sm" style={{ 
                        color: tokens.colors.text.secondary,
                        fontWeight: isPremiumOnly ? 600 : 400,
                      }}>
                        {feature}
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
                style={{ backgroundColor: 'var(--crimson-base)', color: 'white' }}
              >
                {t('pricing_premium_cta')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

