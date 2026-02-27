# Database Schema Information

## Current Setup

This project uses **Supabase** (PostgreSQL) as the database, NOT Prisma ORM.

The Prisma schema file has been removed as it was not being used and was causing confusion.

## Database Schema Location

The actual database schema is defined in:
- **`/supabase/schema.sql`** - Complete SQL schema with tables, indexes, and RLS policies

## Why Supabase Instead of Prisma?

1. **Supabase Auth Integration** - Built-in authentication with Row Level Security (RLS)
2. **Real-time Subscriptions** - WebSocket support for live updates
3. **Storage** - Built-in file storage for images, videos, and audio
4. **Edge Functions** - Serverless functions at the edge
5. **Auto-generated REST API** - Instant API without writing code

## Database Tables

### Core Tables
- `invitations` - Wedding invitation details
- `rsvps` - Guest RSVP responses
- `guest_questions` - Custom questions from invitation owners
- `guest_answers` - Answers from guests
- `invitation_guests` - Token-based guest access
- `love_notes` - Messages from guests to the couple
- `purchases` - User purchase records

### Authentication Tables (Supabase Auth)
- `auth.users` - User accounts
- `auth.sessions` - Active sessions
- `auth.identities` - OAuth provider identities

## Making Schema Changes

To modify the database schema:

1. **Using Supabase Dashboard:**
   - Go to https://app.supabase.com
   - Navigate to SQL Editor
   - Run your SQL migration

2. **Using Migration Files:**
   - Create a new SQL file in `/supabase/migrations/`
   - Run it through Supabase CLI or Dashboard

3. **Example Migration:**
   ```sql
   -- Add a new column
   ALTER TABLE invitations ADD COLUMN new_field TEXT;
   
   -- Create an index
   CREATE INDEX idx_invitations_new_field ON invitations(new_field);
   
   -- Add RLS policy
   CREATE POLICY "Users can read their own invitations"
   ON invitations FOR SELECT
   TO authenticated
   USING (owner_id = auth.uid());
   ```

## Row Level Security (RLS)

All tables have RLS enabled. Policies are defined in `/supabase/schema.sql`.

### Key Policies:
- **Invitations**: Owners can CRUD their own invitations, public can read published ones
- **RSVPs**: Public can insert for published invitations, owners can read/delete
- **Guest Questions**: Owners can manage, public can read for published invitations
- **Purchases**: Users can read their own purchases

## Accessing the Database

### From API Routes (Server-side):
```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server';

const supabase = await createSupabaseServerClient();
const { data, error } = await supabase
  .from('invitations')
  .select('*')
  .eq('slug', 'my-wedding');
```

### From Client Components:
```typescript
import { createSupabaseClient } from '@/lib/supabase/client';

const supabase = createSupabaseClient();
const { data, error } = await supabase
  .from('invitations')
  .select('*')
  .eq('is_published', true);
```

## Backup and Recovery

1. **Automatic Backups**: Supabase provides daily backups (check your plan)
2. **Manual Backup**: Export via Supabase Dashboard or pg_dump
3. **Point-in-Time Recovery**: Available on Pro plan and above

## Useful Commands

```bash
# Connect to Supabase database (requires Supabase CLI)
supabase db remote commit

# Generate TypeScript types from database
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

# Run migrations
supabase db push
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
