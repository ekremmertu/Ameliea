-- Supabase SQL Schema for Digital Invitations App
-- Run this in Supabase SQL Editor

-- Enable extensions if needed
create extension if not exists pgcrypto;

-- Invitations table
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  host_names text,
  date_iso text,
  location text,
  hero_image_url text,
  language text not null default 'tr',
  template_id text,
  theme_id text not null default 'elegant', -- 'elegant', 'modern', 'romantic', 'classic', 'minimal'
  theme_config jsonb, -- Tema özel ayarlar
  is_published boolean not null default true,
  require_token boolean not null default false, -- Token zorunlu mu?
  default_token text, -- Varsayılan token (herkes kullanabilir)
  expires_at timestamptz, -- NULL = sınırsız (default)
  max_uses int, -- NULL = sınırsız (default)
  current_uses int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RSVPs table
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  attendance text not null check (attendance in ('yes','no','maybe')),
  guests_count int not null default 1 check (guests_count between 1 and 20),
  note text,
  selected_events text[], -- Array of event names the guest selected
  created_at timestamptz not null default now()
);

-- Guest Questions table (questions created by invitation owner)
create table if not exists public.guest_questions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  question text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

-- Guest Answers table (answers from guests)
create table if not exists public.guest_answers (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  rsvp_id uuid references public.rsvps(id) on delete cascade,
  question_id uuid not null references public.guest_questions(id) on delete cascade,
  answer text not null,
  created_at timestamptz not null default now(),
  unique(rsvp_id, question_id) -- One answer per question per RSVP
);

-- Invitation Guests table (token-based access)
create table if not exists public.invitation_guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  token text not null unique, -- 32 karakter random token
  guest_name text,
  guest_email text,
  status text not null default 'pending' check (status in ('pending', 'opened', 'responded')),
  opened_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

-- Updated_at trigger function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for invitations updated_at
drop trigger if exists trg_invitations_updated_at on public.invitations;
create trigger trg_invitations_updated_at
before update on public.invitations
for each row execute function public.set_updated_at();

-- Indexes
create index if not exists idx_invitations_owner on public.invitations(owner_id);
create index if not exists idx_invitations_slug on public.invitations(slug);
create index if not exists idx_rsvps_invitation on public.rsvps(invitation_id);
create index if not exists idx_rsvps_created_at on public.rsvps(created_at desc);
create index if not exists idx_guest_questions_invitation on public.guest_questions(invitation_id);
create index if not exists idx_guest_answers_invitation on public.guest_answers(invitation_id);
create index if not exists idx_guest_answers_rsvp on public.guest_answers(rsvp_id);
create index if not exists idx_guest_answers_question on public.guest_answers(question_id);
create index if not exists idx_invitation_guests_invitation on public.invitation_guests(invitation_id);
create index if not exists idx_invitation_guests_token on public.invitation_guests(token);
create index if not exists idx_invitation_guests_status on public.invitation_guests(status);

-- Enable Row Level Security
alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;
alter table public.guest_questions enable row level security;
alter table public.guest_answers enable row level security;
alter table public.invitation_guests enable row level security;

-- INVITATIONS policies

-- Owner can read their invitations
drop policy if exists "invitations_owner_select" on public.invitations;
create policy "invitations_owner_select"
on public.invitations
for select
to authenticated
using (owner_id = auth.uid());

-- Owner can insert invitations (owner_id must equal auth.uid)
drop policy if exists "invitations_owner_insert" on public.invitations;
create policy "invitations_owner_insert"
on public.invitations
for insert
to authenticated
with check (owner_id = auth.uid());

-- Owner can update invitations
drop policy if exists "invitations_owner_update" on public.invitations;
create policy "invitations_owner_update"
on public.invitations
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Owner can delete invitations
drop policy if exists "invitations_owner_delete" on public.invitations;
create policy "invitations_owner_delete"
on public.invitations
for delete
to authenticated
using (owner_id = auth.uid());

-- PUBLIC: Anyone can read published invitation by slug (for the public invite page)
drop policy if exists "invitations_public_read_published" on public.invitations;
create policy "invitations_public_read_published"
on public.invitations
for select
to anon
using (is_published = true);

-- RSVPS policies

-- Public can insert RSVP only for published invitations (via join)
drop policy if exists "rsvps_public_insert_published" on public.rsvps;
create policy "rsvps_public_insert_published"
on public.rsvps
for insert
to anon
with check (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.is_published = true
  )
);

-- Owner can read RSVPs for invitations they own
drop policy if exists "rsvps_owner_select" on public.rsvps;
create policy "rsvps_owner_select"
on public.rsvps
for select
to authenticated
using (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
);

-- Owner can delete RSVPs for their invitations (optional)
drop policy if exists "rsvps_owner_delete" on public.rsvps;
create policy "rsvps_owner_delete"
on public.rsvps
for delete
to authenticated
using (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
);

-- GUEST_QUESTIONS policies

-- Owner can manage questions for their invitations
drop policy if exists "guest_questions_owner_all" on public.guest_questions;
create policy "guest_questions_owner_all"
on public.guest_questions
for all
to authenticated
using (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
);

-- Public can read questions for published invitations
drop policy if exists "guest_questions_public_read" on public.guest_questions;
create policy "guest_questions_public_read"
on public.guest_questions
for select
to anon
using (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.is_published = true
  )
);

