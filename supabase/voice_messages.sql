-- Voice messages: table + RLS + Storage policies
-- Run this in Supabase SQL Editor.

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- 1) Table
create table if not exists public.voice_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  content_type text not null,
  created_at timestamp with time zone not null default now(),
  chat_id uuid null,
  duration_ms int null
);

create index if not exists voice_messages_user_id_idx on public.voice_messages (user_id);
create index if not exists voice_messages_created_at_idx on public.voice_messages (created_at desc);

-- 2) RLS
alter table public.voice_messages enable row level security;

drop policy if exists "Users can insert their own voice messages" on public.voice_messages;
create policy "Users can insert their own voice messages"
on public.voice_messages
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can view their own voice messages" on public.voice_messages;
create policy "Users can view their own voice messages"
on public.voice_messages
for select
to authenticated
using (auth.uid() = user_id);

-- Optional (if you later want delete/edit):
-- create policy "Users can delete their own voice messages"
-- on public.voice_messages
-- for delete
-- to authenticated
-- using (auth.uid() = user_id);

-- 3) Storage policies (bucket must exist and be PRIVATE)
-- Bucket name: voice-messages
-- File path format: <uid>/<random>.<ext>

drop policy if exists "Upload own voice files" on storage.objects;
create policy "Upload own voice files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'voice-messages'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Read own voice files" on storage.objects;
create policy "Read own voice files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'voice-messages'
  and (storage.foldername(name))[1] = auth.uid()::text
);

