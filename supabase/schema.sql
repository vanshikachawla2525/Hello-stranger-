-- =========================================================================
-- Supabase Schema & Row-Level Security (RLS) Setup
-- For Vanshika Chawla - 19 October Website
-- Run this in your Supabase Dashboard: SQL Editor -> New query -> Run
-- =========================================================================

-- 1. Create the 'content' table (holds published JSON document)
create table if not exists public.content (
  id text primary key default 'published',
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS) on 'content'
alter table public.content enable row level security;

-- 3. Policy: Public site can read published content (all visitors)
drop policy if exists "Public can read published content" on public.content;
create policy "Public can read published content"
  on public.content
  for select
  to anon, authenticated
  using (true);

-- 4. Policy: Only authenticated admin can insert/update/delete content
drop policy if exists "Authenticated admin can update content" on public.content;
create policy "Authenticated admin can update content"
  on public.content
  for all
  to authenticated
  using (true)
  with check (true);

-- =========================================================================
-- Storage Bucket Setup for Images
-- =========================================================================

-- 5. Create the 'images' storage bucket (public so images display on site)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- 6. Storage RLS: Public can view images
drop policy if exists "Public can view images" on storage.objects;
create policy "Public can view images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'images');

-- 7. Storage RLS: Authenticated admin can upload images
drop policy if exists "Authenticated admin can upload images" on storage.objects;
create policy "Authenticated admin can upload images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'images');

-- 8. Storage RLS: Authenticated admin can update images
drop policy if exists "Authenticated admin can update images" on storage.objects;
create policy "Authenticated admin can update images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'images');

-- 9. Storage RLS: Authenticated admin can delete images
drop policy if exists "Authenticated admin can delete images" on storage.objects;
create policy "Authenticated admin can delete images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'images');
