-- 1. FORCE CLEANUP (The Nuclear Option)
-- This deletes the table entirely so we can start fresh.
drop table if exists public.payment_requests cascade;

-- 2. Create Table
create table public.payment_requests (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    transaction_id text not null unique,
    amount numeric not null,
    status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. Enable RLS
alter table public.payment_requests enable row level security;

-- 4. Create Policies (Fresh, no conflicts possible because table was dropped)
create policy "Users can view own requests"
    on public.payment_requests for select
    using (auth.uid() = user_id);

create policy "Users can create requests"
    on public.payment_requests for insert
    with check (auth.uid() = user_id);

-- 5. Grant Permissions
grant all on public.payment_requests to authenticated;
grant all on public.payment_requests to service_role;
