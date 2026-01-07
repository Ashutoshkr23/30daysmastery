-- 1. Create Payment Requests Table
create table if not exists public.payment_requests (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    transaction_id text not null unique,
    amount numeric not null,
    status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Add is_premium to profiles (assuming you have a public.profiles or public.users table linked to auth.users)
-- If you don't have a profiles table, we can create one or just use metadata.
-- For safety, let's assume we want to store it in a simple 'profiles' table if it exists, or create it.

create table if not exists public.profiles (
    id uuid references auth.users(id) primary key,
    email text,
    is_premium boolean default false
);

-- Trigger to create profile on signup (Optional, if not already present)
-- create or replace function public.handle_new_user()
-- returns trigger as $$
-- begin
--   insert into public.profiles (id, email)
--   values (new.id, new.email);
--   return new;
-- end;
-- $$ language plpgsql security definer;
--
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

-- 3. RLS Policies
alter table public.payment_requests enable row level security;

-- Users can view their own requests
create policy "Users can view own requests"
    on public.payment_requests for select
    using (auth.uid() = user_id);

-- Users can insert their own requests
create policy "Users can create requests"
    on public.payment_requests for insert
    with check (auth.uid() = user_id);

-- Admins can view all (For simplicity, allowing logic in app or specific admin email policies)
-- Ideally you restrict this to your specific email:
-- create policy "Admins can view all"
--    on public.payment_requests for all
--    using (auth.jwt() ->> 'email' = 'your-email@gmail.com');
