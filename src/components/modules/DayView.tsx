"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";
import { Play, BookOpen, Calculator, Trophy, CheckCircle2, Lock } from "lucide-react";
import { PracticeSession } from "./PracticeSession";
import { CompetitionArena } from "./CompetitionArena";
import { Leaderboard } from "./Leaderboard";
import { updateDailyProgress } from "@/lib/actions/progress";

interface DayData {
    day: number;
    title: string;
    video: { youtubeId: string; title: string };
    notes: { content: string };
    practice: { questions: any[] };
    compete: { targetScore: number };
}

interface DayViewProps {
    day: DayData;
    initialProgress: any; // Using any for simplicity for now, strict type coming later
}

// Tab Definition
const TABS = [
    { id: "watch", label: "Watch", icon: Play },
    { id: "study", label: "Study", icon: BookOpen },
    { id: "practice", label: "Practice", icon: Calculator },
    { id: "compete", label: "Compete", icon: Trophy },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DayView({ day, initialProgress }: DayViewProps) {
    // Determine initial tab: Watch -> Study -> Practice -> Compete
    const getInitialTab = () => {
        if (!initialProgress) return "watch";
        if (!initialProgress.video_watched) return "watch";
        if (!initialProgress.notes_read) return "study";
        // If practice score is high enough (>=80), default to compete, else practice
        // We don't have exact score logic mirrored here fully yet, checking raw score > 0 as proxy or relying on user
        // But let's stick to sequence.
        if (initialProgress.practice_score < 80) return "practice";
        return "compete";
    };

    const [activeTab, setActiveTab] = useState<TabId>(getInitialTab());
    // Also init passed state
    const [isPracticePassed, setIsPracticePassed] = useState(
        (initialProgress?.practice_score || 0) >= 80
    );

    console.log("DayView Debug:", {
        initialProgress,
        practice_score: initialProgress?.practice_score,
        isPracticePassed,
        check: (initialProgress?.practice_score || 0) >= 80
    });

    const handleProgressUpdate = async (type: 'video' | 'notes' | 'practice', data: any) => {
        try {
            await updateDailyProgress('speed-maths', day.day, data);

            // Local state updates for UI flow
            if (type === 'video') setActiveTab('study');
            if (type === 'notes') setActiveTab('practice');
            if (type === 'practice' && data.practice_score >= 80) setIsPracticePassed(true);

        } catch (error) {
            console.error("Failed to save progress", error);
            // Optionally show toast
        }
    };

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
                            <PremiumButton onClick={() => handleProgressUpdate('video', { video_watched: true })}>
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
                            <PremiumButton onClick={() => handleProgressUpdate('notes', { notes_read: true })}>
                                Mark Read & Start Practice
                            </PremiumButton>
                        </div>
                    </div>
                )}

                {activeTab === "practice" && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <PracticeSession
                            dayId={day.day}
                            onComplete={(success, accuracy) => {
                                if (success) {
                                    handleProgressUpdate('practice', { practice_score: accuracy });
                                }
                            }}
                        />
                    </div>
                )}

                {activeTab === "compete" && (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Trophy className="h-6 w-6 text-amber-400" />
                            Phase 4: The Arena
                        </h2>

                        {!isPracticePassed ? (
                            <div className="p-12 text-center border border-yellow-500/20 rounded-2xl bg-yellow-500/5 space-y-4">
                                <Lock className="h-12 w-12 text-amber-500/50 mx-auto" />
                                <h3 className="text-xl font-semibold text-amber-200">Locked Until Practice Complete</h3>
                                <p className="text-muted-foreground">
                                    You must score at least 80% accuracy in Practice to enter the Arena.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* The Arena - Main Stage */}
                                <div className="flex-1">
                                    <CompetitionArena
                                        dayId={day.day}
                                        onComplete={() => {
                                            handleProgressUpdate('practice', { compete_score: 100 }); // Mark comp complete
                                        }}
                                    />
                                </div>

                                {/* Leaderboard - Sidebar */}
                                <div className="w-full lg:w-96">
                                    <Leaderboard courseId="speed-maths" dayId={day.day} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </GlassCard>
        </div>
    );
}
