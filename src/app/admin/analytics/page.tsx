"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    TrendingUp,
    Users,
    DollarSign,
    Target,
    Activity,
    Calendar,
    Award,
    BarChart3
} from "lucide-react";
import Link from "next/link";
import {
    getConversionFunnelStats,
    getRevenueStats,
    getEngagementStats
} from "@/lib/analytics";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
}

function MetricCard({ title, value, subtitle, icon, trend, trendUp }: MetricCardProps) {
    return (
        <GlassCard className="p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-zinc-400 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
                    {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
                    {trend && (
                        <p className={`text-xs mt-2 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </p>
                    )}
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg">
                    {icon}
                </div>
            </div>
        </GlassCard>
    );
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [funnelStats, setFunnelStats] = useState<any>(null);
    const [revenueStats, setRevenueStats] = useState<any>(null);
    const [engagementStats, setEngagementStats] = useState<any>(null);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const [funnel, revenue, engagement] = await Promise.all([
                getConversionFunnelStats(),
                getRevenueStats(),
                getEngagementStats()
            ]);

            setFunnelStats(funnel);
            setRevenueStats(revenue);
            setEngagementStats(engagement);
        } catch (error) {
            console.error("Analytics loading error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            {/* Header */}
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
                        Analytics Dashboard
                    </h1>
                    <p className="text-zinc-400">Track your monetization funnel and user engagement</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/admin" className="text-sm underline text-zinc-400 hover:text-white">
                        Payment Requests
                    </Link>
                    <Link href="/dashboard" className="text-sm underline text-zinc-400 hover:text-white">
                        Back to App
                    </Link>
                </div>
            </header>

            {/* Revenue Metrics */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-green-400" />
                    Revenue Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Revenue"
                        value={`₹${revenueStats?.total_revenue || 0}`}
                        icon={<DollarSign className="h-6 w-6 text-green-400" />}
                    />
                    <MetricCard
                        title="Today's Revenue"
                        value={`₹${revenueStats?.today_revenue || 0}`}
                        icon={<TrendingUp className="h-6 w-6 text-amber-400" />}
                    />
                    <MetricCard
                        title="Total Conversions"
                        value={revenueStats?.total_conversions || 0}
                        subtitle="Premium users"
                        icon={<Award className="h-6 w-6 text-purple-400" />}
                    />
                    <MetricCard
                        title="ARPU"
                        value={`₹${revenueStats?.arpu || 0}`}
                        subtitle="Average Revenue Per User"
                        icon={<BarChart3 className="h-6 w-6 text-blue-400" />}
                    />
                </div>
            </section>

            {/* Conversion Funnel */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Target className="h-6 w-6 text-amber-400" />
                    Conversion Funnel
                </h2>
                <GlassCard className="p-6">
                    <div className="space-y-4">
                        {/* Funnel visualization */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <FunnelStage
                                label="Total Users"
                                count={funnelStats?.total_users || 0}
                                percentage={100}
                                color="bg-blue-500"
                            />
                            <FunnelStage
                                label="Viewed Upgrade"
                                count={funnelStats?.viewed_upgrade || 0}
                                percentage={funnelStats?.total_users > 0
                                    ? ((funnelStats?.viewed_upgrade / funnelStats?.total_users) * 100).toFixed(1)
                                    : 0}
                                color="bg-purple-500"
                            />
                            <FunnelStage
                                label="Initiated Payment"
                                count={funnelStats?.initiated_payment || 0}
                                percentage={funnelStats?.total_users > 0
                                    ? ((funnelStats?.initiated_payment / funnelStats?.total_users) * 100).toFixed(1)
                                    : 0}
                                color="bg-amber-500"
                            />
                            <FunnelStage
                                label="Submitted UTR"
                                count={funnelStats?.submitted_utr || 0}
                                percentage={funnelStats?.total_users > 0
                                    ? ((funnelStats?.submitted_utr / funnelStats?.total_users) * 100).toFixed(1)
                                    : 0}
                                color="bg-orange-500"
                            />
                            <FunnelStage
                                label="Approved"
                                count={funnelStats?.approved || 0}
                                percentage={funnelStats?.total_users > 0
                                    ? ((funnelStats?.approved / funnelStats?.total_users) * 100).toFixed(1)
                                    : 0}
                                color="bg-green-500"
                            />
                        </div>

                        {/* Key metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                            <div className="text-center">
                                <p className="text-sm text-zinc-400 mb-1">Overall Conversion Rate</p>
                                <p className="text-2xl font-bold text-green-400">{funnelStats?.conversion_rate || 0}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-zinc-400 mb-1">Approval Rate</p>
                                <p className="text-2xl font-bold text-amber-400">{funnelStats?.approval_rate || 0}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-zinc-400 mb-1">Rejected</p>
                                <p className="text-2xl font-bold text-red-400">{funnelStats?.rejected || 0}</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </section>

            {/* User Engagement */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Activity className="h-6 w-6 text-blue-400" />
                    User Engagement
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Users"
                        value={engagementStats?.total_users || 0}
                        icon={<Users className="h-6 w-6 text-blue-400" />}
                    />
                    <MetricCard
                        title="DAU"
                        value={engagementStats?.dau || 0}
                        subtitle="Daily Active Users"
                        icon={<Calendar className="h-6 w-6 text-green-400" />}
                    />
                    <MetricCard
                        title="WAU"
                        value={engagementStats?.wau || 0}
                        subtitle="Weekly Active Users"
                        icon={<Calendar className="h-6 w-6 text-amber-400" />}
                    />
                    <MetricCard
                        title="MAU"
                        value={engagementStats?.mau || 0}
                        subtitle="Monthly Active Users"
                        icon={<Calendar className="h-6 w-6 text-purple-400" />}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <MetricCard
                        title="Premium Users"
                        value={engagementStats?.premium_users || 0}
                        subtitle={`${engagementStats?.total_users > 0
                            ? ((engagementStats?.premium_users / engagementStats?.total_users) * 100).toFixed(1)
                            : 0}% of total`}
                        icon={<Award className="h-6 w-6 text-amber-400" />}
                    />
                    <MetricCard
                        title="Avg Practice Sessions"
                        value={engagementStats?.avg_practice_sessions || 0}
                        subtitle="Per user"
                        icon={<Activity className="h-6 w-6 text-blue-400" />}
                    />
                    <MetricCard
                        title="Avg Days Completed"
                        value={engagementStats?.avg_days_completed || 0}
                        subtitle="Per user"
                        icon={<TrendingUp className="h-6 w-6 text-green-400" />}
                    />
                </div>
            </section>
        </div>
    );
}

interface FunnelStageProps {
    label: string;
    count: number;
    percentage: number | string;
    color: string;
}

function FunnelStage({ label, count, percentage, color }: FunnelStageProps) {
    return (
        <div className="relative">
            <div className={`${color} bg-opacity-20 border-2 border-current rounded-lg p-4 text-center`}>
                <p className="text-xs text-zinc-400 mb-2">{label}</p>
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-sm text-zinc-300 mt-1">{percentage}%</p>
            </div>
        </div>
    );
}
