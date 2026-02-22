# 📁 Dosya Konumları

## ✅ Mevcut Dosyalar

### 1. `.env.local` 
**Tam Path:**
```
/Users/ekremmert/Documents/CORVUS_Dijital_davetiye/repo/web-next/.env.local
```

**Göreceli Path:**
```
repo/web-next/.env.local
```

**Not:** `.env.local` dosyası `.gitignore`'da olduğu için bazı IDE'lerde görünmeyebilir. Terminal'den kontrol edin:
```bash
cd repo/web-next
cat .env.local
```

---

### 2. `supabase/schema.sql`
**Tam Path:**
```
/Users/ekremmert/Documents/CORVUS_Dijital_davetiye/repo/web-next/supabase/schema.sql
```

**Göreceli Path:**
```
repo/web-next/supabase/schema.sql
```

**İçerik:** 145 satır SQL (tablolar, RLS policies, triggers)

---

## 🔍 Dosyaları Bulma

### Terminal'den:
```bash
cd /Users/ekremmert/Documents/CORVUS_Dijital_davetiye/repo/web-next

# .env.local kontrol
ls -la .env.local

# schema.sql kontrol
ls -la supabase/schema.sql

# İçerikleri görüntüle
cat .env.local
cat supabase/schema.sql
```

### IDE'de:
1. **VS Code / Cursor:**
   - File Explorer'da `repo/web-next` klasörüne git
   - `.env.local` → Hidden files göster (Cmd+Shift+. on Mac)
   - `supabase/schema.sql` → `supabase` klasörü içinde

2. **Finder (Mac):**
   - `repo/web-next` klasörüne git
   - Cmd+Shift+. (hidden files göster)
   - `.env.local` görünecek

---

## 📋 Dosya İçerikleri

### `.env.local` İçeriği:
```env
NEXT_PUBLIC_SUPABASE_URL="https://ascmdcotrxukamdsftjs.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
NEXT_PUBLIC_APP_URL="http://localhost:4173"
NODE_ENV="development"
```

### `supabase/schema.sql` İçeriği:
- 145 satır SQL
- `invitations` tablosu
- `rsvps` tablosu
- RLS policies
- Triggers ve indexes

---

## ✅ Doğrulama

Dosyaların var olduğunu kontrol edin:
```bash
cd repo/web-next
test -f .env.local && echo "✅ .env.local var" || echo "❌ .env.local yok"
test -f supabase/schema.sql && echo "✅ schema.sql var" || echo "❌ schema.sql yok"
```

---

**Hazırlayan:** Corvus Quant Architect  
**Tarih:** 2026-01-18

