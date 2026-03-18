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
import { PaymentForm } from '@/components/payment/PaymentForm';

type PlanType = 'light' | 'premium';

const plans = {
  light: {
    price: '₺1,999',
    name: { tr: 'Light', en: 'Light' },
    features: {
      tr: [
        'Profesyonel şablon davetiye',
        'Temel RSVP yönetimi',
        'Sınırlı düzenleme (3 kez)',
        '1 ay erişim',
        'E-posta desteği',
      ],
      en: [
        'Professional template invitation',
        'Basic RSVP management',
        'Limited edits (3 times)',
        '1 month access',
        'Email support',
      ],
    },
  },
  premium: {
    price: '₺3,999',
    name: { tr: 'Premium', en: 'Premium' },
    features: {
      tr: [
        'Profesyonel şablon davetiye',
        'Premium RSVP yönetim paneli',
        'Sınırsız düzenleme',
        'Video & Müzik entegrasyonu',
        'Misafirlerimizden Mesajlar',
        'Gelişmiş analitik',
        'Öncelikli destek',
        'Tema özelleştirme',
      ],
      en: [
        'Professional template invitation',
        'Premium RSVP management dashboard',
        'Unlimited edits',
        'Video & Music integration',
        'Messages from Our Guests',
        'Advanced analytics',
        'Priority support',
        'Theme customization',
      ],
    },
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { lang } = useI18n();
  const supabase = createSupabaseBrowserClient();
  
  const [plan, setPlan] = useState<PlanType>('premium');
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [hasPurchase, setHasPurchase] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    // Get plan from URL params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const planParam = urlParams.get('plan') as PlanType;
      if (planParam && (planParam === 'light' || planParam === 'premium')) {
        setPlan(planParam);
      }
    }

    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Check if user already has purchase
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

  const handlePaymentSubmit = async (formData: Record<string, unknown>) => {
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
            cardNumber: formData.cardNumber.replace(/\s/g, ''), // Remove spaces
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

  const selectedPlan = plans[plan];

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
            {lang === 'tr' ? 'Ödeme' : 'Checkout'}
          </h1>
          <p className="text-center text-lg mb-8" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' 
              ? 'Seçtiğiniz planı onaylayın ve ödemeyi tamamlayın'
              : 'Confirm your selected plan and complete payment'}
          </p>

          {/* Plan Summary */}
          <div className="rounded-2xl overflow-hidden border-2 mb-8" style={{ 
            backgroundColor: 'var(--bg-panel-strong)',
            borderColor: plan === 'premium' ? 'var(--crimson-base)' : 'var(--gold-base)',
          }}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
                    {selectedPlan.name[lang]}
                  </h2>
                  {plan === 'premium' && (
                    <span className="text-sm px-3 py-1 rounded-full" style={{ 
                      backgroundColor: 'var(--gold-base)',
                      color: 'white',
                    }}>
                      ⭐ {lang === 'tr' ? 'Premium' : 'Premium'}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1" style={{ 
                    color: plan === 'premium' ? 'var(--crimson-base)' : 'var(--gold-base)',
                  }}>
                    {selectedPlan.price}
                  </div>
                  <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Tek seferlik ödeme' : 'One-time payment'}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6" style={{ borderColor: 'var(--border-base)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? 'Özellikler' : 'Features'}
                </h3>
                <ul className="space-y-3">
                  {selectedPlan.features[lang].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">✓</span>
                      <span style={{ color: tokens.colors.text.secondary }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

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
              userEmail={user.email}
              userName={user.user_metadata?.name || user.email.split('@')[0]}
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

          {/* Payment Info */}
          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: tokens.colors.text.muted }}>
              {lang === 'tr' 
                ? 'Güvenli ödeme. 7/24 destek.'
                : 'Secure payment. 24/7 support.'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

