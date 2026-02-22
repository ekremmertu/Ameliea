# 🚀 Server Başlatma Kılavuzu

**Tarih:** 2026-01-18  
**Sorun:** Server açılmıyor

---

## ✅ Yapılan Düzeltmeler

1. ✅ `.env.local` dosyası oluşturuldu
2. ✅ Supabase URL ve keys eklendi
3. ✅ Server başlatma komutu hazır

---

## 🧪 Server'ı Başlatma

### 1. Doğru Dizine Git
```bash
cd repo/web-next
```

### 2. Server'ı Başlat
```bash
npm run dev
```

**Beklenen çıktı:**
```
▲ Next.js 16.1.3 (Turbopack)
- Local:         http://localhost:4173
- Network:       http://192.168.1.132:4173
- Environments: .env.local

✓ Starting...
✓ Ready in XXXms
```

### 3. Browser'da Test Et
```
http://localhost:4173/
```
veya
```
http://127.0.0.1:4173/
```

---

## 🔍 Sorun Giderme

### Port Zaten Kullanımda
```bash
# Port'u kullanan process'i bul
lsof -ti:4173

# Process'i kapat
kill -9 $(lsof -ti:4173)

# Tekrar başlat
npm run dev
```

### .env.local Eksik
`.env.local` dosyası `repo/web-next/` dizininde olmalı.

**İçeriği:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://ascmdcotrxukamdsftjs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:4173
NODE_ENV=development
```

---

## 📋 Kontrol Listesi

- [x] `.env.local` dosyası oluşturuldu
- [x] Supabase keys eklendi
- [ ] Server başlatıldı
- [ ] Browser'da test edildi

---

**Status:** ✅ **HAZIR - SERVER BAŞLATILABİLİR**

