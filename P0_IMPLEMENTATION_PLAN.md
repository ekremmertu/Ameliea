# P0 Fix Pack - Implementation Plan

## 1. Current Repo Structure Summary

### ✅ Already Implemented (From Previous P0 Fix Pack)
- `prisma/schema.prisma` - Database schema exists
- `lib/db.ts` - Prisma client singleton exists
- `lib/env.ts` - Zod environment validation exists
- `middleware.ts` - NextAuth middleware exists
- `app/api/auth/[...nextauth]/route.ts` - NextAuth config exists
- `app/api/health/route.ts` - Health check exists
- `components/providers/SessionProvider.tsx` - Session provider exists
- `app/layout.tsx` - SessionProvider integrated
- `app/invitation/[slug]/dashboard/page.tsx` - Uses NextAuth
- Most API routes updated to use Prisma

### ❌ Still Using In-Memory Stores
- `app/api/invitations/[slug]/update-slug/route.ts` - Still uses `invitationStore`
- `lib/invitation-store.ts` - Empty file, should be removed
- `lib/rsvp-store.ts` - Empty file, should be removed
- `lib/testimonials-store.ts` - May also need checking

### 📦 Dependencies Status
- ✅ `@prisma/client`, `prisma` - Installed
- ✅ `next-auth`, `@auth/prisma-adapter` - Installed
- ✅ `bcryptjs`, `zod` - Installed

---

## 2. Architecture Choice

**Selected: Option B - Prisma + NextAuth**

**Rationale:**
- Prisma schema already exists and is well-structured
- NextAuth v5 already configured
- Dependencies already installed
- Most code already migrated
- Only need to finish migration (update-slug route + cleanup)

---

## 3. Files to Create/Modify

### Files to MODIFY:
1. ✅ `app/api/invitations/[slug]/update-slug/route.ts` - Migrate to Prisma + Auth
2. ✅ `app/api/invitations/[slug]/testimonials/route.ts` - Check if needs Prisma
3. ✅ `app/api/invitations/[slug]/testimonials/[id]/route.ts` - Check if needs Prisma

### Files to DELETE:
4. ❌ `lib/invitation-store.ts` - Remove (no longer needed)
5. ❌ `lib/rsvp-store.ts` - Remove (no longer needed)
6. ❌ `lib/testimonials-store.ts` - Remove if not used

### Files to VERIFY (already exist, check if correct):
7. ✅ `prisma/schema.prisma` - Verify models are correct
8. ✅ `lib/db.ts` - Verify Prisma client setup
9. ✅ `lib/env.ts` - Verify environment validation
10. ✅ `app/api/invitations/create/route.ts` - Verify uses Prisma + Auth
11. ✅ `app/api/invitations/[slug]/route.ts` - Verify uses Prisma
12. ✅ `app/api/invitations/[slug]/rsvps/route.ts` - Verify uses Prisma + Ownership
13. ✅ `app/api/rsvp/route.ts` - Verify uses Prisma

### Files to CREATE:
14. ✅ `.env.example` - Environment template (if not exists)
15. ✅ `P0_MIGRATION_COMPLETE.md` - Final checklist

---

## 4. Implementation Steps

1. **Update update-slug route** - Migrate to Prisma + Auth + Ownership check
2. **Check testimonials routes** - Migrate if needed
3. **Remove in-memory stores** - Delete unused files
4. **Verify all API routes** - Ensure no store imports remain
5. **Create .env.example** - If missing
6. **Run typecheck** - Verify TypeScript
7. **Run lint** - Verify code quality
8. **Test build** - Verify production build works

---

## 5. Verification Checklist

- [ ] All API routes use Prisma (no invitationStore/rsvpStore)
- [ ] All protected routes have auth checks
- [ ] All dashboard routes have ownership checks
- [ ] Environment variables validated with Zod
- [ ] In-memory stores removed
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Build succeeds
- [ ] Health endpoint works

---

**Status:** Ready to implement

