-- Migration: Create Storage Buckets for File Uploads
-- Date: 2024
-- Description: Creates storage buckets for images, videos, and audio files

-- Create invitation-images bucket
insert into storage.buckets (id, name, public)
values ('invitation-images', 'invitation-images', true)
on conflict (id) do nothing;

-- Create invitation-videos bucket
insert into storage.buckets (id, name, public)
values ('invitation-videos', 'invitation-videos', true)
on conflict (id) do nothing;

-- Create invitation-audio bucket
insert into storage.buckets (id, name, public)
values ('invitation-audio', 'invitation-audio', true)
on conflict (id) do nothing;

-- Storage policies for invitation-images

-- Allow authenticated users to upload images
drop policy if exists "Users can upload images" on storage.objects;
create policy "Users can upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'invitation-images' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read all public images
drop policy if exists "Public can read images" on storage.objects;
create policy "Public can read images"
on storage.objects for select
to public
using (bucket_id = 'invitation-images');

-- Allow users to update their own images
drop policy if exists "Users can update their images" on storage.objects;
create policy "Users can update their images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'invitation-images' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
drop policy if exists "Users can delete their images" on storage.objects;
create policy "Users can delete their images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'invitation-images' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for invitation-videos

-- Allow authenticated users to upload videos
drop policy if exists "Users can upload videos" on storage.objects;
create policy "Users can upload videos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'invitation-videos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read all public videos
drop policy if exists "Public can read videos" on storage.objects;
create policy "Public can read videos"
on storage.objects for select
to public
using (bucket_id = 'invitation-videos');

-- Allow users to update their own videos
drop policy if exists "Users can update their videos" on storage.objects;
create policy "Users can update their videos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'invitation-videos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own videos
drop policy if exists "Users can delete their videos" on storage.objects;
create policy "Users can delete their videos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'invitation-videos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for invitation-audio

-- Allow authenticated users to upload audio
drop policy if exists "Users can upload audio" on storage.objects;
create policy "Users can upload audio"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'invitation-audio' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read all public audio
drop policy if exists "Public can read audio" on storage.objects;
create policy "Public can read audio"
on storage.objects for select
to public
using (bucket_id = 'invitation-audio');

-- Allow users to update their own audio
drop policy if exists "Users can update their audio" on storage.objects;
create policy "Users can update their audio"
on storage.objects for update
to authenticated
using (
  bucket_id = 'invitation-audio' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own audio
drop policy if exists "Users can delete their audio" on storage.objects;
create policy "Users can delete their audio"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'invitation-audio' and
  (storage.foldername(name))[1] = auth.uid()::text
);
