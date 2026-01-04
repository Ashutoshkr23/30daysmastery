"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { BookOpen, Calculator, Trophy, Lock } from "lucide-react";
import { PracticeSession } from "./PracticeSession";
import { CompetitionArena } from "./CompetitionArena";
import { Leaderboard } from "./Leaderboard";
import { StudyCardDeck } from "./StudyCardDeck";
import { updateDailyProgress } from "@/lib/actions/progress";
import { useProgressStore } from "@/store/progress-store";

// Updated Interface matching new JSON Key
interface DayData {
    day: number;
    title: string;
    content: {
        concept: {
            title: string;
            description: string;
            example?: {
                problem: string;
                solution: string;
                steps: string;
            };
        };
        rote: {
            title: string;
            groups: Array<{
                title: string;
                items: Array<{ q: string; a: string }>;
            }>;
        };
    };
    practice: { questions: any[] };
    compete: { targetScore: number };
}

interface DayViewProps {
    day: any; // Type assertion handled in component due to JSON variability during migration
    initialProgress: any;
}

// Tab Definition
const TABS = [
    { id: "study", label: "Study Protocol", icon: BookOpen },
    { id: "practice", label: "Speed Drill", icon: Calculator },
    { id: "compete", label: "The Arena", icon: Trophy },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DayView({ day, initialProgress }: DayViewProps) {
    const getInitialTab = () => {
        if (!initialProgress) return "study";
        if (!initialProgress.notes_read) return "study";
        if (initialProgress.practice_score < 80) return "practice";
        return "compete";
    };

    const [activeTab, setActiveTab] = useState<TabId>(getInitialTab());
    const [isPracticePassed, setIsPracticePassed] = useState(
        (initialProgress?.practice_score || 0) >= 80
    );

    const handleProgressUpdate = async (type: 'notes' | 'practice', data: any) => {
        try {
            // Optimistic UI Update: Move to next tab immediately
            if (type === 'notes') setActiveTab('practice');
            if (type === 'practice' && data.practice_score >= 80) setIsPracticePassed(true);

            await updateDailyProgress('speed-maths', day.day, data);
        } catch (error) {
            console.error("Failed to save progress", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. Progress / Tab Navigation */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
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
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary shadow-[0_0_10px_currentColor] animate-in fade-in slide-in-from-bottom-2" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 2. Content Area */}
            <GlassCard className="min-h-[600px] p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[128px] -z-10" />

                {activeTab === "study" && (
                    <StudyCardDeck
                        content={day.content}
                        onComplete={() => handleProgressUpdate('notes', { notes_read: true })}
                    />
                )}

                {activeTab === "practice" && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Calculator className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Speed Drill</h2>
                                <p className="text-sm text-muted-foreground">Test your reflexes</p>
                            </div>
                        </div>
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
                                <h3 className="text-xl font-semibold text-amber-200">Locked Until Speed Drill Complete</h3>
                                <p className="text-muted-foreground">
                                    You must score at least 80% accuracy in the Speed Drill to enter the Arena.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1">
                                    <CompetitionArena
                                        dayId={day.day}
                                        onComplete={() => {
                                            handleProgressUpdate('practice', { compete_score: 100 });
                                        }}
                                    />
                                </div>
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
