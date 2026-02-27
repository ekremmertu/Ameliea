-- Migration: Add Testimonials Table
-- Date: 2024
-- Description: Adds testimonials table for guest testimonials/reviews with approval workflow

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
