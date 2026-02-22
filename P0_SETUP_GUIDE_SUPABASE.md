# 🚀 P0 Setup Guide — Supabase Edition

**Production-Ready MVP Setup**  
**Tarih:** 2026-01-18

---

## 📋 Özet

Bu P0 Fix Pack, projeyi Supabase ile "demo"dan "production-ready MVP"ye dönüştürür:

✅ **Supabase PostgreSQL** - Kalıcı veri yönetimi  
✅ **Supabase Auth** - Magic link authentication  
✅ **Row Level Security (RLS)** - Owner-only dashboard access  
✅ **Zod Validation** - Type-safe environment ve input validation  
✅ **Protected Routes** - Middleware ile route koruması

---

## 🛠️ Kurulum Adımları

### 1. Supabase Project Setup (10 dakika)

#### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name:** digital-invitations (or your choice)
   - **Database Password:** (save this!)
   - **Region:** Choose closest to you
4. Wait for project to be created (~2 minutes)

#### 1.2 Enable Email Auth
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Choose **Magic Link** (recommended) or **Password**
4. Save settings

#### 1.3 Get API Keys
1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (optional, for admin operations - keep secret!)

#### 1.4 Run SQL Schema
1. Go to **SQL Editor**
2. Click **New Query**
3. Copy entire content from `supabase/schema.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Verify: Check **Table Editor** → should see `invitations` and `rsvps` tables

---

### 2. Local Environment Setup

#### 2.1 Create `.env.local` file

```bash
cd repo/web-next
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key_here"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
NEXT_PUBLIC_APP_URL="http://localhost:4173"
NODE_ENV="development"
EOF
```

**Replace:**
- `xxxxx.supabase.co` → Your Supabase project URL
- `your_anon_key_here` → Your anon public key
- `your_service_role_key_here` → Your service role key (optional)

---

### 3. Install Dependencies

```bash
cd repo/web-next
npm install
```

**New Dependencies:**
- `@supabase/ssr` - Supabase SSR support
- `@supabase/supabase-js` - Supabase client
- `zod` - Schema validation (already installed)

**Removed:**
- `@prisma/client`, `prisma` - No longer needed
- `next-auth` - Replaced by Supabase Auth
- `@auth/prisma-adapter` - No longer needed
- `bcryptjs` - No longer needed

---

### 4. Test Setup

```bash
# Start dev server
npm run dev

# In another terminal, test health endpoint
curl http://localhost:4173/api/health
# Expected: {"status":"healthy","database":"connected"}
```

---

### 5. Create First User

#### Option 1: Via Login Page (Recommended)
1. Go to `http://localhost:4173/login`
2. Enter your email
3. Click "Send Link"
4. Check your email
5. Click the magic link
6. You're logged in!

#### Option 2: Via Supabase Dashboard
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter email and password
4. User is created

---

### 6. Test Flow

#### 6.1 Create Invitation
```bash
# First, login via /login page to get session cookie
# Then:
curl -X POST http://localhost:4173/api/invitations/create \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-xxxxx-auth-token=..." \
  -d '{
    "slug": "test-invitation",
    "title": "Test Wedding",
    "host_names": "John & Jane",
    "date_iso": "2025-06-15",
    "location": "123 Wedding Lane",
    "is_published": true
  }'
```

#### 6.2 View Public Invitation
```bash
# Open in browser (no auth required)
http://localhost:4173/invitation/test-invitation
```

#### 6.3 Submit RSVP (Public)
```bash
curl -X POST http://localhost:4173/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-invitation",
    "full_name": "Guest Name",
    "email": "guest@example.com",
    "attendance": "yes",
    "guests_count": 2
  }'
```

#### 6.4 View Dashboard (Owner Only)
```bash
# Open in browser (must be logged in as owner)
http://localhost:4173/invitation/test-invitation/dashboard
# Should show RSVP list
```

---

## 📁 Dosya Yapısı