-- GUEST_ANSWERS policies

-- Public can insert answers for published invitations
drop policy if exists "guest_answers_public_insert" on public.guest_answers;
create policy "guest_answers_public_insert"
on public.guest_answers
for insert
to anon
with check (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.is_published = true
  )
);

-- Owner can read answers for their invitations
drop policy if exists "guest_answers_owner_select" on public.guest_answers;
create policy "guest_answers_owner_select"
on public.guest_answers
for select
to authenticated
using (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
);

-- INVITATION_GUESTS policies

-- Owner can manage guests for their invitations
drop policy if exists "invitation_guests_owner_all" on public.invitation_guests;
create policy "invitation_guests_owner_all"
on public.invitation_guests
for all
to authenticated
using (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
);

-- Public can read their own token (for tracking)
drop policy if exists "invitation_guests_public_read_token" on public.invitation_guests;
create policy "invitation_guests_public_read_token"
on public.invitation_guests
for select
to anon
using (true); -- Token ile kontrol edilecek (middleware'de)

-- Purchases table (for tracking user purchases)
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_type text not null check (plan_type in ('light', 'premium')),
  status text not null default 'completed' check (status in ('pending', 'completed', 'cancelled', 'refunded')),
  amount decimal(10, 2) not null,
  currency text not null default 'TRY',
  payment_method text,
  payment_provider text, -- 'stripe', 'paypal', 'manual', etc.
  transaction_id text,
  purchased_at timestamptz not null default now(),
  expires_at timestamptz, -- NULL = lifetime access (premium), 1 month for light
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for purchases
create index if not exists idx_purchases_user on public.purchases(user_id);
create index if not exists idx_purchases_status on public.purchases(status);
create index if not exists idx_purchases_user_status on public.purchases(user_id, status);

-- Updated_at trigger for purchases
drop trigger if exists trg_purchases_updated_at on public.purchases;
create trigger trg_purchases_updated_at
before update on public.purchases
for each row execute function public.set_updated_at();

-- Enable RLS for purchases
alter table public.purchases enable row level security;

-- Purchases policies

-- Users can read their own purchases
drop policy if exists "purchases_user_select" on public.purchases;
create policy "purchases_user_select"
on public.purchases
for select
to authenticated
using (user_id = auth.uid());

-- Users can insert their own purchases (for manual purchases)
drop policy if exists "purchases_user_insert" on public.purchases;
create policy "purchases_user_insert"
on public.purchases
for insert
to authenticated
with check (user_id = auth.uid());

-- Admin can read all purchases (via service role)
-- No policy needed - service role bypasses RLS

-- Love Notes table (messages from guests to the couple)
create table if not exists public.love_notes (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  rsvp_id uuid references public.rsvps(id) on delete cascade,
  guest_name text not null,
  guest_email text,
  message text not null,
  created_at timestamptz not null default now()
);

-- Indexes for love_notes
create index if not exists idx_love_notes_invitation on public.love_notes(invitation_id);
create index if not exists idx_love_notes_rsvp on public.love_notes(rsvp_id);
create index if not exists idx_love_notes_created_at on public.love_notes(created_at desc);

-- Enable RLS for love_notes
alter table public.love_notes enable row level security;

-- Love Notes policies

-- Public can insert love notes for published invitations
drop policy if exists "love_notes_public_insert" on public.love_notes;
create policy "love_notes_public_insert"
on public.love_notes
for insert
to anon
with check (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.is_published = true
  )
);

-- Owner can read love notes for their invitations
drop policy if exists "love_notes_owner_select" on public.love_notes;
create policy "love_notes_owner_select"
on public.love_notes
for select
to authenticated
using (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
);

-- Testimonials table (guest testimonials/reviews - requires approval)
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null,
  message text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for testimonials
create index if not exists idx_testimonials_invitation on public.testimonials(invitation_id);
create index if not exists idx_testimonials_approved on public.testimonials(approved);
create index if not exists idx_testimonials_created_at on public.testimonials(created_at desc);

-- Updated_at trigger for testimonials
drop trigger if exists trg_testimonials_updated_at on public.testimonials;
create trigger trg_testimonials_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

-- Enable RLS for testimonials
alter table public.testimonials enable row level security;

-- Testimonials policies

-- Public can insert testimonials for published invitations (will be pending approval)
drop policy if exists "testimonials_public_insert" on public.testimonials;
create policy "testimonials_public_insert"
on public.testimonials
for insert
to anon
with check (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.is_published = true
  )
);

-- Public can read approved testimonials for published invitations
drop policy if exists "testimonials_public_select_approved" on public.testimonials;
create policy "testimonials_public_select_approved"
on public.testimonials
for select
to anon
using (
  approved = true and exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.is_published = true
  )
);

-- Owner can read all testimonials for their invitations
drop policy if exists "testimonials_owner_select" on public.testimonials;
create policy "testimonials_owner_select"
on public.testimonials
for select
to authenticated
using (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
);

-- Owner can update testimonials for their invitations (approve/reject)
drop policy if exists "testimonials_owner_update" on public.testimonials;
create policy "testimonials_owner_update"
on public.testimonials
for update
to authenticated
using (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
);

-- Owner can delete testimonials for their invitations
drop policy if exists "testimonials_owner_delete" on public.testimonials;
create policy "testimonials_owner_delete"
on public.testimonials
for delete
to authenticated
using (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
);

