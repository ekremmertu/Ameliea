# 🚀 Hemen Deploy Et

## Adım 1: Vercel Login

Terminal'de şu komutu çalıştırın:

```bash
cd /Users/ekremmert/Documents/CORVUS_Dijital_davetiye/repo/web-next
npx vercel login
```

Bu komut sizi tarayıcıda Vercel login sayfasına yönlendirecek. Login olduktan sonra terminal'e dönün.

## Adım 2: Production Deploy

Login sonrası şu komutu çalıştırın:

```bash
npx vercel --prod
```

Vercel size birkaç soru soracak:
- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → Vercel hesabınızı seçin
- **Link to existing project?** → `N` (No - yeni proje) veya `Y` (varsa mevcut projeyi seçin)
- **Project name?** → `web-next` veya istediğiniz isim
- **Directory?** → `./` (mevcut dizin)

## Adım 3: Environment Variables

Deploy sonrası Vercel Dashboard'a gidin ve Environment Variables ekleyin:

**Vercel Dashboard → Project → Settings → Environment Variables**

Ekleyin:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (deploy sonrası verilen URL)
- `IYZICO_API_KEY`
- `IYZICO_SECRET_KEY`
- `IYZICO_BASE_URL` (production: `https://api.iyzipay.com`)
- `NODE_ENV=production`

## Hızlı Komutlar

```bash
# Login
npx vercel login

# Deploy
npx vercel --prod

# Environment variables ekle (deploy sonrası Vercel Dashboard'dan)
```

---

**Not:** Build zaten başarılı, sadece Vercel'e deploy etmeniz gerekiyor! ✅

