'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

export function RegisterForm() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const { lang } = useI18n();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    kvkkAccepted: false,
    termsAccepted: false,
    marketingAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKvkkModal, setShowKvkkModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  async function handleRegister() {
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError(lang === 'tr' ? 'Ad ve soyad gereklidir' : 'First name and last name are required');
      return;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setError(lang === 'tr' ? 'Geçerli bir email adresi girin' : 'Please enter a valid email address');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError(lang === 'tr' ? 'Şifre en az 6 karakter olmalıdır' : 'Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(lang === 'tr' ? 'Şifreler eşleşmiyor' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get redirect URL from query params
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || '/dashboard';

      // Register via API (server-side, no email sent)
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          kvkkAccepted: formData.kvkkAccepted,
          termsAccepted: formData.termsAccepted,
          marketingAccepted: formData.marketingAccepted,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        if (registerData.error === 'USER_ALREADY_EXISTS') {
          setError(lang === 'tr' ? 'Bu email zaten kayıtlı' : 'This email is already registered');
        } else if (registerData.error === 'VALIDATION_ERROR') {
          setError(lang === 'tr' ? 'Lütfen tüm alanları doldurun' : 'Please fill all fields');
        } else {
          setError(registerData.details || registerData.error || 'Kayıt başarısız');
        }
        setLoading(false);
        return;
      }

      // Auto login after successful registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Redirect to specified URL or dashboard
      router.push(redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full p-8 rounded-xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
          {lang === 'tr' ? 'Kayıt Ol' : 'Sign Up'}
        </h1>
        <p className="mb-6 text-sm" style={{ color: tokens.colors.text.secondary }}>
          {lang === 'tr'
            ? 'Hesabınızı oluşturun ve başlayın.'
            : 'Create your account and get started.'}
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: error ? 'var(--crimson-base)' : 'var(--border-base)',
                  minHeight: '44px',
                  fontSize: '16px',
                }}
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value });
                  setError(null);
                }}
                placeholder={lang === 'tr' ? 'Ad' : 'First Name'}
                disabled={loading}
              />
            </div>
            <div>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: error ? 'var(--crimson-base)' : 'var(--border-base)',
                  minHeight: '44px',
                  fontSize: '16px',
                }}
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value });
                  setError(null);
                }}
                placeholder={lang === 'tr' ? 'Soyad' : 'Last Name'}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: error ? 'var(--crimson-base)' : 'var(--border-base)',
                minHeight: '44px',
                fontSize: '16px',
              }}
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setError(null);
              }}
              placeholder={lang === 'tr' ? 'email@ornek.com' : 'email@example.com'}
              disabled={loading}
            />
          </div>

          <div>
            <input
              type="tel"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: error ? 'var(--crimson-base)' : 'var(--border-base)',
                minHeight: '44px',
                fontSize: '16px',
              }}
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                setError(null);
              }}
              placeholder={lang === 'tr' ? 'Telefon (Opsiyonel)' : 'Phone (Optional)'}
              disabled={loading}
            />
          </div>

          <div>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: error ? 'var(--crimson-base)' : 'var(--border-base)',
                minHeight: '44px',
                fontSize: '16px',
              }}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setError(null);
              }}
              placeholder={lang === 'tr' ? 'Şifre (min. 6 karakter)' : 'Password (min. 6 characters)'}
              disabled={loading}
            />
          </div>

          <div>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-base"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: error ? 'var(--crimson-base)' : 'var(--border-base)',
                minHeight: '44px',
                fontSize: '16px',
              }}
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                setError(null);
              }}
              placeholder={lang === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}
              disabled={loading}
            />
          </div>

          {/* KVKK and Legal Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.kvkkAccepted}
                onChange={(e) => {
                  setFormData({ ...formData, kvkkAccepted: e.target.checked });
                  setError(null);
                }}
                className="mt-1 w-5 h-5 rounded border-2"
                style={{
                  accentColor: 'var(--crimson-base)',
                  borderColor: formData.kvkkAccepted ? 'var(--crimson-base)' : 'var(--border-base)',
                }}
                disabled={loading}
              />
              <span className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowKvkkModal(true)}
                      className="underline font-semibold"
                      style={{ color: 'var(--crimson-base)' }}
                    >
                      KVKK Aydınlatma Metni
                    </button>
                    {' '}ni okudum, anladım ve kabul ediyorum. *
                  </>
                ) : (
                  <>
                    I have read and accept the{' '}
                    <button
                      type="button"
                      onClick={() => setShowKvkkModal(true)}
                      className="underline font-semibold"
                      style={{ color: 'var(--crimson-base)' }}
                    >
                      Privacy Policy
                    </button>
                    . *
                  </>
                )}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => {
                  setFormData({ ...formData, termsAccepted: e.target.checked });
                  setError(null);
                }}
                className="mt-1 w-5 h-5 rounded border-2"
                style={{
                  accentColor: 'var(--crimson-base)',
                  borderColor: formData.termsAccepted ? 'var(--crimson-base)' : 'var(--border-base)',
                }}
                disabled={loading}
              />
              <span className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="underline font-semibold"
                      style={{ color: 'var(--crimson-base)' }}
                    >
                      Kullanım Şartları
                    </button>
                    {' '}nı okudum, anladım ve kabul ediyorum. *
                  </>
                ) : (
                  <>
                    I have read and accept the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="underline font-semibold"
                      style={{ color: 'var(--crimson-base)' }}
                    >
                      Terms of Service
                    </button>
                    . *
                  </>
                )}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.marketingAccepted}
                onChange={(e) => {
                  setFormData({ ...formData, marketingAccepted: e.target.checked });
                }}
                className="mt-1 w-5 h-5 rounded border-2"
                style={{
                  accentColor: 'var(--crimson-base)',
                  borderColor: formData.marketingAccepted ? 'var(--crimson-base)' : 'var(--border-base)',
                }}
                disabled={loading}
              />
              <span className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr'
                  ? 'Kampanya ve promosyon e-postaları almak istiyorum. (Opsiyonel)'
                  : 'I want to receive campaign and promotion emails. (Optional)'}
              </span>
            </label>
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--crimson-base)' }}>
              {error}
            </p>
          )}

          <button
            className="w-full px-6 py-3 rounded-full font-semibold transition-all min-h-[44px] disabled:opacity-50"
            style={{
              backgroundColor: 'var(--crimson-base)',
              color: 'white',
            }}
            onClick={handleRegister}
            disabled={loading}
          >
            {loading
              ? (lang === 'tr' ? 'Kayıt yapılıyor...' : 'Signing up...')
              : (lang === 'tr' ? 'Kayıt Ol' : 'Sign Up')}
          </button>

          <div className="text-center">
            <button
              className="text-sm underline"
              style={{ color: tokens.colors.text.secondary }}
              onClick={() => router.push('/login')}
            >
              {lang === 'tr' ? 'Zaten hesabınız var mı? Giriş yapın' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>

      {/* KVKK Modal */}
      {showKvkkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowKvkkModal(false)}
        >
          <div
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl p-6"
            style={{ backgroundColor: 'var(--bg-panel-strong)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'KVKK Aydınlatma Metni' : 'Privacy Policy'}
              </h2>
              <button
                onClick={() => setShowKvkkModal(false)}
                className="text-2xl font-bold"
                style={{ color: tokens.colors.text.secondary }}
              >
                ×
              </button>
            </div>
            <div className="prose prose-sm max-w-none" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? (
                <div className="space-y-4">
                  <p>
                    <strong>6698 sayılı Kişisel Verilerin Korunması Kanunu</strong> uyarınca, kişisel verilerinizin işlenmesi hakkında sizleri bilgilendirmek isteriz.
                  </p>
                  <p>
                    <strong>Veri Sorumlusu:</strong> Corvus Dijital Davetiye
                  </p>
                  <p>
                    <strong>İşlenen Kişisel Veriler:</strong> Ad, soyad, e-posta adresi, telefon numarası, ödeme bilgileri
                  </p>
                  <p>
                    <strong>Verilerin İşlenme Amacı:</strong> Hizmet sunumu, ödeme işlemleri, müşteri desteği, yasal yükümlülüklerin yerine getirilmesi
                  </p>
                  <p>
                    <strong>Verilerin Aktarımı:</strong> Kişisel verileriniz, hizmet sunumu için gerekli olan ödeme sağlayıcıları (Iyzico) ile paylaşılabilir.
                  </p>
                  <p>
                    <strong>Haklarınız:</strong> KVKK md. 11 uyarınca, kişisel verileriniz hakkında bilgi talep etme, düzeltme, silme, itiraz etme haklarınız bulunmaktadır.
                  </p>
                  <p>
                    <strong>İletişim:</strong> KVKK kapsamındaki talepleriniz için bizimle iletişime geçebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>
                    In accordance with <strong>Law No. 6698 on the Protection of Personal Data</strong>, we would like to inform you about the processing of your personal data.
                  </p>
                  <p>
                    <strong>Data Controller:</strong> Corvus Digital Invitation
                  </p>
                  <p>
                    <strong>Processed Personal Data:</strong> Name, surname, email address, phone number, payment information
                  </p>
                  <p>
                    <strong>Purpose of Data Processing:</strong> Service provision, payment processing, customer support, fulfillment of legal obligations
                  </p>
                  <p>
                    <strong>Data Transfer:</strong> Your personal data may be shared with payment providers (Iyzico) necessary for service provision.
                  </p>
                  <p>
                    <strong>Your Rights:</strong> In accordance with KVKK Article 11, you have the right to request information, correction, deletion, and objection regarding your personal data.
                  </p>
                  <p>
                    <strong>Contact:</strong> You can contact us for your requests under KVKK.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowKvkkModal(false)}
                className="px-6 py-2 rounded-full font-semibold"
                style={{
                  backgroundColor: 'var(--crimson-base)',
                  color: 'white',
                }}
              >
                {lang === 'tr' ? 'Kapat' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl p-6"
            style={{ backgroundColor: 'var(--bg-panel-strong)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'Kullanım Şartları' : 'Terms of Service'}
              </h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-2xl font-bold"
                style={{ color: tokens.colors.text.secondary }}
              >
                ×
              </button>
            </div>
            <div className="prose prose-sm max-w-none" style={{ color: tokens.colors.text.secondary }}>
              {lang === 'tr' ? (
                <div className="space-y-4">
                  <p>
                    <strong>1. Genel Hükümler</strong>
                  </p>
                  <p>
                    Bu kullanım şartları, Corvus Dijital Davetiye platformunun kullanımına ilişkindir. Platformu kullanarak bu şartları kabul etmiş sayılırsınız.
                  </p>
                  <p>
                    <strong>2. Hizmet Kapsamı</strong>
                  </p>
                  <p>
                    Platform, dijital düğün davetiyesi oluşturma ve yönetme hizmetleri sunmaktadır. Hizmetler, seçilen plana göre sınırlı veya sınırsız olabilir.
                  </p>
                  <p>
                    <strong>3. Ödeme ve İade</strong>
                  </p>
                  <p>
                    Ödemeler tek seferliktir. İade politikası, kullanıcı sözleşmesinde belirtilmiştir.
                  </p>
                  <p>
                    <strong>4. Kullanıcı Yükümlülükleri</strong>
                  </p>
                  <p>
                    Kullanıcılar, platformu yasalara uygun şekilde kullanmakla yükümlüdür. Telif hakkı ihlali, spam veya kötüye kullanım yasaktır.
                  </p>
                  <p>
                    <strong>5. Fikri Mülkiyet</strong>
                  </p>
                  <p>
                    Platform içeriği ve yazılımı Corvus Dijital Davetiye'ye aittir. İzinsiz kullanım yasaktır.
                  </p>
                  <p>
                    <strong>6. Sorumluluk Sınırlaması</strong>
                  </p>
                  <p>
                    Platform, hizmetlerin kesintisiz sunulmasını garanti etmez. Teknik sorunlardan kaynaklanan zararlardan sorumlu değildir.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>
                    <strong>1. General Provisions</strong>
                  </p>
                  <p>
                    These terms of service apply to the use of the Corvus Digital Invitation platform. By using the platform, you agree to these terms.
                  </p>
                  <p>
                    <strong>2. Service Scope</strong>
                  </p>
                  <p>
                    The platform provides digital wedding invitation creation and management services. Services may be limited or unlimited based on the selected plan.
                  </p>
                  <p>
                    <strong>3. Payment and Refund</strong>
                  </p>
                  <p>
                    Payments are one-time. Refund policy is specified in the user agreement.
                  </p>
                  <p>
                    <strong>4. User Obligations</strong>
                  </p>
                  <p>
                    Users are obligated to use the platform in accordance with the law. Copyright infringement, spam, or abuse is prohibited.
                  </p>
                  <p>
                    <strong>5. Intellectual Property</strong>
                  </p>
                  <p>
                    Platform content and software belong to Corvus Digital Invitation. Unauthorized use is prohibited.
                  </p>
                  <p>
                    <strong>6. Liability Limitation</strong>
                  </p>
                  <p>
                    The platform does not guarantee uninterrupted service. It is not responsible for damages arising from technical issues.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2 rounded-full font-semibold"
                style={{
                  backgroundColor: 'var(--crimson-base)',
                  color: 'white',
                }}
              >
                {lang === 'tr' ? 'Kapat' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

