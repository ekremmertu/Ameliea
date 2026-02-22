# 🔐 Supabase Auth Ayarları

**Tarih:** 2026-01-18  
**Hedef:** Password authentication + Email confirmation OFF

---

## ✅ Supabase Dashboard'da Yapılacaklar

### 1. Authentication → Providers → Email

**Ayar:**
- ✅ **Enable Email provider:** Açık
- ✅ **Confirm email:** **KAPALI** (OFF)
- ✅ **Secure email change:** İsteğe bağlı

**Neden:** Email onaylamayı kapatıyoruz, kullanıcı direkt giriş yapabilsin.

---

### 2. Authentication → URL Configuration

**Site URL:**
```
http://localhost:4173
```

**Redirect URLs:**
```
http://localhost:4173/**
http://127.0.0.1:4173/**
```

**Production için:**
```
https://yourdomain.com/**
```

---

### 3. Authentication → Email Templates (Opsiyonel)

**Email bildirimlerini kapatmak için:**
- ✅ **Confirm signup:** KAPALI (zaten email confirmation kapalı)
- ✅ **Magic Link:** KAPALI (artık kullanmıyoruz)
- ✅ **Change Email Address:** İsteğe bağlı
- ✅ **Reset Password:** Açık kalabilir (şifre unutma için)

---

## 🧪 Test

### 1. Kayıt Ol
```
http://localhost:4173/register
```

**Form:**
- Ad: Test
- Soyad: User
- Email: test@example.com
- Telefon: (opsiyonel)
- Şifre: Test123!@#
- Şifre Tekrar: Test123!@#

**Beklenen:**
- ✅ Kayıt başarılı
- ✅ Otomatik login
- ✅ Ana sayfaya yönlendirme
- ✅ Email onayı GEREKMİYOR

---

### 2. Giriş Yap
```
http://localhost:4173/login
```

**Form:**
- Email: test@example.com
- Şifre: Test123!@#

**Beklenen:**
- ✅ Giriş başarılı
- ✅ Ana sayfaya yönlendirme

---

## 📋 Kontrol Listesi

- [ ] Supabase Dashboard → Auth → Providers → Email → Confirm email: **KAPALI**
- [ ] Supabase Dashboard → Auth → URL Configuration → Site URL ve Redirect URLs ayarlandı
- [ ] Kayıt sayfası test edildi (`/register`)
- [ ] Login sayfası test edildi (`/login`)
- [ ] Otomatik login çalışıyor
- [ ] Email onayı gerekmemeli

---

**Status:** ⏳ **SUPABASE DASHBOARD'DA AYARLAR YAPILMALI**

