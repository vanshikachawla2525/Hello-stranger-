-- =========================================================================
-- Supabase Schema & Row-Level Security (RLS) Setup
-- For Vanshika Chawla - 19 October Website ("hello, stranger.")
--
-- REPLACE owner@example.com BELOW WITH YOUR REAL ADMIN EMAIL (appears 3 times)
--
-- Run this in your Supabase Dashboard: SQL Editor -> New query -> Run
-- =========================================================================

-- 1. Create the 'content' table (holds published JSON document)
create table if not exists public.content (
  id text primary key default 'published',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Insert initial seed row so publishing never fails on missing row
insert into public.content (id, data)
values ('published', '{}'::jsonb)
on conflict (id) do nothing;

-- 3. Enable Row Level Security (RLS) on 'content'
alter table public.content enable row level security;

-- 4. Policy: Public can read published content (visitors and anon)
drop policy if exists "Public can read published content" on public.content;
create policy "Public can read published content"
  on public.content
  for select
  to anon, authenticated
  using (true);

-- 5. Policy: Only owner can write/update/delete content (1st email replacement)
drop policy if exists "Authenticated admin can update content" on public.content;
drop policy if exists "Owner can write content" on public.content;
create policy "Owner can write content"
  on public.content
  for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'owner@example.com');

-- =========================================================================
-- Storage Bucket Setup for Images
-- =========================================================================

-- 6. Create the 'images' storage bucket (public so images display on site)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- 7. Storage RLS: Public can view images
drop policy if exists "Public can view images" on storage.objects;
create policy "Public can view images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'images');

-- 8. Storage RLS: Owner can upload images (2nd email replacement)
drop policy if exists "Authenticated admin can upload images" on storage.objects;
drop policy if exists "Owner can upload images" on storage.objects;
create policy "Owner can upload images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'images' and (auth.jwt() ->> 'email') = 'owner@example.com');

-- 9. Storage RLS: Owner can update and delete images (3rd email replacement)
drop policy if exists "Authenticated admin can update images" on storage.objects;
drop policy if exists "Authenticated admin can delete images" on storage.objects;
drop policy if exists "Owner can update or delete images" on storage.objects;
create policy "Owner can update or delete images"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'images' and (auth.jwt() ->> 'email') = 'owner@example.com');

-- =========================================================================
-- IMPORTANT SECURITY SETTING:
-- In your Supabase Dashboard, navigate to:
-- Authentication -> Providers -> Email
-- Turn OFF "Allow new users to sign up"
-- =========================================================================
