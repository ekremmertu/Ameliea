# 🧪 P0 Smoke Test Checklist - Satışa Hazır Doğrulama

**Hedef:** Mevcut akışları çalışır hale getirme (yeni özellik yok)  
**Tarih:** 2026-01-18

---

## ✅ 1. Supabase Tarafı (3 Ayar)

### A) SQL Çalıştırıldı ✅
- ✅ `supabase/schema.sql` çalıştırıldı
- ✅ Tablolar oluşturuldu: `invitations`, `rsvps`
- ✅ RLS policies aktif

### B) Auth Redirect URLs ⏳
**Kontrol edilmeli:**
- Supabase → Authentication → URL Configuration
- Site URL: `https://domain.com` (prod) veya `http://localhost:4173` (local)
- Redirect URLs:
  - `https://domain.com/**`
  - `http://localhost:4173/**`

### C) Email Provider ⏳
**Kontrol edilmeli:**
- Supabase → Authentication → Providers → Email
- ✅ Enabled olmalı
- Magic Link veya OTP seçili olmalı

---

## ✅ 2. Next.js Env Variables

### `.env.local` ✅
```env
NEXT_PUBLIC_SUPABASE_URL="https://ascmdcotrxukamdsftjs.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
NEXT_PUBLIC_APP_URL="http://localhost:4173"
SUPABASE_SERVICE_ROLE_KEY="eyJ..." (server-side only)
```

**Status:** ✅ Tüm env'ler set

---

## 🧪 3. Smoke Test (5 Test)

### Test 1: Build & Start ⏳
```bash
npm install
npm run build
npm run start
```
**Status:** ⏳ Test ediliyor...

### Test 2: Login (Magic Link) ⏳
**Akış:**
1. `/login` → email gir
2. Magic link gelsin
3. Tıkla → siteye dön

**Kontrol:**
- Auth cookie set edilmeli
- Session oluşmalı

**Status:** ⏳ Test ediliyor...

### Test 3: Davetiye Oluşturma ⏳
**Akış:**
- `/customize/[templateId]` sayfasından form submit
- `POST /api/invitations/create` çağrısı
- Slug üret → response OK

**Kontrol:**
- Supabase `invitations` tablosunda kayıt görünmeli

**Dosya:** `app/customize/[templateId]/page.tsx` (line 109)

**Status:** ⏳ Test ediliyor...

### Test 4: Public Invitation ⏳
**Akış:**
- `/invitation/[slug]` aç
- Public sayfa yayındaysa davetiye verisini çek

**Kontrol:**
- RLS: anon select published çalışmalı
- API: `GET /api/invitations/[slug]`

**Dosya:** `app/invitation/[slug]/page.tsx` (line 63)

**Status:** ⏳ Test ediliyor...

### Test 5: RSVP Submit ⏳
**Akış:**
- Public sayfadan RSVP gönder
- `POST /api/rsvp`

**Kontrol:**
- Supabase `rsvps` tablosuna düşmeli

**Status:** ⏳ Test ediliyor...

### Test 6: Dashboard Ownership ⏳
**Akış:**
1. Owner: `/invitation/[slug]/dashboard` → görür
2. Çıkış yap
3. Farklı kullanıcı ile giriş
4. Aynı dashboard → görünmemeli

**Kontrol:**
- RLS owner-only policy çalışmalı
- Middleware redirect çalışmalı

**Status:** ⏳ Test ediliyor...

---

## 🐛 4. Bilinen Hatalar ve Çözümler

### Hata 1: Magic link tıklayınca boş sayfa / dönmüyor
**Çözüm:**
- Supabase Site URL + Redirect URLs kontrol et
- `NEXT_PUBLIC_APP_URL` doğru mu kontrol et

### Hata 2: Dashboard sürekli login'e atıyor
**Çözüm:**
- Middleware cookie set/get problemi
- Matcher path: `/invitation/:path*/dashboard/:path*` (✅ doğru)

### Hata 3: Public invitation 404 / data null
**Çözüm:**
- `is_published=true` kontrol et
- RLS policy `invitations_public_read_published` kontrol et

### Hata 4: RSVP insert 401/permission
**Çözüm:**
- RLS policy `rsvps_public_insert_published` kontrol et
- Join şartı: `invitation.is_published = true`

---

## 📋 5. Final Checklist

- [x] Supabase SQL + RLS run ✅
- [ ] Auth redirect URLs (kontrol edilmeli)
- [x] Vercel env'ler girildi ✅
- [ ] Build + start başarılı (test ediliyor)
- [ ] 5 smoke test geçti (test ediliyor)

---

**Status:** ⏳ **TEST EDİLİYOR...**

