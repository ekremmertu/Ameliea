# 🚀 Deploy Talimatları

**Tarih:** 2026-01-18  
**Build Status:** ✅ **BAŞARILI**

---

## ✅ Build Kontrolü

Build başarıyla tamamlandı:
- ✅ TypeScript check passed
- ✅ Tüm route'lar oluşturuldu
- ✅ Static ve dynamic sayfalar hazır

---

## 🚀 Vercel Deploy Adımları

### Seçenek 1: Vercel CLI ile (Önerilen)

```bash
cd /Users/ekremmert/Documents/CORVUS_Dijital_davetiye/repo/web-next

# 1. Vercel'e login olun
npx vercel login

# 2. Production'a deploy edin
npx vercel --prod
```

### Seçenek 2: Vercel Dashboard ile

1. [vercel.com](https://vercel.com) → Login
2. **Add New Project** → **Import Git Repository**
3. Repository'yi seçin veya manuel upload yapın
4. **Environment Variables** ekleyin (aşağıdaki liste)
5. **Deploy** butonuna tıklayın

---

## 🔐 Gerekli Environment Variables

Vercel Dashboard → Project Settings → Environment Variables:

### Zorunlu:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Iyzico (Ödeme için):
```
IYZICO_API_KEY=your_iyzico_api_key
IYZICO_SECRET_KEY=your_iyzico_secret_key
IYZICO_BASE_URL=https://api.iyzipay.com
```

### Admin (Opsiyonel):
```
ADMIN_EMAILS=admin@example.com,admin2@example.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

### Google Maps (Opsiyonel):
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Node Environment:
```
NODE_ENV=production
```

---

## 📋 Deploy Öncesi Kontrol Listesi

- [x] Build başarılı
- [x] TypeScript hataları yok
- [x] Tüm environment variables hazır
- [ ] Vercel'e login yapıldı
- [ ] Environment variables Vercel'de ayarlandı
- [ ] Deploy tamamlandı

---

## 🧪 Deploy Sonrası Test

1. **Ana Sayfa:** `https://your-app.vercel.app`
2. **Health Check:** `https://your-app.vercel.app/api/health`
3. **Register:** `https://your-app.vercel.app/register`
4. **Login:** `https://your-app.vercel.app/login`
5. **Checkout:** `https://your-app.vercel.app/checkout?plan=premium`

---

## ⚠️ Önemli Notlar

1. **Iyzico:** Production için `IYZICO_BASE_URL` değerini `https://api.iyzipay.com` olarak güncelleyin
2. **Supabase:** Production URL'ini `NEXT_PUBLIC_APP_URL`'e ekleyin
3. **CORS:** Supabase'de production URL'ini allowed origins'a ekleyin
4. **Domain:** Custom domain eklemek için Vercel Dashboard → Settings → Domains

---

## 🔄 Hızlı Deploy Komutu

```bash
cd /Users/ekremmert/Documents/CORVUS_Dijital_davetiye/repo/web-next
npx vercel login
npx vercel --prod
```

---

**Status:** ✅ **DEPLOY İÇİN HAZIR**

