-- Create a table for the Traveler Guide content
-- This will store the entire JSON structure of the guide
create table guide_config (
  id bigint primary key generated always as identity,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resort_name text,
  resort_address text,
  content jsonb not null default '{}'::jsonb
);

-- Insert the initial default row (we only need one row for the single guide)
insert into guide_config (resort_name, resort_address, content)
values ('CHALET ST-ADÈLE', '123 Chemin du Sommet, QC', '{}'::jsonb);

-- FIX: Add home_image column if it was missed
alter table guide_config add column if not exists home_image text;

-- FIX: Add section_order column for reordering
alter table guide_config add column if not exists section_order jsonb;

-- Create a table for Finance Entries (Expenses/Revenue)
create table finance_entries (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  description text not null,
  amount numeric not null,
  type text not null check (type in ('revenue', 'expense')),
  category text,
  platform text -- e.g., 'airbnb', 'booking', 'manual'
);

-- Enable RLS (Row Level Security) but allow public access for this prototype phase
-- (In a real production app, we would restrict 'write' to authenticated users)
alter table guide_config enable row level security;
create policy "Allow public read guide" on guide_config for select using (true);
create policy "Allow public update guide" on guide_config for update using (true);

alter table finance_entries enable row level security;
create policy "Allow public access finance" on finance_entries for all using (true);

-- ==============================================================================
-- PHASE 2 MIGRATION: AUTHENTICATION & CORE DATA
-- ==============================================================================

-- 1. CHALETS PROPERTIES
create table chalets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null, -- Links to the logged-in user
  name text not null,
  location text,
  base_night_price numeric default 0,
  description text,
  connections jsonb default '{}'::jsonb -- For external platform links
);

alter table chalets enable row level security;

-- Policy: Users can only see/edit their own chalets
create policy "Users can view own chalets" on chalets for select using (auth.uid() = user_id);
create policy "Users can insert own chalets" on chalets for insert with check (auth.uid() = user_id);
create policy "Users can update own chalets" on chalets for update using (auth.uid() = user_id);
create policy "Users can delete own chalets" on chalets for delete using (auth.uid() = user_id);


-- 2. BOOKINGS
create table bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null, -- Owner of the booking data
  chalet_id uuid references chalets(id) on delete cascade not null,
  guest_name text,
  check_in date,
  check_out date,
  total_revenue numeric,
  status text default 'confirmed',
  platform text default 'direct'
);

alter table bookings enable row level security;

-- Policy: Users can only see/edit their own bookings
create policy "Users can view own bookings" on bookings for select using (auth.uid() = user_id);
create policy "Users can insert own bookings" on bookings for insert with check (auth.uid() = user_id);
create policy "Users can update own bookings" on bookings for update using (auth.uid() = user_id);
create policy "Users can delete own bookings" on bookings for delete using (auth.uid() = user_id);


-- 3. PROFILES (Optional, for user metadata like Name/Avatar)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  role text default 'owner'
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger to create profile on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- PHASE 4: STORAGE & FILE UPLOADS
-- ==============================================================================

-- 1. Create the Bucket (if not exists)
insert into storage.buckets (id, name, public)
values ('guide-images', 'guide-images', true)
on conflict (id) do nothing;

-- 2. Allow Public Access to Images (Read)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'guide-images' );

-- 3. Allow Authenticated Users to Upload Images
create policy "Authenticated Users can Upload"
on storage.objects for insert
with check (
  bucket_id = 'guide-images'
  and auth.role() = 'authenticated'
);

-- 4. Allow Users to Update/Delete their own files (Optional but good)
create policy "Users can update own images"
on storage.objects for update
using ( auth.uid() = owner )
with check ( bucket_id = 'guide-images' );

create policy "Users can delete own images"
on storage.objects for delete
using ( auth.uid() = owner and bucket_id = 'guide-images' );

-- ==============================================================================
-- PHASE 5: OVERRIDES FOR SYNCHRONIZATION API
-- ==============================================================================
-- Since the Serverless APIs are running with the Anon Key currently, we need
-- to temporarily allow them to insert and update bookings.
-- (Ideally, provide SUPABASE_SERVICE_ROLE_KEY in .env instead of this override)

create policy "Allow anonymous insert for sync" on bookings for insert with check (true);
create policy "Allow anonymous update for sync" on bookings for update using (true);


-- ==============================================================================
-- PHASE 6: HOUSEKEEPING (MÉNAGE)
-- ==============================================================================

create table cleaning_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  chalet_id uuid references chalets(id) on delete cascade not null,
  booking_id uuid references bookings(id) on delete cascade,
  date date not null,
  status text default 'pending', -- 'pending', 'in_progress', 'completed'
  notes text,
  auto_generated boolean default false
);

alter table cleaning_tasks enable row level security;

-- Setup RLS (allow public access like bookings for the prototype/sync, or restricted)
create policy "Allow public access cleaning_tasks" on cleaning_tasks for all using (true);

-- Trigger Function: Auto-create cleaning task on check-out
create or replace function public.auto_generate_cleaning_task()
returns trigger as $$
begin
  -- If it's a new booking or an updated booking where the checkout date changed
  if (TG_OP = 'INSERT') or (TG_OP = 'UPDATE' and old.check_out is distinct from new.check_out) then
    
    -- Insert or update the cleaning task for this specific booking
    insert into public.cleaning_tasks (chalet_id, booking_id, date, auto_generated, status)
    values (new.chalet_id, new.id, new.check_out, true, 'pending')
    on conflict do nothing; -- We need a unique constraint to avoid duplicates if we want UPSERT, or we can just delete and recreate

  end if;
  return new;
end;
$$ language plpgsql security definer;

-- First, let's make sure we don't duplicate auto-generated tasks for the same booking
alter table cleaning_tasks add constraint unique_booking_cleaning unique (booking_id);

-- Update the function to use UPSERT now that we have a unique constraint
create or replace function public.auto_generate_cleaning_task()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') or (TG_OP = 'UPDATE' and old.check_out is distinct from new.check_out) then
    insert into public.cleaning_tasks (chalet_id, booking_id, date, auto_generated, status)
    values (new.chalet_id, new.id, new.check_out, true, 'pending')
    on conflict (booking_id) do update set date = EXCLUDED.date;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger to bookings table
drop trigger if exists on_booking_upsert_cleaning on bookings;
create trigger on_booking_upsert_cleaning
  after insert or update on bookings
  for each row execute procedure public.auto_generate_cleaning_task();
