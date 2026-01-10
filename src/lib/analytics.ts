/**
 * Analytics Service
 * Tracks user events, metrics, and conversion funnel
 */

import { createClient } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type EventCategory = 'monetization' | 'engagement' | 'navigation' | 'practice' | 'admin';

export interface AnalyticsEvent {
    event_type: string;
    event_category: EventCategory;
    metadata?: Record<string, any>;
}

export interface PracticeSessionMetrics {
    day: number;
    mode: 'speed_drill' | 'arena' | 'custom_gym';
    questions_answered: number;
    correct_answers: number;
    duration_seconds: number;
    completed: boolean;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

let sessionId: string | null = null;

function getSessionId(): string {
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return sessionId;
}

// ============================================================================
// CORE EVENT TRACKING
// ============================================================================

/**
 * Track a generic analytics event
 * @param event - The event to track
 * @param userId - Optional user ID (recommended to pass from component to avoid session issues)
 */
export async function trackEvent(event: AnalyticsEvent, userId?: string): Promise<void> {
    try {
        const supabase = createClient();

        // Use provided userId or try to get from session
        let finalUserId = userId;

        if (!finalUserId) {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                console.warn('Analytics: No user found, skipping event tracking. Pass userId parameter to avoid this.');
                return;
            }
            finalUserId = user.id;
        }

        const { error: insertError } = await supabase.from('analytics_events').insert({
            user_id: finalUserId,
            session_id: getSessionId(),
            event_type: event.event_type,
            event_category: event.event_category,
            metadata: event.metadata || {}
        });

        if (insertError) {
            console.error('Analytics: Error inserting event:', insertError);
        }

        // Update last_seen_at in user_metrics
        await updateLastSeen(finalUserId);

    } catch (error) {
        console.error('Analytics tracking error:', error);
    }
}

/**
 * Track page view
 */
export async function trackPageView(page: string, metadata?: Record<string, any>, userId?: string): Promise<void> {
    await trackEvent({
        event_type: 'page_view',
        event_category: 'navigation',
        metadata: { page, ...metadata }
    }, userId);
}

// ============================================================================
// MONETIZATION FUNNEL TRACKING
// ============================================================================

/**
 * Track upgrade modal view
 */
export async function trackUpgradeModalView(userId?: string): Promise<void> {
    await trackEvent({
        event_type: 'upgrade_modal_viewed',
        event_category: 'monetization'
    }, userId);

    // Update conversion funnel
    await updateConversionFunnel('viewed_upgrade_modal_at', userId);
}

/**
 * Track payment initiation (user starts entering UTR)
 */
export async function trackPaymentInitiated(userId?: string): Promise<void> {
    await trackEvent({
        event_type: 'payment_initiated',
        event_category: 'monetization'
    }, userId);

    await updateConversionFunnel('initiated_payment_at', userId);
}

/**
 * Track UTR submission
 */
export async function trackUTRSubmitted(utr: string, amount: number, userId?: string): Promise<void> {
    await trackEvent({
        event_type: 'utr_submitted',
        event_category: 'monetization',
        metadata: { utr, amount }
    }, userId);

    const supabase = createClient();

    // Use provided userId or get from session
    let finalUserId = userId;
    if (!finalUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) finalUserId = user.id;
    }

    if (finalUserId) {
        await supabase.from('conversion_funnel')
            .upsert({
                user_id: finalUserId,
                submitted_utr_at: new Date().toISOString(),
                utr_code: utr,
                amount
            }, { onConflict: 'user_id' });
    }
}

/**
 * Track payment approval (called from admin)
 */
export async function trackPaymentApproved(userId: string): Promise<void> {
    const supabase = createClient();

    // Update conversion funnel
    await supabase.from('conversion_funnel')
        .update({ payment_approved_at: new Date().toISOString() })
        .eq('user_id', userId);

    // Update user metrics
    const { data: userMetric } = await supabase
        .from('user_metrics')
        .select('first_seen_at')
        .eq('user_id', userId)
        .single();

    if (userMetric) {
        const daysToConversion = Math.floor(
            (Date.now() - new Date(userMetric.first_seen_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        await supabase.from('user_metrics')
            .upsert({
                user_id: userId,
                is_premium: true,
                premium_converted_at: new Date().toISOString(),
                days_to_conversion: daysToConversion
            }, { onConflict: 'user_id' });
    }
}

/**
 * Track payment rejection (called from admin)
 */
export async function trackPaymentRejected(userId: string, reason?: string): Promise<void> {
    const supabase = createClient();

    await supabase.from('conversion_funnel')
        .update({
            payment_rejected_at: new Date().toISOString(),
            rejection_reason: reason
        })
        .eq('user_id', userId);
}

/**
 * Update conversion funnel stage
 */
async function updateConversionFunnel(stage: string, userId?: string): Promise<void> {
    try {
        const supabase = createClient();

        // Use provided userId or get from session
        let finalUserId = userId;
        if (!finalUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) finalUserId = user.id;
        }

        if (!finalUserId) return;

        await supabase.from('conversion_funnel')
            .upsert({
                user_id: finalUserId,
                [stage]: new Date().toISOString()
            }, { onConflict: 'user_id' });

    } catch (error) {
        console.error('Conversion funnel update error:', error);
    }
}

// ============================================================================
// ENGAGEMENT TRACKING
// ============================================================================

/**
 * Track practice session
 */
export async function trackPracticeSession(metrics: PracticeSessionMetrics): Promise<void> {
    await trackEvent({
        event_type: 'practice_session_completed',
        event_category: 'practice',
        metadata: metrics
    });

    // Update user metrics
    await updateUserMetrics({
        total_practice_sessions: 1,
        total_questions_answered: metrics.questions_answered,
        total_practice_time_seconds: metrics.duration_seconds
    });
}

/**
 * Track day completion
 */
export async function trackDayCompleted(day: number): Promise<void> {
    await trackEvent({
        event_type: 'day_completed',
        event_category: 'engagement',
        metadata: { day }
    });

    await updateUserMetrics({ days_completed: 1 });
}

/**
 * Track premium gate encounter
 */
export async function trackPremiumGateEncounter(location: string): Promise<void> {
    await trackEvent({
        event_type: 'premium_gate_encountered',
        event_category: 'monetization',
        metadata: { location }
    });
}

// ============================================================================
// USER METRICS MANAGEMENT
// ============================================================================

/**
 * Initialize user metrics on first visit
 */
export async function initializeUserMetrics(): Promise<void> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Check if metrics exist
        const { data: existing } = await supabase
            .from('user_metrics')
            .select('user_id, total_sessions')
            .eq('user_id', user.id)
            .single();

        if (!existing) {
            await supabase.from('user_metrics').insert({
                user_id: user.id,
                total_sessions: 1
            });
        } else {
            // Increment session count
            await supabase.from('user_metrics')
                .update({ total_sessions: (existing.total_sessions || 0) + 1 })
                .eq('user_id', user.id);
        }
    } catch (error) {
        console.error('User metrics initialization error:', error);
    }
}

