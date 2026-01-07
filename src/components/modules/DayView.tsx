"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { BookOpen, Calculator, Trophy, Lock } from "lucide-react";
import { PracticeSession } from "./PracticeSession";
import { CompetitionArena } from "./CompetitionArena";
import { Leaderboard } from "./Leaderboard";
import { StudyCardDeck } from "./StudyCardDeck";
import { updateDailyProgress } from "@/lib/actions/progress";
import { useProgressStore } from "@/store/progress-store";
import { UpgradeModal } from "@/components/monetization/UpgradeModal";
import { createClient } from "@/lib/supabase/client";

// Updated Interface matching new JSON Key

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
        } | {
            title: string;
            description: string;
            example?: {
                problem: string;
                solution: string;
                steps: string;
            };
        }[];
        rote: {
            title: string;
            groups?: Array<{
                title: string;
                items: Array<{ q: string; a: string }>;
            }>;
            items?: Array<{ front: string; back: string }>;
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
    const [isLinearComplete, setIsLinearComplete] = useState(true);

    const handleProgressUpdate = async (type: 'notes' | 'practice', data: any) => {
        try {
            // Optimistic UI Update: Move to next tab immediately
            if (type === 'notes') setActiveTab('practice');

            await updateDailyProgress('speed-maths', day.day, data);
        } catch (error) {
            console.error("Failed to save progress", error);
        }
    };

    // FREEMIUM LOGIC
    const [isPremium, setIsPremium] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        const checkPremium = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single();
                if (data?.is_premium) setIsPremium(true);
            }
        };
        checkPremium();
    }, []);

    const isLockedDay = day.day > 3 && !isPremium;

    return (
        <div className="space-y-6">
            <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
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
            <GlassCard
                className={cn(
                    "min-h-[600px] relative overflow-hidden transition-all duration-300",
                    activeTab === "study" && !isLockedDay
                        ? "-mx-4 w-[calc(100%+2rem)] rounded-none p-0 bg-transparent border-0 shadow-none md:mx-0 md:w-full md:rounded-3xl md:p-8 md:bg-white/5 md:border-white/10 md:shadow-lg md:backdrop-blur-md"
                        : "p-6 md:p-8"
                )}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[128px] -z-10" />

                {/* PREMIUM LOCK OVERLAY */}
                {isLockedDay && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-center p-8 space-y-6">
                        <div className="p-4 bg-amber-500/20 rounded-full ring-4 ring-amber-500/10 animate-pulse">
                            <Lock className="h-12 w-12 text-amber-500" />
                        </div>
                        <div className="max-w-md space-y-2">
                            <h2 className="text-2xl font-bold text-amber-500">Premium Content</h2>
                            <p className="text-muted-foreground">
                                Day {day.day} is locked. Upgrade to unlock the full 30-day mastery course.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-black shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
                        >
                            Unlock Full Access for ₹99
                        </button>
                    </div>
                )}

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
                            onLinearComplete={() => setIsLinearComplete(true)}
                        />
                    </div>
                )}

                {activeTab === "compete" && (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Trophy className="h-6 w-6 text-amber-400" />
                            Phase 4: The Arena
                        </h2>

                        {!isPremium ? (
                            <div className="p-12 text-center border border-amber-500/20 rounded-2xl bg-amber-500/5 space-y-4">
                                <Lock className="h-12 w-12 text-amber-500/50 mx-auto" />
                                <h3 className="text-xl font-semibold text-amber-200">Premium Feature</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    The Competition Arena is available only for Premium members.
                                </p>
                                <button
                                    onClick={() => setShowUpgradeModal(true)}
                                    className="mt-4 px-6 py-2 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/50 font-bold hover:bg-amber-500 hover:text-black transition-all"
                                >
                                    Upgrade to Unlock
                                </button>
                            </div>
                        ) : !isLinearComplete ? (
                            <div className="p-12 text-center border border-yellow-500/20 rounded-2xl bg-yellow-500/5 space-y-4">
                                <Lock className="h-12 w-12 text-amber-500/50 mx-auto" />
                                <h3 className="text-xl font-semibold text-amber-200">Locked Until Speed Drill Complete</h3>
                                <p className="text-muted-foreground">
                                    Complete all Speed Drill tasks in the Standard Protocol to unlock the Arena.
                                </p>
                            </div>
                        ) : (
                            <div className="w-full max-w-4xl mx-auto">
                                <CompetitionArena
                                    dayId={day.day}
                                    onComplete={() => {
                                        handleProgressUpdate('practice', { compete_score: 100 });
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
