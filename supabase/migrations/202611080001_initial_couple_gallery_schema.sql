-- Initial schema. The live project has this migration applied.
create extension if not exists pgcrypto;
create table if not exists public.couples (
 id uuid primary key default gen_random_uuid(),
 name text not null default 'Our memories' check (char_length(name) between 1 and 80),
 invite_code text not null unique default upper(encode(gen_random_bytes(5),'hex')),
 created_by uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create table if not exists public.couple_members (
 couple_id uuid not null references public.couples(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 display_name text not null default '',
 joined_at timestamptz not null default now(),
 primary key(couple_id,user_id), unique(user_id)
);
create table if not exists public.photos (
 id uuid primary key default gen_random_uuid(),
 couple_id uuid not null references public.couples(id) on delete cascade,
 uploaded_by uuid not null references auth.users(id) on delete cascade,
 storage_path text not null,
 caption text not null default '' check(char_length(caption)<=2000),
 taken_at date not null default current_date,
 location_name text, latitude double precision, longitude double precision,
 voice_note_path text, unlock_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(latitude is null or latitude between -90 and 90),
 check(longitude is null or longitude between -180 and 180)
);
create table if not exists public.photo_comments (
 id uuid primary key default gen_random_uuid(),
 photo_id uuid not null references public.photos(id) on delete cascade,
 couple_id uuid not null references public.couples(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 body text not null check(char_length(body) between 1 and 500),
 created_at timestamptz not null default now()
);
create table if not exists public.photo_reactions (
 id uuid primary key default gen_random_uuid(),
 photo_id uuid not null references public.photos(id) on delete cascade,
 couple_id uuid not null references public.couples(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 reaction text not null default 'heart' check(reaction='heart'),
 created_at timestamptz not null default now(), unique(photo_id,user_id)
);
create table if not exists public.special_dates (
 id uuid primary key default gen_random_uuid(),
 couple_id uuid not null references public.couples(id) on delete cascade,
 title text not null check(char_length(title) between 1 and 100),
 event_date date not null, repeats_yearly boolean not null default true,
 created_by uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
