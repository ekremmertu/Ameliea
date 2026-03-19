'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';
import { Header } from '@/components/layout/Header';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { showToast } from '@/components/ui/Toast';
import { logger } from '@/lib/logger';
import { hasActivePurchase } from '@/lib/purchase';
import { PaymentForm, type PaymentFormData } from '@/components/payment/PaymentForm';
import { PLAN_PRICING, PLAN_TYPES, UPSELL_COPY, type PlanType } from '@/lib/constants';

export default function CheckoutPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const supabase = createSupabaseBrowserClient();
  
  const [plan, setPlan] = useState<PlanType>('premium');
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { name?: string } } | null>(null);
  const [hasPurchase, setHasPurchase] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const planParam = urlParams.get('plan') as PlanType;
      if (planParam && (planParam === 'light' || planParam === 'premium')) {
        setPlan(planParam);
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        hasActivePurchase(user.id).then(setHasPurchase);
      }
    });
  }, [supabase]);

  const handleStartPayment = () => {
    if (!user) {
      router.push(`/login?redirect=/checkout?plan=${plan}`);
      return;
    }

    if (hasPurchase) {
      router.push('/dashboard');
      return;
    }

    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (formData: PaymentFormData) => {
    setProcessing(true);

    try {
      // Initialize payment with Iyzico
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_type: plan,
          paymentCard: {
            cardHolderName: formData.cardHolderName,
            cardNumber: String(formData.cardNumber).replace(/\s/g, ''), // Remove spaces
            expireMonth: formData.expireMonth,
            expireYear: formData.expireYear,
            cvc: formData.cvc,
          },
          buyer: formData.buyer,
          shippingAddress: formData.shippingAddress,
          billingAddress: formData.billingAddress,
        }),
      });

      if (!response.ok) {
        // Handle 404 and other errors
        if (response.status === 404) {
          throw new Error('Payment API endpoint not found. Please check if the server is running correctly.');
        }
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { details: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.details || errorData.error || 'Payment initialization failed');
      }

      const data = await response.json();

      if (data.htmlContent) {
        // 3D Secure HTML content - Iyzico returns a form that auto-submits
        // Remove any existing 3DS container
        const existingContainer = document.getElementById('iyzico-3ds-container');
        if (existingContainer) {
          existingContainer.remove();
        }

        // Create a container and inject the HTML
        const container = document.createElement('div');
        container.id = 'iyzico-3ds-container';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '9999';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        container.innerHTML = data.htmlContent;
        document.body.appendChild(container);

        // The HTML content from Iyzico contains a form that auto-submits
        // After 3D Secure, Iyzico will redirect to our callback URL
        // Don't set processing to false here - let 3D Secure complete
      } else {
        throw new Error('No payment HTML content received');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      logger.error('Full error details:', {
        error,
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      showToast(
        lang === 'tr'
          ? `Ödeme işlemi başarısız oldu: ${errorMessage}`
          : `Payment processing failed: ${errorMessage}`,
        'error'
      );
      setProcessing(false);
    }
  };

  const selectedPlanData = PLAN_PRICING[plan];
  const premiumPlanData = PLAN_PRICING[PLAN_TYPES.PREMIUM];
  const showUpsell = plan === 'light';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <BackButton href="/" position="relative" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8"
        >
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 text-center"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
            }}
          >
            {t('checkout_title')}
          </h1>
          <p className="text-center text-lg mb-8" style={{ color: tokens.colors.text.secondary }}>
            {t('checkout_subtitle')}
          </p>

          {/* Plan Summary */}
          <div className="rounded-2xl overflow-hidden border-2 mb-8" style={{ 
            backgroundColor: 'var(--bg-panel-strong)',
            borderColor: plan === 'premium' ? 'var(--crimson-base)' : 'var(--gold-base)',
          }}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: tokens.colors.text.primary }}>
                    {selectedPlanData.name[lang]}
                  </h2>
                  <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                    {selectedPlanData.tagline[lang]}
                  </p>
                  {selectedPlanData.badge && (
                    <span className="inline-block mt-2 text-sm px-3 py-1 rounded-full" style={{ 
                      backgroundColor: 'var(--gold-base)',
                      color: 'white',
                    }}>
                      {selectedPlanData.badge[lang]}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1" style={{ 
                    color: plan === 'premium' ? 'var(--crimson-base)' : 'var(--gold-base)',
                  }}>
                    {`₺${selectedPlanData.amount.toLocaleString('tr-TR')}`}
                  </div>
                  <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                    {t('pricing_one_time')}
                  </p>
                </div>
              </div>

              <p className="text-sm mb-6" style={{ color: tokens.colors.text.secondary }}>
                {selectedPlanData.emotionalHook[lang]}
              </p>

              <div className="border-t pt-6" style={{ borderColor: 'var(--border-base)' }}>
                <ul className="space-y-3">
                  {selectedPlanData.features[lang].map((feature, idx) => {
                    const isPremiumOnly = selectedPlanData.premiumOnlyFeatures[lang].includes(feature);
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-base mt-0.5" style={{ color: isPremiumOnly ? 'var(--gold-base)' : 'inherit' }}>
                          {isPremiumOnly ? '★' : '✓'}
                        </span>
                        <span className="text-sm" style={{ color: tokens.colors.text.secondary }}>{feature}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* Upsell for Light users */}
          {showUpsell && (
            <motion.div
              className="rounded-2xl overflow-hidden border mb-8 p-6"
              style={{ 
                backgroundColor: 'rgba(200, 162, 74, 0.04)',
                borderColor: 'rgba(200, 162, 74, 0.2)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: tokens.colors.text.primary }}>
                    {t('checkout_upsell_title')}
                  </h3>
                  <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                    {t('checkout_upsell_body')}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPlan('premium');
                    window.history.replaceState({}, '', '/checkout?plan=premium');
                  }}
                  className="whitespace-nowrap"
                >
                  {t('checkout_upsell_cta')} — ₺{(premiumPlanData.amount - selectedPlanData.amount).toLocaleString('tr-TR')}
                </Button>
              </div>
            </motion.div>
          )}

          {/* User Info */}
          {user ? (
            <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
              <p className="text-sm mb-2" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Giriş yapan:' : 'Signed in as:'}
              </p>
              <p className="font-semibold" style={{ color: tokens.colors.text.primary }}>
                {user.email}
              </p>
            </div>
          ) : (
            <div className="rounded-xl p-6 mb-6 text-center" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
              <p className="mb-4" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' 
                  ? 'Ödeme yapmak için giriş yapmanız gerekiyor.'
                  : 'You need to sign in to complete payment.'}
              </p>
              <Button
                variant="secondary"
                onClick={() => router.push(`/login?redirect=/checkout?plan=${plan}`)}
              >
                {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
              </Button>
            </div>
          )}

          {/* Payment Form or Start Payment Button */}
          {showPaymentForm && user && !hasPurchase ? (
            <PaymentForm
              userEmail={user.email ?? ''}
              userName={user.user_metadata?.name ?? (user.email ? user.email.split('@')[0] : undefined)}
              onSubmit={handlePaymentSubmit}
              isSubmitting={processing}
            />
          ) : (
            <div className="space-y-4">
              <Button
                variant="primary"
                onClick={handleStartPayment}
                disabled={processing || !user || hasPurchase}
                className="w-full text-lg px-8 py-4"
              >
                {processing
                  ? lang === 'tr' ? 'İşleniyor...' : 'Processing...'
                  : hasPurchase
                  ? lang === 'tr' ? 'Zaten Satın Aldınız' : 'Already Purchased'
                  : lang === 'tr' ? 'Ödemeye Başla' : 'Start Payment'}
              </Button>

              {hasPurchase && (
                <Button variant="secondary" onClick={() => router.push('/dashboard')} className="w-full">
                  {lang === 'tr' ? 'Dashboard\'a Git' : 'Go to Dashboard'}
                </Button>
              )}
            </div>
          )}

          {/* Trust Message */}
          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: tokens.colors.text.muted }}>
              {t('checkout_trust')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