/**
 * Update user metrics (incremental)
 */
async function updateUserMetrics(updates: Partial<{
    total_practice_sessions: number;
    total_questions_answered: number;
    total_practice_time_seconds: number;
    days_completed: number;
}>): Promise<void> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Get current metrics
        const { data: current } = await supabase
            .from('user_metrics')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (current) {
            // Increment values
            const updatedMetrics: any = {};

            if (updates.total_practice_sessions) {
                updatedMetrics.total_practice_sessions = (current.total_practice_sessions || 0) + updates.total_practice_sessions;
            }
            if (updates.total_questions_answered) {
                updatedMetrics.total_questions_answered = (current.total_questions_answered || 0) + updates.total_questions_answered;
            }
            if (updates.total_practice_time_seconds) {
                updatedMetrics.total_practice_time_seconds = (current.total_practice_time_seconds || 0) + updates.total_practice_time_seconds;
            }
            if (updates.days_completed) {
                updatedMetrics.days_completed = (current.days_completed || 0) + updates.days_completed;
            }

            await supabase.from('user_metrics')
                .update(updatedMetrics)
                .eq('user_id', user.id);
        }
    } catch (error) {
        console.error('User metrics update error:', error);
    }
}

/**
 * Update last seen timestamp
 */
async function updateLastSeen(userId: string): Promise<void> {
    try {
        const supabase = createClient();
        await supabase.from('user_metrics')
            .upsert({
                user_id: userId,
                last_seen_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
    } catch (error) {
        // Silently fail - not critical
    }
}

// ============================================================================
// ANALYTICS QUERIES (for dashboard)
// ============================================================================

/**
 * Get conversion funnel stats
 */
export async function getConversionFunnelStats() {
    const supabase = createClient();

    const { data: funnelData } = await supabase
        .from('conversion_funnel')
        .select('*');

    if (!funnelData) return null;

    const stats = {
        total_users: funnelData.length,
        viewed_upgrade: funnelData.filter(f => f.viewed_upgrade_modal_at).length,
        initiated_payment: funnelData.filter(f => f.initiated_payment_at).length,
        submitted_utr: funnelData.filter(f => f.submitted_utr_at).length,
        approved: funnelData.filter(f => f.payment_approved_at).length,
        rejected: funnelData.filter(f => f.payment_rejected_at).length
    };

    return {
        ...stats,
        conversion_rate: stats.total_users > 0 ? (stats.approved / stats.total_users * 100).toFixed(2) : 0,
        approval_rate: stats.submitted_utr > 0 ? (stats.approved / stats.submitted_utr * 100).toFixed(2) : 0
    };
}

/**
 * Get revenue stats
 */
export async function getRevenueStats() {
    const supabase = createClient();

    const { data: payments } = await supabase
        .from('payment_requests')
        .select('amount, status, created_at')
        .eq('status', 'approved');

    if (!payments) return null;

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const today = new Date().toISOString().split('T')[0];
    const todayRevenue = payments
        .filter(p => p.created_at.startsWith(today))
        .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
        total_revenue: totalRevenue,
        today_revenue: todayRevenue,
        total_conversions: payments.length,
        arpu: payments.length > 0 ? (totalRevenue / payments.length).toFixed(2) : 0
    };
}

/**
 * Get engagement stats
 */
export async function getEngagementStats() {
    const supabase = createClient();

    const { data: metrics } = await supabase
        .from('user_metrics')
        .select('*');

    if (!metrics) return null;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
        total_users: metrics.length,
        dau: metrics.filter(m => new Date(m.last_seen_at) > oneDayAgo).length,
        wau: metrics.filter(m => new Date(m.last_seen_at) > sevenDaysAgo).length,
        mau: metrics.filter(m => new Date(m.last_seen_at) > thirtyDaysAgo).length,
        premium_users: metrics.filter(m => m.is_premium).length,
        avg_practice_sessions: (metrics.reduce((sum, m) => sum + (m.total_practice_sessions || 0), 0) / metrics.length).toFixed(1),
        avg_days_completed: (metrics.reduce((sum, m) => sum + (m.days_completed || 0), 0) / metrics.length).toFixed(1)
    };
}
