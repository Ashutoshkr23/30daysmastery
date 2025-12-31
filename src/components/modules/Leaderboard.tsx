"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getLeaderboard, LeaderboardEntry } from "@/lib/actions/leaderboard";
import { Loader2, Medal, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
    courseId: string;
    dayId: number;
}

export function Leaderboard({ courseId, dayId }: LeaderboardProps) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getLeaderboard(courseId, dayId);
                setEntries(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [courseId, dayId]);

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;
    }

    if (entries.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground border border-white/5 rounded-xl bg-white/5">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                No champions yet in the arena. Be the first!
            </div>
        );
    }

    return (
        <div className="space-y-4 w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Daily Leaderboard
                </h3>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Top Gladiators</span>
            </div>

            <div className="space-y-2">
                {entries.map((entry) => (
                    <div
                        key={`${entry.user_id}-${entry.created_at}`}
                        className={cn(
                            "relative flex items-center p-4 rounded-xl border transition-all duration-300",
                            entry.rank === 1 ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-105 z-10" :
                                entry.rank === 2 ? "bg-slate-300/10 border-slate-300/40" :
                                    entry.rank === 3 ? "bg-orange-700/10 border-orange-700/40" :
                                        "bg-white/5 border-white/5 hover:bg-white/10"
                        )}
                    >
                        {/* Rank */}
                        <div className={cn(
                            "w-8 h-8 flex items-center justify-center font-bold rounded-full mr-4",
                            entry.rank <= 3 ? "text-white" : "text-muted-foreground"
                        )}>
                            {entry.rank === 1 ? <Medal className="h-6 w-6 text-amber-500" /> :
                                entry.rank === 2 ? <Medal className="h-6 w-6 text-slate-300" /> :
                                    entry.rank === 3 ? <Medal className="h-6 w-6 text-orange-700" /> :
                                        `#${entry.rank}`}
                        </div>

                        {/* User */}
                        <div className="flex-1 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold ring-2 ring-white/10">
                                {entry.avatar_url ? (
                                    <img src={entry.avatar_url} alt={entry.name} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    entry.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className={cn("text-sm font-semibold", entry.rank === 1 ? "text-amber-200" : "text-foreground")}>
                                    {entry.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(entry.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right flex items-center gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-white">{entry.score} pts</span>
                                <span className="text-xs text-muted-foreground">{entry.accuracy}% Acc</span>
                            </div>
                            <div className="flex flex-col items-end min-w-[60px]">
                                <span className="text-sm font-mono text-emerald-400">{entry.time_taken}s</span>
                                <span className="text-xs text-muted-foreground">Time</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
