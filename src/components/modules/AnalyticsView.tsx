"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getAnalyticsData } from "@/lib/actions/analytics"; // We will create this
import { Loader2, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Sub-Components ---

// 1. Heatmap (GitHub Style)
const ActivityHeatmap = ({ data }: { data: Record<string, number> }) => {
    // Generate last 120 days for display
    const days = Array.from({ length: 120 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (119 - i));
        return d.toISOString().split('T')[0];
    });

    return (
        <div className="flex flex-wrap gap-1 w-full justify-end">
            {days.map(date => {
                const count = data[date] || 0;
                let colorClass = "bg-white/5"; // Level 0
                if (count > 0) colorClass = "bg-primary/30"; // Level 1
                if (count > 2) colorClass = "bg-primary/60"; // Level 2
                if (count > 5) colorClass = "bg-primary"; // Level 3

                return (
                    <div
                        key={date}
                        title={`${date}: ${count} activities`}
                        className={cn("w-3 h-3 rounded-sm transition-all hover:scale-125 hover:z-10", colorClass)}
                    />
                );
            })}
        </div>
    );
};

// 2. Radar Chart (SVG)
const RadarChart = ({ data }: { data: { subject: string; value: number }[] }) => {
    const size = 200;
    const center = size / 2;
    const radius = size * 0.4;
    const angleStep = (Math.PI * 2) / data.length;

    const points = data.map((d, i) => {
        const value = d.value / 100; // Normalized 0-1
        const angle = i * angleStep - Math.PI / 2; // Start from top
        const x = center + radius * value * Math.cos(angle);
        const y = center + radius * value * Math.sin(angle);
        return `${x},${y}`;
    }).join(" ");

    const bgPoints = data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${x},${y}`;
    }).join(" ");

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Background Web */}
                <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeOpacity={0.1} />
                <circle cx={center} cy={center} r={radius * 0.6} fill="none" stroke="currentColor" strokeOpacity={0.1} />
                <circle cx={center} cy={center} r={radius * 0.3} fill="none" stroke="currentColor" strokeOpacity={0.1} />

                {data.map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="currentColor" strokeOpacity={0.1} />;
                })}

                {/* Data Polygon */}
                <polygon points={points} fill="rgba(124, 58, 237, 0.4)" stroke="rgba(124, 58, 237, 1)" strokeWidth="2" />

                {/* Labels */}
                {data.map((d, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const textRadius = radius + 20;
                    const x = center + textRadius * Math.cos(angle);
                    const y = center + textRadius * Math.sin(angle);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[10px] fill-muted-foreground uppercase font-bold"
                        >
                            {d.subject}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

// --- Main View ---

export function AnalyticsView() {
    const [stats, setStats] = useState<{ heatmap: Record<string, number>, radarData: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getAnalyticsData();
                setStats(data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return <GlassCard className="h-64 flex items-center justify-center"><Loader2 className="animate-spin" /></GlassCard>;
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Heatmap Card */}
            <GlassCard className="p-6 col-span-1 md:col-span-2 space-y-4" variant="static">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <Activity className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Consistency Graph</h3>
                        <p className="text-xs text-muted-foreground">Your study activity over the last 120 days</p>
                    </div>
                </div>
                <ActivityHeatmap data={stats.heatmap} />
            </GlassCard>

            {/* Radar Chart Card */}
            <GlassCard className="p-6 h-[320px] flex flex-col items-center justify-center relative">
                <div className="absolute top-6 left-6 flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Skill Analysis</h3>
                        <p className="text-xs text-muted-foreground">Your cognitive profile</p>
                    </div>
                </div>
                <div className="mt-8">
                    <RadarChart data={stats.radarData} />
                </div>
            </GlassCard>

            {/* Placeholder for 'Time Spent' or other metrics */}
            <GlassCard className="p-6 h-[320px] flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-lg text-muted-foreground">Total XP</h3>
                    <div className="text-5xl font-black text-white mt-2 tracking-tighter">
                        {Object.values(stats.heatmap).reduce((a, b) => a + b, 0) * 50}
                        <span className="text-lg text-purple-400 ml-2">XP</span>
                    </div>
                </div>
                <div className="text-sm text-white/40">
                    Estimated tracked experience points based on activity count.
                </div>
            </GlassCard>
        </div>
    );
}
