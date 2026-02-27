# 🚀 Deployment Guide - Digital Wedding Invitation Platform

## Deployment Seçenekleri

Bu platform için 2 ana deployment seçeneği var:
1. **Vercel** (Önerilen - Next.js için optimize)
2. **Firebase Hosting** (Alternatif)

---

## 🎯 Vercel Deployment (Önerilen)

### Ön Hazırlık

#### 1. Vercel Hesabı Oluştur
- [vercel.com](https://vercel.com) adresinden ücretsiz hesap aç
- GitHub hesabını bağla

#### 2. Vercel CLI Kur
```bash
npm install -g vercel
```

#### 3. Vercel'e Login
```bash
vercel login
```

### Adım Adım Deployment

#### Adım 1: Environment Variables Hazırla

Vercel dashboard'da veya CLI ile şu environment variable'ları ekle:

**Production Environment Variables:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production

# Admin
ADMIN_EMAILS=admin@yourdomain.com
SUPER_ADMIN_EMAILS=superadmin@yourdomain.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@yourdomain.com

# Payment (Iyzico)
IYZICO_API_KEY=your_api_key
IYZICO_SECRET_KEY=your_secret_key
IYZICO_BASE_URL=https://api.iyzipay.com

# Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_token

# Notifications (Optional)
RESEND_API_KEY=your_resend_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Adım 2: İlk Deployment

```bash
# Project root'ta
cd /path/to/web-next

# Vercel'e deploy et
vercel

# Sorulara cevaplar:
# ? Set up and deploy? Yes
# ? Which scope? (Your account)
# ? Link to existing project? No
# ? What's your project's name? wedding-invitations
# ? In which directory is your code located? ./
# ? Want to override the settings? No
```

#### Adım 3: Production Deployment

```bash
# Production'a deploy et
vercel --prod
```

#### Adım 4: Environment Variables Ekle (Dashboard)

1. [vercel.com/dashboard](https://vercel.com/dashboard) → Projeyi seç
2. **Settings** → **Environment Variables**
3. Yukarıdaki tüm değişkenleri ekle
4. **Redeploy** butonuna tıkla

### Vercel Dashboard Üzerinden Deployment

1. **GitHub Repository Bağla**
   - Vercel Dashboard → **Add New Project**
   - GitHub repository'yi seç
   - Import et

2. **Build Settings**
   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Environment Variables**
   - Tüm production değişkenlerini ekle

4. **Deploy**
   - Deploy butonuna tıkla
   - İlk deployment ~5-10 dakika sürer

### Otomatik Deployment (GitHub Actions)

Repository'de zaten `.github/workflows/deploy.yml` mevcut:

```yaml
# Her main branch'e push'ta otomatik deploy
on:
  push:
    branches: [main]
```

**GitHub Secrets Ekle:**
1. GitHub → Repository → Settings → Secrets and variables → Actions
2. Şu secret'ları ekle:
   - `VERCEL_TOKEN` (Vercel dashboard'dan al)
   - `VERCEL_ORG_ID` (Vercel settings'den)
   - `VERCEL_PROJECT_ID` (Vercel project settings'den)
   - Tüm environment variables

---

## 🔥 Firebase Hosting Deployment (Alternatif)

### Ön Hazırlık

#### 1. Firebase CLI Kur
```bash
npm install -g firebase-tools
```

#### 2. Firebase Login
```bash
firebase login
```

#### 3. Firebase Project Oluştur
- [console.firebase.google.com](https://console.firebase.google.com)
- Yeni proje oluştur

### Deployment Adımları

#### Adım 1: Firebase Init
```bash
firebase init hosting

# Sorulara cevaplar:
# ? Select project: (Yeni oluşturduğun proje)
# ? What do you want to use as your public directory? out
# ? Configure as a single-page app? No
# ? Set up automatic builds with GitHub? Yes (optional)
```

#### Adım 2: Build
```bash
npm run build
npm run export  # Static export
```

#### Adım 3: Deploy
```bash
firebase deploy --only hosting
```

**Not:** Firebase Hosting statik export gerektirir. Bazı Next.js özellikleri (API routes, middleware) çalışmayabilir. **Vercel önerilir.**

---

## 🗄️ Database Migration

Deployment'tan önce Supabase migration'ları çalıştır:

### Supabase Dashboard Üzerinden

1. [app.supabase.com](https://app.supabase.com) → Projeyi aç
2. **SQL Editor** → **New Query**
3. Migration dosyalarını sırayla çalıştır:

```sql
-- 1. Testimonials
-- supabase/migrations/add_testimonials_table.sql içeriğini kopyala-yapıştır

-- 2. Storage Buckets
-- supabase/migrations/create_storage_buckets.sql içeriğini kopyala-yapıştır

-- 3. Coupons
-- supabase/migrations/add_coupons_table.sql içeriğini kopyala-yapıştır

-- 4. Purchase Upgrades
-- supabase/migrations/add_purchase_upgrade_fields.sql içeriğini kopyala-yapıştır
```

### Supabase CLI ile (Alternatif)

```bash
# Supabase CLI kur
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Migration'ları çalıştır
supabase db push
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Tüm testler geçiyor (`npm test`)
- [ ] Build başarılı (`npm run build`)
- [ ] Environment variables hazır
- [ ] Supabase migration'ları çalıştırıldı
- [ ] `.env.local` dosyası commit edilmedi
- [ ] Git repository temiz

### Deployment
- [ ] Vercel/Firebase'e deploy edildi
- [ ] Domain bağlandı (opsiyonel)
- [ ] SSL sertifikası aktif
- [ ] Environment variables Vercel'de set edildi

### Post-Deployment
- [ ] Ana sayfa açılıyor
- [ ] Authentication çalışıyor
- [ ] Payment flow test edildi
- [ ] RSVP submission çalışıyor
- [ ] File upload çalışıyor
- [ ] Admin panel erişilebilir
- [ ] Email notifications test edildi (opsiyonel)

### Monitoring
- [ ] Sentry DSN eklendi
- [ ] Vercel Analytics aktif
- [ ] Error tracking çalışıyor
- [ ] Performance monitoring aktif

---

## 🔧 Deployment Sonrası Ayarlar

### 1. Custom Domain Bağlama (Vercel)

```bash
# Vercel dashboard
Settings → Domains → Add Domain
```

Veya CLI ile:
```bash
vercel domains add yourdomain.com
```

**DNS Ayarları:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 2. Environment Variables Güncelleme

Production'da `NEXT_PUBLIC_APP_URL` güncelle:
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Supabase Redirect URLs

Supabase Dashboard → Authentication → URL Configuration:
```
Site URL: https://yourdomain.com
Redirect URLs:
  - https://yourdomain.com/auth/callback
  - https://yourdomain.com/reset-password
```

### 4. Iyzico Production Keys

Test modundan production'a geç:
```bash
IYZICO_BASE_URL=https://api.iyzipay.com
IYZICO_API_KEY=production_api_key
IYZICO_SECRET_KEY=production_secret_key
```

---

## 🐛 Troubleshooting

### Build Hatası
```bash
# Local'de test et
npm run build

# Logs kontrol et
vercel logs
```

### Environment Variables Çalışmıyor
- Vercel dashboard'da doğru set edildiğinden emin ol
- `NEXT_PUBLIC_` prefix'i client-side değişkenler için gerekli
- Redeploy yap

### Database Connection Hatası
- Supabase URL ve keys doğru mu kontrol et
- RLS policies aktif mi kontrol et
- Migration'lar çalıştırıldı mı kontrol et

### Payment Hatası
- Iyzico keys production mu test mi kontrol et
- Callback URL'ler doğru set edilmiş mi kontrol et

---

## 📊 Performance Optimization

### Vercel Edge Functions
Middleware zaten edge'de çalışıyor:
```typescript
// middleware.ts
export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
```

### Image Optimization
Next.js Image component kullan:
```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  width={800}
  height={600}
  alt="Description"
/>
```

### Caching
Vercel otomatik caching yapıyor:
- Static assets: 1 yıl
- API routes: Configurable
- Pages: ISR ile

---

## 🔐 Security Checklist

- [ ] HTTPS aktif (Vercel otomatik)
- [ ] Environment variables güvenli
- [ ] Rate limiting aktif
- [ ] CSP headers set edildi
- [ ] Input sanitization çalışıyor
- [ ] Admin emails production'da set edildi
- [ ] Supabase RLS policies aktif
- [ ] API keys güvenli

---

## 📞 Support

Deployment sırasında sorun yaşarsan:
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Docs](https://supabase.com/docs)

---

## 🎉 Deployment Tamamlandı!

Platform artık live! 🚀

**Next Steps:**
1. Domain'i paylaş
2. İlk admin kullanıcısını oluştur
3. Test invitation oluştur
4. Monitoring'i kontrol et
5. Backup stratejisi kur