```
repo/web-next/
├── lib/
│   ├── env.ts                    # ✅ GÜNCELLENDİ - Supabase env vars
│   ├── supabase/
│   │   ├── client.ts            # ✅ YENİ - Browser client
│   │   └── server.ts            # ✅ YENİ - Server client
├── app/
│   ├── login/
│   │   └── page.tsx             # ✅ YENİ - Magic link login
│   ├── api/
│   │   ├── health/
│   │   │   └── route.ts         # ✅ GÜNCELLENDİ - Supabase check
│   │   ├── invitations/
│   │   │   ├── create/
│   │   │   │   └── route.ts     # ✅ GÜNCELLENDİ - Supabase
│   │   │   └── [slug]/
│   │   │       ├── route.ts     # ✅ GÜNCELLENDİ - Supabase
│   │   │       └── rsvps/
│   │   │           └── route.ts # ✅ GÜNCELLENDİ - Supabase
│   │   └── rsvp/
│   │       └── route.ts         # ✅ GÜNCELLENDİ - Supabase
│   └── invitation/
│       └── [slug]/
│           ├── page.tsx         # ✅ GÜNCELLENDİ - Supabase fetch
│           └── dashboard/
│               └── page.tsx     # ✅ GÜNCELLENDİ - Supabase + RLS
├── middleware.ts                 # ✅ GÜNCELLENDİ - Supabase Auth
├── supabase/
│   └── schema.sql               # ✅ YENİ - Database schema + RLS
└── package.json                 # ✅ GÜNCELLENDİ - Supabase deps
```

---

## 🔄 Migration Checklist

### Removed Files
- ❌ `prisma/schema.prisma` - No longer needed
- ❌ `lib/db.ts` - No longer needed
- ❌ `lib/auth.ts` - No longer needed (NextAuth)
- ❌ `app/api/auth/[...nextauth]/route.ts` - No longer needed
- ❌ `components/providers/SessionProvider.tsx` - No longer needed
- ❌ `lib/invitation-store.ts` - Already deleted
- ❌ `lib/rsvp-store.ts` - Already deleted
- ❌ `lib/testimonials-store.ts` - Already deleted

### Updated Files
- ✅ `lib/env.ts` - Supabase env vars
- ✅ `middleware.ts` - Supabase Auth
- ✅ All API routes - Supabase queries
- ✅ Dashboard - Supabase + RLS
- ✅ Public invitation page - Supabase fetch

---

## 🧪 Test Senaryoları

### 1. Health Check
```bash
curl http://localhost:4173/api/health
# Expected: {"status":"healthy","database":"connected"}
```

### 2. Create Invitation (Auth Required)
- Login via `/login`
- POST `/api/invitations/create` with valid data
- Should return 201 with invitation data

### 3. View Public Invitation
- GET `/invitation/[slug]` (no auth)
- Should show invitation if `is_published = true`

### 4. Submit RSVP (Public)
- POST `/api/rsvp` with valid data
- Should return 201
- RSVP should appear in dashboard

### 5. View Dashboard (Owner Only)
- Login as owner
- GET `/invitation/[slug]/dashboard`
- Should show RSVP list
- Try accessing another user's dashboard → Should fail (RLS)

---

## ⚠️ Önemli Notlar

### Row Level Security (RLS)
- **Public invitations:** Anyone can read published invitations
- **Owner access:** Only owner can read/write their invitations
- **RSVP access:** Public can insert, owner can read
- **No manual ownership checks needed** - RLS handles it!

### Magic Link Auth
- User enters email → receives link → clicks link → logged in
- No password needed
- Session stored in cookies (handled by Supabase)

### Service Role Key
- **NEVER expose to client**
- Only use in server-side admin operations
- Has bypass RLS permissions
- Keep in `.env.local` (not committed to git)

---

## 🐛 Troubleshooting

### "Invalid API key"
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after changing env vars

### "Row Level Security policy violation"
- Check user is authenticated (for owner operations)
- Check invitation `is_published = true` (for public read)
- Check RLS policies are created (run `schema.sql`)

### "Invitation not found"
- Check invitation exists in Supabase
- Check `is_published = true` for public access
- Check slug matches exactly

### Magic link not working
- Check email provider is enabled in Supabase
- Check spam folder
- Check email redirect URL matches `NEXT_PUBLIC_APP_URL`

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Email auth enabled
- [ ] SQL schema run successfully
- [ ] `.env.local` created with correct keys
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server runs (`npm run dev`)
- [ ] Health check works
- [ ] First user created (via login page)
- [ ] Test invitation created
- [ ] Public invitation page works
- [ ] RSVP submission works
- [ ] Dashboard access works (owner only)

---

## 🎯 Sonraki Adımlar (P1)

1. **Email Integration** - Send invitation emails via Supabase Edge Functions
2. **QR Code** - Generate QR codes for invitation links
3. **Test Suite** - Unit + E2E tests
4. **Analytics** - Track invitation views, RSVP rates

---

**Hazırlayan:** Corvus Quant Architect  
**Versiyon:** 1.0 (Supabase Edition)  
**Durum:** ✅ **Production-Ready MVP**

