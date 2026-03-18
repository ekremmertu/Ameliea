'use client';

import { useState } from 'react';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button } from '@/components/ui/Button';

interface PaymentFormData {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  buyer: {
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    city: string;
    country: string;
    zipCode: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
}

interface PaymentFormProps {
  userEmail: string;
  userName?: string;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function PaymentForm({ userEmail, userName, onSubmit, isSubmitting }: PaymentFormProps) {
  const { lang } = useI18n();
  const [formData, setFormData] = useState<PaymentFormData>({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
    buyer: {
      name: userName?.split(' ')[0] || '',
      surname: userName?.split(' ').slice(1).join(' ') || '',
      gsmNumber: '',
      email: userEmail,
      identityNumber: '',
      registrationAddress: '',
      city: '',
      country: 'Turkey',
      zipCode: '',
    },
    shippingAddress: {
      contactName: userName || '',
      city: '',
      country: 'Turkey',
      address: '',
      zipCode: '',
    },
    billingAddress: {
      contactName: userName || '',
      city: '',
      country: 'Turkey',
      address: '',
      zipCode: '',
    },
  });

  const handleChange = (field: string, value: string, nested?: string) => {
    if (nested) {
      setFormData((prev) => {
        const fieldValue = prev[field as keyof PaymentFormData];
        if (typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue)) {
          return {
            ...prev,
            [field]: {
              ...(fieldValue as Record<string, unknown>),
              [nested]: value,
            },
          };
        }
        return prev;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.match(/.{1,4}/g)?.join(' ') || digits;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 19) {
      handleChange('cardNumber', formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Card Information */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: tokens.colors.text.primary }}>
          {lang === 'tr' ? 'Kart Bilgileri' : 'Card Information'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Kart Üzerindeki İsim' : 'Card Holder Name'}
            </label>
            <input
              type="text"
              required
              value={formData.cardHolderName}
              onChange={(e) => handleChange('cardHolderName', e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
              placeholder={lang === 'tr' ? 'JOHN DOE' : 'JOHN DOE'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Kart Numarası' : 'Card Number'}
            </label>
            <input
              type="text"
              required
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
              placeholder="1234 5678 9012 3456"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Ay' : 'Month'}
              </label>
              <input
                type="text"
                required
                value={formData.expireMonth}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                  if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                    handleChange('expireMonth', value.padStart(2, '0'));
                  }
                }}
                maxLength={2}
                className="w-full px-4 py-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: 'var(--border-base)',
                  color: tokens.colors.text.primary,
                }}
                placeholder="MM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Yıl' : 'Year'}
              </label>
              <input
                type="text"
                required
                value={formData.expireYear}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                  handleChange('expireYear', value);
                }}
                maxLength={2}
                className="w-full px-4 py-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: 'var(--border-base)',
                  color: tokens.colors.text.primary,
                }}
                placeholder="YY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
                CVC
              </label>
              <input
                type="text"
                required
                value={formData.cvc}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  handleChange('cvc', value);
                }}
                maxLength={4}
                className="w-full px-4 py-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: 'var(--border-base)',
                  color: tokens.colors.text.primary,
                }}
                placeholder="123"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buyer Information */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: tokens.colors.text.primary }}>
          {lang === 'tr' ? 'Fatura Bilgileri' : 'Billing Information'}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Ad' : 'Name'} *
            </label>
            <input
              type="text"
              required
              value={formData.buyer.name}
              onChange={(e) => handleChange('buyer', e.target.value, 'name')}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Soyad' : 'Surname'} *
            </label>
            <input
              type="text"
              required
              value={formData.buyer.surname}
              onChange={(e) => handleChange('buyer', e.target.value, 'surname')}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Telefon' : 'Phone'} *
            </label>
            <input
              type="tel"
              required
              value={formData.buyer.gsmNumber}
              onChange={(e) => handleChange('buyer', e.target.value, 'gsmNumber')}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
              placeholder="+905551234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'TCKN / Pasaport No' : 'ID Number'} *
            </label>
            <input
              type="text"
              required
              value={formData.buyer.identityNumber}
              onChange={(e) => handleChange('buyer', e.target.value.replace(/\D/g, ''), 'identityNumber')}
              maxLength={11}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Adres' : 'Address'} *
            </label>
            <input
              type="text"
              required
              value={formData.buyer.registrationAddress}
              onChange={(e) => handleChange('buyer', e.target.value, 'registrationAddress')}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Şehir' : 'City'} *
            </label>
            <input
              type="text"
              required
              value={formData.buyer.city}
              onChange={(e) => handleChange('buyer', e.target.value, 'city')}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Posta Kodu' : 'Zip Code'} *
            </label>
            <input
              type="text"
              required
              value={formData.buyer.zipCode}
              onChange={(e) => handleChange('buyer', e.target.value.replace(/\D/g, ''), 'zipCode')}
              maxLength={5}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
        </div>
      </div>

      {/* Shipping Address (same as billing for simplicity) */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: tokens.colors.text.primary }}>
          {lang === 'tr' ? 'Teslimat Adresi' : 'Shipping Address'}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'İletişim Adı' : 'Contact Name'} *
            </label>
            <input
              type="text"
              required
              value={formData.shippingAddress.contactName}
              onChange={(e) => handleChange('shippingAddress', e.target.value, 'contactName')}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Adres' : 'Address'} *
            </label>
            <input
              type="text"
              required
              value={formData.shippingAddress.address}
              onChange={(e) => handleChange('shippingAddress', e.target.value, 'address')}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Şehir' : 'City'} *
            </label>
            <input
              type="text"
              required
              value={formData.shippingAddress.city}
              onChange={(e) => handleChange('shippingAddress', e.target.value, 'city')}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Posta Kodu' : 'Zip Code'} *
            </label>
            <input
              type="text"
              required
              value={formData.shippingAddress.zipCode}
              onChange={(e) => handleChange('shippingAddress', e.target.value.replace(/\D/g, ''), 'zipCode')}
              maxLength={5}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
        </div>
      </div>

      {/* Billing Address (same as shipping) */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: tokens.colors.text.primary }}>
          {lang === 'tr' ? 'Fatura Adresi' : 'Billing Address'}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'İletişim Adı' : 'Contact Name'} *
            </label>
            <input
              type="text"
              required
              value={formData.billingAddress.contactName}
              onChange={(e) => handleChange('billingAddress', e.target.value, 'contactName')}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Adres' : 'Address'} *
            </label>
            <input
              type="text"
              required
              value={formData.billingAddress.address}
              onChange={(e) => handleChange('billingAddress', e.target.value, 'address')}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Şehir' : 'City'} *
            </label>
            <input
              type="text"
              required
              value={formData.billingAddress.city}
              onChange={(e) => handleChange('billingAddress', e.target.value, 'city')}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? 'Posta Kodu' : 'Zip Code'} *
            </label>
            <input
              type="text"
              required
              value={formData.billingAddress.zipCode}
              onChange={(e) => handleChange('billingAddress', e.target.value.replace(/\D/g, ''), 'zipCode')}
              maxLength={5}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border-base)',
                color: tokens.colors.text.primary,
              }}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="w-full text-lg px-8 py-4"
      >
        {isSubmitting
          ? (lang === 'tr' ? 'İşleniyor...' : 'Processing...')
          : (lang === 'tr' ? 'Ödemeyi Tamamla' : 'Complete Payment')}
      </Button>
    </form>
  );
}

