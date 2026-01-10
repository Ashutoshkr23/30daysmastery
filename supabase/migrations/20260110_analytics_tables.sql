-- Analytics System Tables
-- Created: 2026-01-10
-- Purpose: Track user events, metrics, and conversion funnel for monetization analytics

-- ============================================================================
-- 1. ANALYTICS EVENTS TABLE
-- ============================================================================
-- Raw event tracking for all user interactions
create table if not exists public.analytics_events (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id),
    session_id text,
    event_type text not null,
    event_category text, -- 'monetization', 'engagement', 'navigation', etc.
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now()
);

-- Index for faster queries
create index if not exists idx_analytics_events_user_id on public.analytics_events(user_id);
create index if not exists idx_analytics_events_type on public.analytics_events(event_type);
create index if not exists idx_analytics_events_created_at on public.analytics_events(created_at);
create index if not exists idx_analytics_events_category on public.analytics_events(event_category);

-- ============================================================================
-- 2. USER METRICS TABLE
-- ============================================================================
-- Aggregated user statistics for quick access
create table if not exists public.user_metrics (
    user_id uuid references auth.users(id) primary key,
    
    -- Engagement metrics
    total_practice_sessions integer default 0,
    total_questions_answered integer default 0,
    total_practice_time_seconds integer default 0,
    days_completed integer default 0,
    current_streak integer default 0,
    best_streak integer default 0,
    
    -- Premium tracking
    is_premium boolean default false,
    premium_converted_at timestamptz,
    days_to_conversion integer, -- Days from signup to premium
    
    -- Activity tracking
    first_seen_at timestamptz default now(),
    last_seen_at timestamptz default now(),
    total_sessions integer default 0,
    
    updated_at timestamptz default now()
);

-- ============================================================================
-- 3. CONVERSION FUNNEL TABLE
-- ============================================================================
-- Track users through the monetization funnel
create table if not exists public.conversion_funnel (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    
    -- Funnel stages with timestamps
    viewed_upgrade_modal_at timestamptz,
    initiated_payment_at timestamptz,
    submitted_utr_at timestamptz,
    payment_approved_at timestamptz,
    payment_rejected_at timestamptz,
    
    -- Metadata
    utr_code text,
    amount numeric,
    rejection_reason text,
    
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    
    -- Ensure one funnel record per user
    unique(user_id)
);

-- ============================================================================
-- 4. DAILY AGGREGATES TABLE (for performance)
-- ============================================================================
-- Pre-aggregated daily stats for faster dashboard queries
create table if not exists public.daily_analytics (
    id uuid default gen_random_uuid() primary key,
    date date not null unique,
    
    -- User metrics
    total_users integer default 0,
    new_users integer default 0,
    active_users integer default 0,
    premium_users integer default 0,
    
    -- Conversion metrics
    upgrade_modal_views integer default 0,
    payment_initiations integer default 0,
    utr_submissions integer default 0,
    payment_approvals integer default 0,
    
    -- Revenue
    revenue_amount numeric default 0,
    
    -- Engagement
    total_practice_sessions integer default 0,
    total_questions_answered integer default 0,
    
    created_at timestamptz default now()
);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

alter table public.analytics_events enable row level security;
alter table public.user_metrics enable row level security;
alter table public.conversion_funnel enable row level security;
alter table public.daily_analytics enable row level security;

-- Users can view their own events
create policy "Users can view own events"
    on public.analytics_events for select
    using (auth.uid() = user_id);

-- Users can insert their own events
create policy "Users can create events"
    on public.analytics_events for insert
    with check (auth.uid() = user_id);

-- Users can view their own metrics
create policy "Users can view own metrics"
    on public.user_metrics for select
    using (auth.uid() = user_id);

-- Users can update their own metrics
create policy "Users can update own metrics"
    on public.user_metrics for update
    using (auth.uid() = user_id);

-- Users can insert their own metrics
create policy "Users can insert own metrics"
    on public.user_metrics for insert
    with check (auth.uid() = user_id);

-- Users can view their own funnel
create policy "Users can view own funnel"
    on public.conversion_funnel for select
    using (auth.uid() = user_id);

-- Users can update their own funnel
create policy "Users can update own funnel"
    on public.conversion_funnel for update
    using (auth.uid() = user_id);

-- Users can insert their own funnel
create policy "Users can insert own funnel"
    on public.conversion_funnel for insert
    with check (auth.uid() = user_id);

-- Daily analytics are read-only for all authenticated users
create policy "Authenticated users can view daily analytics"
    on public.daily_analytics for select
    to authenticated
    using (true);

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to update user metrics timestamp
create or replace function update_user_metrics_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger user_metrics_updated_at
    before update on public.user_metrics
    for each row
    execute function update_user_metrics_timestamp();

-- Function to update conversion funnel timestamp
create or replace function update_conversion_funnel_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger conversion_funnel_updated_at
    before update on public.conversion_funnel
    for each row
    execute function update_conversion_funnel_timestamp();
