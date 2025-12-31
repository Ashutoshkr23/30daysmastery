"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";
import { Play, BookOpen, Calculator, Trophy, CheckCircle2, Lock } from "lucide-react";

interface DayData {
    day: number;
    title: string;
    video: { youtubeId: string; title: string };
    notes: { content: string };
    practice: { questions: any[] };
    compete: { targetScore: number };
}

// Tab Definition
const TABS = [
    { id: "watch", label: "Watch", icon: Play },
    { id: "study", label: "Study", icon: BookOpen },
    { id: "practice", label: "Practice", icon: Calculator },
    { id: "compete", label: "Compete", icon: Trophy },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DayView({ day }: { day: DayData }) {
    const [activeTab, setActiveTab] = useState<TabId>("watch");

    return (
        <div className="space-y-6">
            {/* 1. Progress / Tab Navigation */}
            <div className="grid grid-cols-4 gap-2 md:gap-4">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group",
                                isActive
                                    ? "bg-primary/20 border-primary/50 shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                                    : "bg-secondary/20 border-border/50 hover:bg-secondary/40"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "h-6 w-6 mb-2 transition-transform duration-300",
                                    isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-xs font-bold uppercase tracking-wider",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {tab.label}
                            </span>

                            {/* Active Indicator Line */}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary shadow-[0_0_10px_currentColor] animate-in fade-in slide-in-from-bottom-2" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 2. Content Area (Dynamic) */}
            <GlassCard className="min-h-[500px] p-6 md:p-8 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[128px] -z-10" />

                {activeTab === "watch" && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Play className="h-6 w-6 text-primary" />
                            Phase 1: Conceptual Clarity
                        </h2>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${day.video.youtubeId}`}
                                title={day.video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 z-10"
                            />
                        </div>
                        <div className="flex justify-end">
                            <PremiumButton onClick={() => setActiveTab('study')}>
                                Mark Watched & Continue
                            </PremiumButton>
                        </div>
                    </div>
                )}

                {activeTab === "study" && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <BookOpen className="h-6 w-6 text-indigo-400" />
                            Phase 2: Deep Dive Notes
                        </h2>
                        <div className="prose prose-invert max-w-none bg-secondary/30 p-6 rounded-xl border border-white/5">
                            {/* In real app, use a Markdown renderer like react-markdown */}
                            <pre className="whitespace-pre-wrap font-sans text-muted-foreground">
                                {day.notes.content}
                            </pre>
                        </div>
                        <div className="flex justify-end">
                            <PremiumButton onClick={() => setActiveTab('practice')}>
                                Mark Read & Start Practice
                            </PremiumButton>
                        </div>
                    </div>
                )}

                {activeTab === "practice" && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Calculator className="h-6 w-6 text-emerald-400" />
                            Phase 3: Skill Building
                        </h2>
                        <div className="p-12 text-center border border-dashed border-white/20 rounded-2xl bg-white/5 space-y-4">
                            <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                                <Calculator className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold">Ready to test your speed?</h3>
                            <p className="text-muted-foreground">
                                You have {day.practice.questions.length} questions lined up.
                                <br />
                                Accuracy is key. Speed will follow.
                            </p>
                            <PremiumButton size="lg" className="w-full max-w-sm">
                                Start Practice Session
                            </PremiumButton>
                        </div>
                    </div>
                )}

                {activeTab === "compete" && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Trophy className="h-6 w-6 text-amber-400" />
                            Phase 4: The Arena
                        </h2>
                        <div className="p-12 text-center border border-yellow-500/20 rounded-2xl bg-yellow-500/5 space-y-4">
                            <Lock className="h-12 w-12 text-amber-500/50 mx-auto" />
                            <h3 className="text-xl font-semibold text-amber-200">Locked Until Practice Complete</h3>
                            <p className="text-muted-foreground">
                                You must score at least 80% in Practice to enter the Arena.
                            </p>
                        </div>
                    </div>
                )}

            </GlassCard>
        </div>
    );
}
