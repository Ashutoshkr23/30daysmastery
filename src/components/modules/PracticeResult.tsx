"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";
import { Trophy, RefreshCcw, ArrowRight, Zap, Target } from "lucide-react";
import { SessionStats } from "./PracticeRunner";

interface PracticeResultProps {
    stats: SessionStats;
    isPass: boolean; // For linear mode
    config?: { title: string; targetCount: number };
    onRetry: () => void;
    onNext?: () => void; // Only if passed linear
    onExit: () => void;
}

export function PracticeResult({ stats, isPass, config, onRetry, onNext, onExit }: PracticeResultProps) {
    return (
        <div className="w-full max-w-md mx-auto space-y-6 animate-in zoom-in-95 fade-in duration-500">

            <div className="text-center space-y-2">
                <div className={cn(
                    "mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-4 transition-all duration-1000",
                    isPass ? "bg-emerald-500/20 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]" : "bg-red-500/20 text-red-500"
                )}>
                    {isPass ? <Trophy className="h-10 w-10" /> : <RefreshCcw className="h-10 w-10" />}
                </div>
                <h2 className="text-3xl font-bold">{isPass ? "Excellent!" : "Keep Pushing"}</h2>
                <p className="text-muted-foreground">
                    {isPass ? "You have mastered this drill." : "Accuracy/Speed need improvement."}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4 flex flex-col items-center">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Score</span>
                    <span className="text-2xl font-bold">{stats.score}</span>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col items-center">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Accuracy</span>
                    <span className={cn("text-2xl font-bold", stats.accuracy >= 90 ? "text-emerald-400" : "text-amber-400")}>
                        {stats.accuracy}%
                    </span>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col items-center">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Speed</span>
                    <span className="text-2xl font-bold">{stats.speed} <span className="text-xs text-muted-foreground">s/q</span></span>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col items-center">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Time</span>
                    <span className="text-2xl font-bold">{stats.timeTaken}s</span>
                </GlassCard>
            </div>

            <div className="space-y-3 pt-4">
                <div className="flex gap-4">
                    <PremiumButton onClick={onRetry} variant="outline" className="flex-1">
                        <RefreshCcw className="mr-2 h-4 w-4" /> Retry
                    </PremiumButton>

                    {onNext && (
                        <PremiumButton
                            onClick={onNext}
                            className="flex-1"
                            variant={isPass ? "primary" : "secondary"}
                        >
                            {isPass ? "Next Drill" : "Skip to Next"} <ArrowRight className="ml-2 h-4 w-4" />
                        </PremiumButton>
                    )}
                </div>

                <PremiumButton onClick={onExit} variant="ghost" className="w-full text-muted-foreground hover:text-white">
                    Back to Lobby
                </PremiumButton>
            </div>
        </div>
    );
}
