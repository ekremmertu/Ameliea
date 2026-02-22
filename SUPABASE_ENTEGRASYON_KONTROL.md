# Supabase entegrasyon kontrolü

## Durum: Entegre

Supabase projede **tam entegre**. Aşağıdaki yapılar kullanılıyor.

---

## 1. Ortam değişkenleri

**Dosya:** `lib/env.ts` (Zod ile doğrulanıyor)

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Evet | Proje URL (örn. https://xxx.supabase.co) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Evet | Anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Hayır | Server-only işlemler için |

**.env.local** içinde bu değerlerin tanımlı olması gerekir. Örnek: `.env.example`

---

## 2. Supabase istemcileri

| Dosya | Kullanım |
|-------|----------|
| `lib/supabase/client.ts` | Tarayıcı (React) – `createSupabaseBrowserClient()` |
| `lib/supabase/server.ts` | API route'ları – `createSupabaseServerClient()` |
| `middleware.ts` | Auth + satın alma kontrolü – `createServerClient` (cookie ile) |

---

## 3. Kullanıldığı yerler

**Auth (giriş / oturum):**
- Login, Register, Header (çıkış), Dashboard, Checkout, Customize, Admin
- Middleware: korumalı sayfalar, satın alma kontrolü

**Veritabanı tabloları:**
- `invitations` – davetiye oluşturma, güncelleme, okuma
- `rsvps` – RSVP kayıtları
- `guest_questions` / `guest_answers` – misafir soruları
- `love_notes` – gelin/damada mesajlar
- `invitation_guests` – (token takibi – şu an kullanılmıyor)
- `purchases` – satın almalar, plan kontrolü

**API route'ları (server Supabase):**
- `/api/invitations/*` (create, [slug], update, guest-questions, guest-answers, love-notes, rsvps, testimonials, tokens, update-slug)
- `/api/rsvp`
- `/api/payments/*`, `/api/purchases/create`
- `/api/health`, `/api/admin/stats`

**Sayfalar (browser Supabase):**
- `/dashboard`, `/admin`, `/checkout`, `/customize/[templateId]`, `/invitation/[slug]/dashboard`
- `Header`, `Pricing`, `LoginForm`, `RegisterForm`
- `lib/purchase.ts` (satın alma kontrolü)

---

## 4. Kontrol listesi

- [ ] `.env.local` dosyası var mı?
- [ ] `NEXT_PUBLIC_SUPABASE_URL` geçerli Supabase proje URL’i mi?
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` doğru anon key mi?
- [ ] Supabase Dashboard’da gerekli tablolar oluşturuldu mu? (invitations, rsvps, purchases, guest_questions, guest_answers, love_notes, invitation_guests)
- [ ] RLS (Row Level Security) politikaları tanımlı mı?
- [ ] Auth etkin mi? (Email/şifre veya tercih ettiğiniz yöntem)

---

## 5. Hızlı test

1. **Kurulum:** `npm run check-setup` — env değişkenlerini kontrol eder.
2. **Bağlantı:** Sunucu açıkken `npm run check-setup:health` veya `GET /api/health` → `database: "connected"`.
3. Giriş yapıp dashboard’a gidebiliyorsanız auth + purchases çalışıyor demektir.
4. Davetiye oluşturup `/invitation/[slug]` açılabiliyorsa invitations + API çalışıyor demektir. Tablo/RLS detayı: **SUPABASE_SCHEMA_RLS.md**.
