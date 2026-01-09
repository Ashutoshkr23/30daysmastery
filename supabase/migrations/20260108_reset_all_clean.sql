drop table if exists public.payment_requests cascade;

create table public.payment_requests (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    transaction_id text not null unique,
    amount numeric not null,
    status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.payment_requests enable row level security;

create policy "Users can view own requests"
    on public.payment_requests for select
    using (auth.uid() = user_id);

create policy "Users can create requests"
    on public.payment_requests for insert
    with check (auth.uid() = user_id);

grant all on public.payment_requests to authenticated;
grant all on public.payment_requests to service_role;
