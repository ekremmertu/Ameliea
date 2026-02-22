# 🚀 P0 Fix Pack - Setup Guide

**Production-Ready MVP Setup**  
**Tarih:** 2026-01-18

---

## 📋 Özet

Bu P0 Fix Pack, projeyi "demo"dan "production-ready MVP"ye dönüştürür:

✅ **Prisma + PostgreSQL** - Kalıcı veri yönetimi  
✅ **NextAuth.js** - Kimlik doğrulama ve yetkilendirme  
✅ **Zod Validation** - Type-safe environment ve input validation  
✅ **Protected Routes** - Middleware ile route koruması  
✅ **Security Headers** - Production güvenlik standartları  
✅ **API Production Ready** - Error handling, validation, ownership checks

---

## 🛠️ Kurulum Adımları

### 1. Dependencies Kurulumu

```bash
cd repo/web-next
npm install
```

**Yeni Dependencies:**
- `@prisma/client` - Prisma ORM
- `prisma` - Prisma CLI (dev)
- `next-auth` - Authentication
- `@auth/prisma-adapter` - NextAuth Prisma adapter
- `bcryptjs` - Password hashing
- `zod` - Schema validation

---

### 2. Environment Variables

`.env` dosyası oluştur (`.env.example` referans al):

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/digital_invitations?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="http://localhost:4173"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:4173"

# Email (optional for now)
RESEND_API_KEY=""
EMAIL_FROM=""

# Node Environment
NODE_ENV="development"
```

**NEXTAUTH_SECRET oluştur:**
```bash
openssl rand -base64 32
```

---

### 3. PostgreSQL Database Kurulumu

**Option 1: Local PostgreSQL**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Create database
createdb digital_invitations
```

**Option 2: Docker**
```bash
docker run --name postgres-invitations \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=digital_invitations \
  -p 5432:5432 \
  -d postgres:16
```

**Option 3: Cloud (Production)**
- Vercel Postgres
- Supabase
- Railway
- Neon

---

### 4. Prisma Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# OR create migration (production)
npm run db:migrate

# Open Prisma Studio (optional)
npm run db:studio
```

---

### 5. Test

```bash
# Development server
npm run dev

# Type check
npm run type-check

# Build
npm run build
```

---

## 🔐 Authentication Setup

### Kullanıcı Kayıt (İlk Kullanıcı)

Şu an için manuel kayıt gerekli. İleride signup sayfası eklenecek.

**Prisma Studio ile:**
```bash
npm run db:studio
# Users tablosuna manuel ekle
```

**Veya seed script oluştur:**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 📁 Yeni Dosya Yapısı

```
repo/web-next/
├── prisma/
│   └── schema.prisma          # ✅ YENİ - Database schema
├── lib/
│   ├── db.ts                  # ✅ YENİ - Prisma client singleton
│   └── env.ts                 # ✅ YENİ - Environment validation
├── middleware.ts              # ✅ YENİ - Auth + protected routes
├── app/
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts   # ✅ YENİ - NextAuth config
│       ├── health/
│       │   └── route.ts       # ✅ YENİ - Health check
│       ├── invitations/
│       │   ├── create/
│       │   │   └── route.ts   # ✅ GÜNCELLENDİ - Prisma kullanıyor
│       │   └── [slug]/
│       │       ├── route.ts   # ✅ GÜNCELLENDİ - Prisma kullanıyor
│       │       └── rsvps/
│       │           └── route.ts # ✅ GÜNCELLENDİ - Ownership check
│       └── rsvp/
│           └── route.ts       # ✅ GÜNCELLENDİ - Prisma kullanıyor
└── .env.example               # ✅ YENİ - Environment template
```

---

## 🔄 Migration Checklist

### Eski Kod → Yeni Kod

**1. In-Memory Stores Kaldırıldı:**
- ❌ `lib/invitation-store.ts` - Artık kullanılmıyor
- ❌ `lib/rsvp-store.ts` - Artık kullanılmıyor
- ✅ Tüm veriler PostgreSQL'de

**2. API Routes Güncellendi:**
- ✅ `/api/invitations/create` - Auth required, Prisma
- ✅ `/api/invitations/[slug]` - Public, Prisma
- ✅ `/api/invitations/[slug]/rsvps` - Auth + ownership check
- ✅ `/api/rsvp` - Public, Prisma

**3. Dashboard:**
- ⚠️ Dashboard sayfası güncellenmeli (NextAuth kullanmalı)
- Şu an localStorage auth kullanıyor, NextAuth'a geçmeli

---

## 🧪 Test Senaryoları

### 1. Health Check
```bash
curl http://localhost:4173/api/health
# Expected: {"status":"healthy","database":"connected"}
```

### 2. Create Invitation (Auth Required)
```bash
# 1. Login first (NextAuth)
# 2. POST /api/invitations/create
curl -X POST http://localhost:4173/api/invitations/create \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "groomName": "John",
    "brideName": "Jane",
    "weddingDate": "2025-06-15",
    "venueName": "Venue",
    "venueAddress": "123 Street"
  }'
