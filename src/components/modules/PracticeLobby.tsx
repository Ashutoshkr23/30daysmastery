"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";
import { Play, Lock, Settings2, Clock, Zap, Heart } from "lucide-react";
import { DayConfig, TaskConfig } from "@/lib/generators";

interface PracticeLobbyProps {
    config: DayConfig;
    isLinearComplete: boolean;
    onStartLinear: (taskIndex: number) => void;
    onStartCustom: (settings: CustomSettings) => void;
    attempts: any[];
}

export interface CustomSettings {
    generatorId: string;
    mode: "TIME" | "SURVIVAL";
    value: number; // Seconds or Lives
}

export function PracticeLobby({ config, isLinearComplete, onStartLinear, onStartCustom, attempts }: PracticeLobbyProps) {
    const [activeTab, setActiveTab] = useState<"LINEAR" | "CUSTOM">("LINEAR");

    // Custom Settings State
    const [selectedGen, setSelectedGen] = useState(config.unlockedGenerators[0]);
    const [customMode, setCustomMode] = useState<"TIME" | "SURVIVAL">("TIME");
    const [timeLimit, setTimeLimit] = useState(60); // 1 min default

    // Always default linear completion to false for now until we have better tracking
    // For MVP, we'll assume linear path needs to be done linearly in session or tracked externally
    // But UI should reflect "Linear" tab first.

    // Helper to get Best Score for a task
    const getBestScore = (taskId: string) => {
        if (!attempts) return null;
        const taskHistory = attempts.filter((h: any) => h.task_id === taskId);
        if (taskHistory.length === 0) return null;
        return Math.max(...taskHistory.map((h: any) => h.score));
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                    {config.title}
                </h2>
                <p className="text-muted-foreground">Choose your training protocol</p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => setActiveTab("LINEAR")}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-bold transition-all",
                        activeTab === "LINEAR"
                            ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                            : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                    )}
                >
                    Standard Protocol
                </button>
                <button
                    onClick={() => setActiveTab("CUSTOM")}
                    disabled={!isLinearComplete}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                        activeTab === "CUSTOM"
                            ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                            : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50",
                        !isLinearComplete && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {!isLinearComplete && <Lock className="h-3 w-3" />}
                    Custom Gym
                </button>
            </div>

            {/* TAB CONTENT: LINEAR */}
            {activeTab === "LINEAR" && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {config.linearTasks.map((task, idx) => (
                        <GlassCard
                            key={task.id}
                            variant="interactive"
                            className="p-6 flex flex-col justify-between group h-full"
                        >
                            <div className="space-y-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight mb-1">{task.title}</h3>
                                    <p className="text-xs text-muted-foreground">{task.description}</p>
                                </div>
                                <div className="text-xs font-mono text-primary/80 bg-primary/5 px-2 py-1 rounded w-fit">
                                    Target: {task.targetCount} Reps
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5">
                                <PremiumButton
                                    onClick={() => onStartLinear(idx)}
                                    className="w-full"
                                    size="sm"
                                >
                                    Start Task
                                </PremiumButton>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* TAB CONTENT: CUSTOM */}
            {activeTab === "CUSTOM" && (
                <GlassCard className="p-8 max-w-2xl mx-auto space-y-8">
                    <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4 mb-6">
                        <Settings2 className="h-6 w-6 text-amber-500" />
                        <h3 className="text-xl font-bold">Configure Session</h3>
                    </div>

                    {/* Generator Select */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Exercise Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {config.unlockedGenerators.map(genId => (
                                <button
                                    key={genId}
                                    onClick={() => setSelectedGen(genId)}
                                    className={cn(
                                        "p-3 rounded-lg text-sm border transition-all text-left",
                                        selectedGen === genId
                                            ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                                            : "border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10"
                                    )}
                                >
                                    {genId.replace(/_/g, " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mode Select */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Challenge Mode</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setCustomMode("TIME")}
                                className={cn(
                                    "flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                    customMode === "TIME"
                                        ? "border-blue-500/50 bg-blue-500/10 text-blue-200"
                                        : "border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10"
                                )}
                            >
                                <Clock className="h-6 w-6" />
                                <span className="font-bold">Time Attack</span>
                            </button>
                            <button
                                onClick={() => setCustomMode("SURVIVAL")}
                                className={cn(
                                    "flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                    customMode === "SURVIVAL"
                                        ? "border-red-500/50 bg-red-500/10 text-red-200"
                                        : "border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10"
                                )}
                            >
                                <Heart className="h-6 w-6" />
                                <span className="font-bold">Survival (3 Lives)</span>
                            </button>
                        </div>
                    </div>

                    {/* Logic for Mode Settings */}
                    {customMode === "TIME" && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Time Limit: {timeLimit}s</label>
                            <input
                                type="range"
                                min="30"
                                max="300"
                                step="30"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(Number(e.target.value))}
                                className="w-full accent-blue-500 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>30s</span>
                                <span>5m</span>
                            </div>
                        </div>
                    )}

                    <PremiumButton
                        size="lg"
                        className="w-full"
                        onClick={() => onStartCustom({
                            generatorId: selectedGen,
                            mode: customMode,
                            value: customMode === "TIME" ? timeLimit : 3
                        })}
                    >
                        Enter Gym <Play className="ml-2 h-4 w-4" />
                    </PremiumButton>

                </GlassCard>
            )}

            {/* Recent History Table */}
            <div className="mt-12 border-t border-white/10 pt-8">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Recent Attempts</h3>
                <div className="space-y-2">
                    {attempts && attempts.slice(0, 5).map((entry: any) => (
                        <div key={entry.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg text-sm">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-2 h-2 rounded-full", entry.passed ? "bg-emerald-500" : "bg-red-500")} />
                                <span className="font-mono text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</span>
                                <span className="font-medium text-foreground">{entry.task_id ? entry.task_id.replace(/_/g, ' ') : entry.course_id}</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-bold">{entry.score} pts</span>
                                <span className={cn(entry.passed ? "text-emerald-400" : "text-red-400")}>{entry.passed ? "PASSED" : "FAILED"}</span>
                            </div>
                        </div>
                    ))}
                    {(!attempts || attempts.length === 0) && <p className="text-muted-foreground italic text-sm">No recent attempts found.</p>}
                </div>
            </div>

        </div>
    );
}