```

### 3. Submit RSVP (Public)
```bash
curl -X POST http://localhost:4173/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Guest",
    "email": "guest@example.com",
    "invitationSlug": "jane-john-1234567890",
    "attending": true,
    "guests": 2
  }'
```

### 4. Get RSVPs (Auth + Ownership)
```bash
curl http://localhost:4173/api/invitations/jane-john-1234567890/rsvps \
  -H "Cookie: next-auth.session-token=..."
```

---

## ⚠️ Önemli Notlar

### FastAPI Devre Dışı
- FastAPI backend artık kullanılmıyor
- Tüm API logic Next.js API Routes'da
- `repo/api/` klasörü artık gereksiz (ileride background jobs için tekrar eklenebilir)

### Authentication
- Dashboard erişimi artık NextAuth ile korumalı
- Ownership check: Sadece davetiye sahibi dashboard'a erişebilir
- Public RSVP endpoint'i hala açık (gerekli)

### Database
- Tüm veriler PostgreSQL'de
- Migration'lar Prisma ile yönetiliyor
- Development: `db:push`, Production: `db:migrate`

---

## 🐛 Troubleshooting

### Prisma Client Generate Hatası
```bash
# Prisma client'ı yeniden generate et
npm run db:generate
```

### Database Connection Hatası
```bash
# DATABASE_URL kontrol et
echo $DATABASE_URL

# PostgreSQL çalışıyor mu?
psql -U postgres -l
```

### NextAuth Secret Hatası
```bash
# NEXTAUTH_SECRET minimum 32 karakter olmalı
openssl rand -base64 32
```

### TypeScript Hataları
```bash
# Type check
npm run type-check

# Prisma types yenile
npm run db:generate
```

---

## 📚 Sonraki Adımlar (P1)

1. **Dashboard Güncelleme** - NextAuth kullan, localStorage kaldır
2. **Signup Sayfası** - Kullanıcı kayıt formu
3. **Email Integration** - Resend/SendGrid ile davetiye gönderimi
4. **QR Code** - Davetiye linki için QR kod
5. **Test Suite** - Unit + E2E testler

---

## ✅ Checklist

- [ ] Dependencies kuruldu
- [ ] `.env` dosyası oluşturuldu
- [ ] PostgreSQL database kuruldu
- [ ] Prisma schema push edildi
- [ ] İlk kullanıcı oluşturuldu
- [ ] Health check çalışıyor
- [ ] Create invitation test edildi
- [ ] RSVP submit test edildi
- [ ] Dashboard auth test edildi

---

**Hazırlayan:** Corvus Quant Architect  
**Versiyon:** 1.0  
**Durum:** ✅ Production-Ready MVP

